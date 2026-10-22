import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/database.js";

const LOCK_MINUTES = 15;
const MAX_FAILED = 5;

async function logAudit(adminId, name, type, event, detail) {
    await query(
        `INSERT INTO audit_log (admin_id, admin_name, type, event, detail) VALUES ($1, $2, $3, $4, $5)`,
        [adminId, name, type, event, detail]
    );
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const { rows } = await query(`SELECT * FROM admin_account WHERE email = $1`, [email]);
        const admin = rows[0];

        if (!admin) return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
        if (admin.status === "deactivated")
            return res.status(403).json({ error: "Tài khoản đã bị vô hiệu hoá" });

        if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
            await logAudit(admin.admin_id, admin.name, "lock", "Đăng nhập khi đang bị khoá", email);
            return res.status(423).json({ error: `Tài khoản đang bị khoá đến ${admin.locked_until}` });
        }

        const ok = bcrypt.compareSync(password, admin.password_hash);
        if (!ok) {
            const attempts = admin.failed_attempts + 1;
            if (attempts >= MAX_FAILED) {
                const until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
                await query(
                    `UPDATE admin_account SET failed_attempts = $1, is_locked = TRUE, locked_until = $2, status = 'locked' WHERE admin_id = $3`,
                    [attempts, until, admin.admin_id]
                );
                await logAudit(admin.admin_id, admin.name, "failed", "Khoá tài khoản 15 phút", `Lần thử ${attempts}`);
                return res.status(423).json({ error: "Quá nhiều lần sai. Tài khoản bị khoá 15 phút." });
            }
            await query(`UPDATE admin_account SET failed_attempts = $1 WHERE admin_id = $2`, [attempts, admin.admin_id]);
            await logAudit(admin.admin_id, admin.name, "failed", "Sai mật khẩu", `Lần ${attempts}`);
            return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
        }

        await query(`UPDATE admin_account SET failed_attempts = 0 WHERE admin_id = $1`, [admin.admin_id]);
        const accessToken = jwt.sign(
            { adminId: admin.admin_id, email: admin.email, name: admin.name, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );
        const refreshToken = jwt.sign(
            { adminId: admin.admin_id, type: "refresh" },
            process.env.JWT_SECRET,
            { expiresIn: process.env.REFRESH_EXPIRES }
        );

        await query(`UPDATE admin_account SET last_login = NOW() WHERE admin_id = $1`, [admin.admin_id]);
        await logAudit(admin.admin_id, admin.name, "success", "Đăng nhập thành công", admin.email);

        return res.json({
            accessToken,
            refreshToken,
            admin: { id: admin.admin_id, name: admin.name, email: admin.email, role: "Admin" },
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}

export function me(req, res) {
    return res.json({ admin: req.admin });
}

export async function logout(req, res) {
    await logAudit(req.admin.adminId, req.admin.name, "change", "Đăng xuất", "");
    return res.json({ ok: true });
}