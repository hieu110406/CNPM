
import { query } from "../db/database.js";

const SESSION_TIMEOUT_MS = 120_000;

// ==================== SESSION HELPERS ====================

async function cleanupSessions() {
    await query(`
        DELETE FROM online_session
        WHERE last_seen < NOW() - ($1 * INTERVAL '1 millisecond')
    `, [SESSION_TIMEOUT_MS]);
}

// ==================== ANALYTICS: TỔNG QUAN ====================

export async function getOverview(req, res) {
    try {
        const { from, to } = req.query;

        // Bộ lọc thống kê lượt nghe audio
        const usageParams = [];
        const usageFilters = [];

        if (from) {
            usageParams.push(from);
            usageFilters.push(
                `played_at >= $${usageParams.length}::date`
            );
        }

        if (to) {
            usageParams.push(to);
            usageFilters.push(
                `played_at < ($${usageParams.length}::date + INTERVAL '1 day')`
            );
        }

        const usageWhere = usageFilters.length
            ? `WHERE ${usageFilters.join(" AND ")}`
            : "";

        const completedWhere = usageFilters.length
            ? `${usageWhere} AND completed = TRUE`
            : "WHERE completed = TRUE";

        // Bộ lọc riêng cho lượt tải ZIP.
        // package_download sử dụng downloaded_at,
        // không phải played_at.
        const downloadParams = [];
        const downloadFilters = [];

        if (from) {
            downloadParams.push(from);
            downloadFilters.push(
                `downloaded_at >= $${downloadParams.length}::date`
            );
        }

        if (to) {
            downloadParams.push(to);
            downloadFilters.push(
                `downloaded_at < ($${downloadParams.length}::date + INTERVAL '1 day')`
            );
        }

        const downloadWhere = downloadFilters.length
            ? `WHERE ${downloadFilters.join(" AND ")}`
            : "";

        const [
            total,
            completed,
            byLang,
            topPois,
            downloadStats,
            audioCount,
            poiCount,
            adminCount,
        ] = await Promise.all([
            // Tổng lượt nghe audio
            query(
                `SELECT COUNT(*)::int AS c
                 FROM usage_log
                 ${usageWhere}`,
                usageParams
            ),

            // Số lượt nghe hoàn thành
            query(
                `SELECT COUNT(*)::int AS c
                 FROM usage_log
                 ${completedWhere}`,
                usageParams
            ),

            // Phân bố ngôn ngữ audio
            query(
                `SELECT
                    language_code,
                    COUNT(*)::int AS c
                 FROM usage_log
                 ${usageWhere}
                 GROUP BY language_code`,
                usageParams
            ),

            // Top 5 POI có nhiều lượt nghe
            query(
                `SELECT
                    p.name,
                    COUNT(*)::int AS plays
                 FROM usage_log u
                 JOIN poi p ON p.poi_id = u.poi_id
                 ${usageWhere
                    ? `${usageWhere} AND`
                    : "WHERE"
                 } u.poi_id IS NOT NULL
                 GROUP BY p.poi_id, p.name
                 ORDER BY plays DESC
                 LIMIT 5`,
                usageParams
            ),

            // Số lượt yêu cầu tải gói ZIP Offline thật.
            // Mỗi dòng package_download = một lượt.
            // Không truy vấn IP, session hay danh tính.
            query(
                `SELECT
                    COUNT(*)::int AS total,

                    COUNT(*) FILTER (
                        WHERE LOWER(TRIM(platform)) = 'android'
                    )::int AS android,

                    COUNT(*) FILTER (
                        WHERE LOWER(TRIM(platform)) = 'ios'
                    )::int AS ios,

                    COUNT(*) FILTER (
                        WHERE LOWER(TRIM(platform)) = 'web'
                    )::int AS web

                 FROM package_download
                 ${downloadWhere}`,
                downloadParams
            ),

            // Số audio đã xuất bản
            query(
                `SELECT COUNT(*)::int AS c
                 FROM audio_track
                 WHERE status = 'published'`
            ),

            // Tổng POI
            query(
                `SELECT COUNT(*)::int AS c
                 FROM poi`
            ),

            // Tổng admin
            query(
                `SELECT COUNT(*)::int AS c
                 FROM admin_account`
            ),
        ]);

        const totalPlays = total.rows[0].c;

        const totalLang =
            byLang.rows.reduce(
                (sum, row) => sum + row.c,
                0
            ) || 1;

        const languageDist = {
            vi: 0,
            en: 0,
            zh: 0,
        };

        if (totalPlays > 0) {
            byLang.rows.forEach(row => {
                if (
                    Object.prototype.hasOwnProperty.call(
                        languageDist,
                        row.language_code
                    )
                ) {
                    languageDist[row.language_code] =
                        Math.round(
                            (row.c / totalLang) * 100
                        );
                }
            });
        }

        await cleanupSessions();

        const onlineResult = await query(
            `SELECT COUNT(*)::int AS count
             FROM online_session`
        );

        const downloads = downloadStats.rows[0];

        return res.json({
            totalPlays,
            totalVisits: totalPlays,

            completedRate:
                totalPlays > 0
                    ? Math.round(
                        (completed.rows[0].c / totalPlays) * 100
                    )
                    : 0,

            languageDist,
            topPois: topPois.rows,

            totalAudioPublished:
                audioCount.rows[0].c,

            totalPois:
                poiCount.rows[0].c,

            totalAdmins:
                adminCount.rows[0].c,

            onlineUsers:
                onlineResult.rows[0].count,

            // Thống kê lượt tải ZIP từ database
            offlineDownloads: {
                total: downloads.total,
                android: downloads.android,
                ios: downloads.ios,
                web: downloads.web,
            },

            hasData: totalPlays > 0,
        });
    } catch (error) {
        console.error("Lỗi getOverview:", error);

        return res.status(500).json({
            error: "Lỗi server",
        });
    }
}

// ==================== EXPORT ANALYTICS CSV ====================

export async function exportOverview(req, res) {
    try {
        const { from, to } = req.query;

        const params = [];
        const filters = [];

        if (from) {
            params.push(from);
            filters.push(
                `played_at >= $${params.length}::date`
            );
        }

        if (to) {
            params.push(to);
            filters.push(
                `played_at < ($${params.length}::date + INTERVAL '1 day')`
            );
        }

        const where = filters.length
            ? `WHERE ${filters.join(" AND ")}`
            : "";

        const { rows } = await query(
            `SELECT
                COALESCE(p.name, 'Không xác định') AS poi,
                language_code AS language,
                COUNT(*)::int AS visits,
                COUNT(*) FILTER (
                    WHERE completed = TRUE
                )::int AS completed
             FROM usage_log u
             LEFT JOIN poi p ON p.poi_id = u.poi_id
             ${where}
             GROUP BY p.name, language_code
             ORDER BY visits DESC`,
            params
        );

        const csv = [
            "POI,Language,Visits,Completed",

            ...rows.map(row =>
                [
                    row.poi,
                    row.language || "",
                    row.visits,
                    row.completed,
                ]
                    .map(value =>
                        `"${String(value).replaceAll('"', '""')}"`
                    )
                    .join(",")
            ),
        ].join("\n");

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="analytics-${from || "all"}-${to || "all"}.csv"`
        );

        return res.send(`\uFEFF${csv}`);
    } catch (error) {
        console.error(
            "Lỗi exportOverview:",
            error
        );

        return res.status(500).json({
            error: "Không thể xuất báo cáo",
        });
    }
}

// ==================== SESSION: PING ====================

export async function pingSession(req, res) {
    let {
        sessionId,
        language = "vi",
        currentPoi = null,
        device = "web",
    } = req.body || {};

    if (
        !sessionId ||
        typeof sessionId !== "string" ||
        sessionId.length > 64
    ) {
        const ip = (
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "client"
        ).slice(0, 40);

        sessionId =
            `sess_${Buffer.from(ip)
                .toString("hex")
                .slice(0, 10)}_${Date.now().toString(36)}`;
    }

    const ip =
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        null;

    await query(
        `INSERT INTO online_session
            (
                session_id,
                language_code,
                current_poi,
                device,
                ip_address,
                last_seen
            )
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (session_id)
         DO UPDATE SET
            language_code = EXCLUDED.language_code,
            current_poi = EXCLUDED.current_poi,
            device = EXCLUDED.device,
            ip_address = EXCLUDED.ip_address,
            last_seen = NOW()`,
        [
            sessionId,
            language,
            currentPoi,
            device,
            ip,
        ]
    );

    await cleanupSessions();

    const { rows } = await query(
        `SELECT COUNT(*)::int AS count
         FROM online_session`
    );

    return res.json({
        ok: true,
        online: rows[0].count,
        sessionId,
    });
}

// ==================== SESSION: REMOVE ====================

export async function removeSession(req, res) {
    const { sessionId } = req.params;

    if (sessionId) {
        await query(
            `DELETE FROM online_session
             WHERE session_id = $1`,
            [sessionId]
        );
    }

    await cleanupSessions();

    const { rows } = await query(
        `SELECT COUNT(*)::int AS count
         FROM online_session`
    );

    return res.json({
        ok: true,
        online: rows[0].count,
    });
}

// ==================== SESSION: ACTIVE USERS ====================

export async function getActiveSessions(req, res) {
    await cleanupSessions();

    const { rows } = await query(`
        SELECT
            LEFT(session_id, 8) || '…' AS "sessionId",
            language_code AS language,
            current_poi AS "currentPoi",
            device,
            GREATEST(
                0,
                FLOOR(
                    EXTRACT(
                        EPOCH FROM (
                            NOW() - last_seen
                        )
                    )
                )
            )::int AS "idleSec"
        FROM online_session
        ORDER BY last_seen DESC
    `);

    const byLanguage = {};
    const byDevice = {};
    const byPoi = {};

    for (const session of rows) {
        byLanguage[session.language] =
            (byLanguage[session.language] || 0) + 1;

        byDevice[session.device] =
            (byDevice[session.device] || 0) + 1;

        if (session.currentPoi) {
            byPoi[session.currentPoi] =
                (byPoi[session.currentPoi] || 0) + 1;
        }
    }

    return res.json({
        total: rows.length,
        sessions: rows,

        byLanguage: Object.entries(byLanguage)
            .map(([lang, c]) => ({
                lang,
                c,
            }))
            .sort((a, b) => b.c - a.c),

        byDevice: Object.entries(byDevice)
            .map(([device, c]) => ({
                device,
                c,
            }))
            .sort((a, b) => b.c - a.c),

        byPoi: Object.entries(byPoi)
            .map(([poi, c]) => ({
                poi,
                c,
            }))
            .sort((a, b) => b.c - a.c)
            .slice(0, 10),
    });
}

// ==================== AUDIO USAGE ====================

export async function logAudioUsage(req, res) {
    try {
        const {
            poiId,
            languageCode = "vi",
            triggerType = "manual",
            completed = false,
            usageId = null,
        } = req.body || {};

        // Nếu có usageId: cập nhật lượt nghe cũ
        if (usageId) {
            const updateRes = await query(
                `UPDATE usage_log
                 SET completed = $1
                 WHERE usage_id = $2
                 RETURNING usage_id, completed`,
                [
                    Boolean(completed),
                    usageId,
                ]
            );

            return res.json({
                ok: true,
                usageId,
                completed:
                    updateRes.rows[0]?.completed ??
                    Boolean(completed),
            });
        }

        let numericPoiId = null;

        if (poiId != null && poiId !== "") {
            const raw = String(poiId).trim();

            if (/^\d+$/.test(raw)) {
                numericPoiId = parseInt(raw, 10);
            } else {
                try {
                    const poiRes = await query(
                        `SELECT poi_id
                         FROM poi
                         WHERE code = $1
                         LIMIT 1`,
                        [raw]
                    );

                    if (poiRes.rows.length > 0) {
                        numericPoiId =
                            poiRes.rows[0].poi_id;
                    }
                } catch {
                    // Không tìm thấy POI:
                    // vẫn cho phép ghi usage không có POI.
                }
            }
        }

        const insertRes = await query(
            `INSERT INTO usage_log
                (
                    poi_id,
                    language_code,
                    trigger_type,
                    completed,
                    played_at
                )
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING usage_id`,
            [
                numericPoiId,
                languageCode,
                triggerType,
                Boolean(completed),
            ]
        );

        return res.json({
            ok: true,
            usageId: insertRes.rows[0]?.usage_id,
        });
    } catch (error) {
        console.error(
            "Lỗi logAudioUsage:",
            error
        );

        return res.status(500).json({
            error: "Lỗi ghi nhận lượt nghe audio",
        });
    }
}

// ==================== RESET AUDIO USAGE ====================

export async function resetAudioUsage(req, res) {
    try {
        await query(
            `TRUNCATE TABLE usage_log
             RESTART IDENTITY`
        );

        return res.json({
            ok: true,
            message: "Đã reset lượt nghe audio về 0",
        });
    } catch (error) {
        console.error(
            "Lỗi resetAudioUsage:",
            error
        );

        return res.status(500).json({
            error: "Lỗi reset lượt nghe audio",
        });
    }
}
