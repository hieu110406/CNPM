import { query } from "../db/database.js";

export async function getOverview(req, res) {
    try {
        const [total, completed, byLang, topPois, audioCount, poiCount, adminCount] = await Promise.all([
            query(`SELECT COUNT(*)::int AS c FROM usage_log`),
            query(`SELECT COUNT(*)::int AS c FROM usage_log WHERE completed = TRUE`),
            query(`SELECT language_code, COUNT(*)::int AS c FROM usage_log GROUP BY language_code`),
            query(`SELECT p.name, COUNT(*)::int AS plays FROM usage_log u JOIN poi p ON p.poi_id = u.poi_id GROUP BY p.poi_id, p.name ORDER BY plays DESC LIMIT 5`),
            query(`SELECT COUNT(*)::int AS c FROM audio_track WHERE status='published'`),
            query(`SELECT COUNT(*)::int AS c FROM poi`),
            query(`SELECT COUNT(*)::int AS c FROM admin_account`),
        ]);

        const totalPlays = total.rows[0].c;
        const totalLang = byLang.rows.reduce((s, r) => s + r.c, 0) || 1;
        const languageDist = { vi: 0, en: 0, zh: 0 };
        byLang.rows.forEach((r) => (languageDist[r.language_code] = Math.round((r.c / totalLang) * 100)));

        return res.json({
            totalPlays,
            completedRate: Math.round((completed.rows[0].c / (totalPlays || 1)) * 100),
            languageDist,
            topPois: topPois.rows,
            totalAudioPublished: audioCount.rows[0].c,
            totalPois: poiCount.rows[0].c,
            totalAdmins: adminCount.rows[0].c,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}