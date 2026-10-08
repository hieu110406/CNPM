import { query } from "../db/database.js";

export async function listAudio(req, res) {
    try {
        const { poiId } = req.query;
        let rows;
        if (poiId) {
            ({ rows } = await query(`SELECT * FROM audio_track WHERE poi_id = $1`, [poiId]));
        } else {
            ({ rows } = await query(`SELECT * FROM audio_track`));
        }
        return res.json(rows.map((r) => ({
            id: `AUD-${String(r.audio_id).padStart(3, "0")}`,
            dbId: r.audio_id,
            poiDbId: r.poi_id,
            language: r.language_code,
            source: r.source,
            duration: r.duration_sec,
            sizeMb: r.size_mb,
            status: r.status,
            publishedAt: r.published_at,
        })));
    } catch (e) {
        return res.status(500).json({ error: "Lỗi server" });
    }
}

export async function createAudio(req, res) {
    try {
        const { poiDbId, language, source, duration, sizeMb } = req.body;
        const { rows } = await query(`
      INSERT INTO audio_track (poi_id, language_code, source, duration_sec, size_mb, status)
      VALUES ($1, $2, $3, $4, $5, 'draft')
      RETURNING audio_id
    `, [poiDbId, language, source, duration, sizeMb]);
        return res.json({ ok: true, audioId: rows[0].audio_id });
    } catch (e) {
        return res.status(500).json({ error: "Lỗi server" });
    }
}

export async function publishAudio(req, res) {
    try {
        await query(`UPDATE audio_track SET status='published', published_at=NOW() WHERE audio_id=$1`, [req.params.id]);
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: "Lỗi server" });
    }
}

export async function deleteAudio(req, res) {
    try {
        await query(`DELETE FROM audio_track WHERE audio_id = $1`, [req.params.id]);
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: "Lỗi server" });
    }
}