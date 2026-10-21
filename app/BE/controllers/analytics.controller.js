import { query } from "../db/database.js";

/* ============================================================
   IN-MEMORY SESSION STORE — không cần bảng DB mới
   User FE ping mỗi 30s; session tự expire sau 90s không ping
   ============================================================ */
const SESSION_TIMEOUT_MS = 90_000;
const sessions = new Map(); // Map<sessionId, { language, currentPoi, device, lastSeen }>

function cleanupSessions() {
    const cutoff = Date.now() - SESSION_TIMEOUT_MS;
    for (const [id, s] of sessions) {
        if (s.lastSeen < cutoff) sessions.delete(id);
    }
}

/* ---- Analytics: Tổng quan ---- */
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

        // Đính kèm luôn số user online từ in-memory store
        cleanupSessions();

        return res.json({
            totalPlays,
            completedRate: Math.round((completed.rows[0].c / (totalPlays || 1)) * 100),
            languageDist,
            topPois: topPois.rows,
            totalAudioPublished: audioCount.rows[0].c,
            totalPois: poiCount.rows[0].c,
            totalAdmins: adminCount.rows[0].c,
            onlineUsers: sessions.size,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}

/* ---- Session: Ping (public) ---- */
export function pingSession(req, res) {
    const { sessionId, language = "vi", currentPoi = null, device = "web" } = req.body || {};
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 64) {
        return res.status(400).json({ error: "sessionId không hợp lệ" });
    }
    cleanupSessions();
    sessions.set(sessionId, { language, currentPoi, device, lastSeen: Date.now() });
    return res.json({ ok: true, online: sessions.size });
}

/* ---- Session: Remove (public — beforeunload) ---- */
export function removeSession(req, res) {
    sessions.delete(req.params.sessionId);
    cleanupSessions();
    return res.json({ ok: true, online: sessions.size });
}

/* ---- Session: Danh sách user online (admin only) ---- */
export function getActiveSessions(req, res) {
    cleanupSessions();

    const byLanguage = {};
    const byDevice   = {};
    const byPoi      = {};
    const list       = [];

    for (const [id, s] of sessions) {
        byLanguage[s.language] = (byLanguage[s.language] || 0) + 1;
        byDevice[s.device]     = (byDevice[s.device]     || 0) + 1;
        if (s.currentPoi) byPoi[s.currentPoi] = (byPoi[s.currentPoi] || 0) + 1;
        list.push({
            sessionId:  id.slice(0, 8) + "…",
            language:   s.language,
            currentPoi: s.currentPoi,
            device:     s.device,
            idleSec:    Math.round((Date.now() - s.lastSeen) / 1000),
        });
    }

    return res.json({
        total:      sessions.size,
        sessions:   list.sort((a, b) => a.idleSec - b.idleSec),
        byLanguage: Object.entries(byLanguage).map(([lang, c]) => ({ lang, c })).sort((a, b) => b.c - a.c),
        byDevice:   Object.entries(byDevice).map(([device, c]) => ({ device, c })).sort((a, b) => b.c - a.c),
        byPoi:      Object.entries(byPoi).map(([poi, c]) => ({ poi, c })).sort((a, b) => b.c - a.c).slice(0, 10),
    });
}