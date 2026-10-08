import { query } from "../db/database.js";

export async function listAdmins(req, res) {
    try {
        const { rows } = await query(
            `SELECT admin_id, name, email, status, mfa_enabled, last_login FROM admin_account ORDER BY admin_id`
        );
        return res.json(rows.map((a) => ({
            id: `AD-${String(a.admin_id).padStart(3, "0")}`,
            dbId: a.admin_id,
            name: a.name,
            email: a.email,
            role: "admin",
            mfa: a.mfa_enabled,
            status: a.status,
            lastLogin: a.last_login ? new Date(a.last_login).toISOString() : "—",
        })));
    } catch (e) {
        return res.status(500).json({ error: "Lỗi server" });
    }
}

export async function deactivateAdmin(req, res) {
    try {
        await query(`UPDATE admin_account SET status='deactivated' WHERE admin_id=$1`, [req.params.id]);
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: "Lỗi server" });
    }
}