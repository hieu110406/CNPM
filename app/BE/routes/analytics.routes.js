import { Router } from "express";
import { getOverview } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
r.get("/overview", requireAuth, getOverview);
export default r;

router.get("/top-popular", async (req, res) => {
    const lang = req.query.lang || "vi";
    try {
        const { rows } = await query(`
            SELECT p.code AS id, p.emoji, p.zone, COALESCE(t.name, p.name) AS name, COUNT(u.usage_id)::int AS plays
            FROM usage_log u
            JOIN poi p ON u.poi_id = p.poi_id
            LEFT JOIN poi_translation t ON p.poi_id = t.poi_id AND t.language_code = $1
            GROUP BY p.poi_id, p.code, p.emoji, p.zone, t.name
            HAVING COUNT(u.usage_id) > 0
            ORDER BY plays DESC LIMIT 5
        `, [lang]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Lấy danh sách Categories (Bộ lọc theo PRD UC1)
router.get("/categories", async (req, res) => {
    try {
        const { rows } = await query(`
            SELECT c.category_id AS id, c.name, COUNT(p.poi_id)::int AS poi_count
            FROM category c
            LEFT JOIN poi p ON c.category_id = p.category_id AND p.is_active = TRUE
            GROUP BY c.category_id, c.name
            ORDER BY c.category_id ASC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});