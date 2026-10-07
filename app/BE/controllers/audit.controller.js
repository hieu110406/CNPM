import { query } from "../db/database.js";

export async function listAudit(req, res) {
    try {
        const { rows } = await query(`SELECT * FROM audit_log ORDER BY log_id DESC LIMIT 100`);
        return res.json(rows.map((r) => ({
            id: r.log_id,
            admin: r.admin_name,
            type: r.type,
            event: r.event,
            detail: r.detail,
            time: r.created_at,
        })));
    } catch (e) {
        return res.status(500).json({ error: "Lỗi server" });
    }
}