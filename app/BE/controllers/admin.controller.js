import bcrypt from "bcryptjs";
import { query } from "../db/database.js";

export async function listAdmins(req, res) {
    try {
        const { rows } = await query(
            `SELECT admin_id, name, email, status, mfa_enabled, last_login
       FROM admin_account ORDER BY admin_id`
        );
        return res.json(rows.map((a) => ({
            id: `AD-${String(a.admin_id).padStart(3, "0")}`,
            dbId: a.admin_id,
            name: a.name,
            email: a.email,
            role: "admin",
            mfa: a.mfa_enabled,
            status: a.status,
            lastLogin: a.last_login
                ? new Date(a.last_login).toLocaleString("vi-VN")
                : "—",
        })));
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}

export async function createAdmin(req, res) {
    try {
        const { name, email, password, mfa } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Mật khẩu tối thiểu 6 ký tự" });
        }

        const emailNorm = email.trim().toLowerCase();
        const existing = await query(
            `SELECT admin_id FROM admin_account WHERE email = $1`,
            [emailNorm]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Email đã tồn tại trong hệ thống" });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        const { rows } = await query(`
      INSERT INTO admin_account (name, email, password_hash, role_id, mfa_enabled, status)
      VALUES ($1, $2, $3, 1, $4, 'active')
      RETURNING admin_id, name, email, status, mfa_enabled, last_login
    `, [name.trim(), emailNorm, passwordHash, !!mfa]);

        await query(`
      INSERT INTO audit_log (admin_id, admin_name, type, event, detail)
      VALUES ($1, $2, 'change', 'Tạo tài khoản Admin mới', $3)
    `, [req.admin.adminId, req.admin.name, emailNorm]);

        const a = rows[0];
        return res.json({
            id: `AD-${String(a.admin_id).padStart(3, "0")}`,
            dbId: a.admin_id,
            name: a.name,
            email: a.email,
            role: "admin",
            mfa: a.mfa_enabled,
            status: a.status,
            lastLogin: "—",
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}

export async function deactivateAdmin(req, res) {
    try {
        const { id } = req.params;
        await query(
            `UPDATE admin_account SET status='deactivated' WHERE admin_id=$1`,
            [id]
        );
        await query(`
      INSERT INTO audit_log (admin_id, admin_name, type, event, detail)
      VALUES ($1, $2, 'lock', 'Vô hiệu hoá tài khoản Admin', $3)
    `, [req.admin.adminId, req.admin.name, `admin_id=${id}`]);

        return res.json({ ok: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}
export async function updateAdmin(req, res) {
    try {
        const { id } = req.params;
        const { name, email, mfa, status } = req.body;

        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({ error: "Thiếu tên hoặc email" });
        }

        // Kiểm tra email trùng với tài khoản KHÁC
        const dup = await query(
            `SELECT admin_id FROM admin_account WHERE email = $1 AND admin_id != $2`,
            [email.trim().toLowerCase(), id]
        );
        if (dup.rows.length > 0) {
            return res.status(409).json({ error: "Email đã được dùng bởi tài khoản khác" });
        }

        const { rows } = await query(`
      UPDATE admin_account
      SET name = $1, email = $2, mfa_enabled = $3, status = $4
      WHERE admin_id = $5
      RETURNING admin_id, name, email, status, mfa_enabled, last_login
    `, [name.trim(), email.trim().toLowerCase(), !!mfa, status || "active", id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy tài khoản" });
        }

        // Audit log
        await query(`
      INSERT INTO audit_log (admin_id, admin_name, type, event, detail)
      VALUES ($1, $2, 'change', 'Cập nhật tài khoản Admin', $3)
    `, [req.admin.adminId, req.admin.name, `admin_id=${id}`]);

        const a = rows[0];
        return res.json({
            id: `AD-${String(a.admin_id).padStart(3, "0")}`,
            dbId: a.admin_id,
            name: a.name,
            email: a.email,
            role: "admin",
            mfa: a.mfa_enabled,
            status: a.status,
            lastLogin: a.last_login
                ? new Date(a.last_login).toLocaleString("vi-VN")
                : "—",
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}