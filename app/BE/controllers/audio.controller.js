import { pool, query } from "../db/database.js";
import { deleteStorageObjects, StorageServiceError, uploadPoiAudio } from "../supabaseStorage.js";

const LANGUAGES = new Set(["vi", "en", "zh"]);

function sendAudioError(res, error) {
  if (error instanceof StorageServiceError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error.code === "23503") {
    return res.status(404).json({ error: "Không tìm thấy POI." });
  }
  console.error("Audio API error:", error);
  return res.status(500).json({ error: "Không thể xử lý audio." });
}

export async function listAudio(req, res) {
  try {
    const { poiId } = req.query;
    const { rows } = poiId
      ? await query(`SELECT * FROM audio_track WHERE poi_id = $1 ORDER BY audio_id`, [poiId])
      : await query(`SELECT * FROM audio_track ORDER BY audio_id`);
    return res.json(rows.map((row) => ({
      id: `AUD-${String(row.audio_id).padStart(3, "0")}`,
      dbId: row.audio_id,
      poiDbId: row.poi_id,
      language: row.language_code,
      source: row.source,
      duration: row.duration_sec,
      sizeMb: row.size_mb,
      fileUrl: row.file_url,
      status: row.status,
      publishedAt: row.published_at,
    })));
  } catch (error) {
    return sendAudioError(res, error);
  }
}

export async function createAudio(req, res) {
  const poiDbId = Number(req.body?.poiDbId);
  const language = req.body?.language;
  const source = req.body?.source;
  if (!Number.isInteger(poiDbId) || poiDbId < 1 || !LANGUAGES.has(language)) {
    return res.status(400).json({ error: "POI hoặc ngôn ngữ audio không hợp lệ." });
  }
  if (!["ai", "upload"].includes(source)) {
    return res.status(400).json({ error: "Nguồn audio không hợp lệ." });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Vui lòng chọn tệp audio." });
  }

  let client;
  let uploadedPath;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const { rows: poiRows } = await client.query(
      `SELECT code FROM poi WHERE poi_id = $1 FOR UPDATE`,
      [poiDbId]
    );
    if (!poiRows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy POI." });
    }

    const { rows: existingRows } = await client.query(
      `SELECT storage_path FROM audio_track WHERE poi_id = $1 AND language_code = $2 FOR UPDATE`,
      [poiDbId, language]
    );
    const stored = await uploadPoiAudio(req.file, poiRows[0].code, language);
    uploadedPath = stored.path;
    const sizeMb = Number((req.file.buffer.length / (1024 * 1024)).toFixed(2));
    const requestedDuration = Number(req.body.duration);
    const duration = Number.isFinite(requestedDuration) && requestedDuration > 0
      ? Math.round(requestedDuration)
      : null;

    const { rows } = await client.query(
      `INSERT INTO audio_track
         (poi_id, language_code, source, duration_sec, size_mb, file_url, storage_path, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', NULL)
       ON CONFLICT (poi_id, language_code) DO UPDATE SET
         source = EXCLUDED.source,
         duration_sec = EXCLUDED.duration_sec,
         size_mb = EXCLUDED.size_mb,
         file_url = EXCLUDED.file_url,
         storage_path = EXCLUDED.storage_path,
         status = 'draft',
         published_at = NULL,
         created_at = NOW()
       RETURNING audio_id`,
      [
        poiDbId,
        language,
        source,
        duration,
        sizeMb,
        stored.publicUrl,
        stored.path,
      ]
    );
    await client.query(`UPDATE poi SET audio_available = TRUE WHERE poi_id = $1`, [poiDbId]);
    await client.query("COMMIT");

    const oldPath = existingRows[0]?.storage_path;
    let warning;
    if (oldPath && oldPath !== uploadedPath) {
      try {
        await deleteStorageObjects([oldPath]);
      } catch (cleanupError) {
        console.error("Audio was replaced but its old storage file could not be removed:", cleanupError);
        warning = "Audio đã lưu nhưng không xoá được tệp audio cũ trên Storage.";
      }
    }
    return res.status(201).json({ ok: true, audioId: rows[0].audio_id, warning });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch((rollbackError) => {
        console.error("Audio transaction rollback failed:", rollbackError);
      });
    }
    if (uploadedPath) {
      try {
        await deleteStorageObjects([uploadedPath]);
      } catch (cleanupError) {
        console.error("Audio cleanup failed after database rollback:", cleanupError);
      }
    }
    return sendAudioError(res, error);
  } finally {
    client?.release();
  }
}

export async function publishAudio(req, res) {
  try {
    const { rowCount } = await query(
      `UPDATE audio_track SET status = 'published', published_at = NOW() WHERE audio_id = $1`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Không tìm thấy audio." });
    return res.json({ ok: true });
  } catch (error) {
    return sendAudioError(res, error);
  }
}

export async function deleteAudio(req, res) {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const { rows } = await client.query(
      `DELETE FROM audio_track WHERE audio_id = $1
       RETURNING poi_id, storage_path`,
      [req.params.id]
    );
    if (!rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy audio." });
    }

    await client.query(
      `UPDATE poi SET audio_available = EXISTS (
         SELECT 1 FROM audio_track WHERE poi_id = $1
       ) WHERE poi_id = $1`,
      [rows[0].poi_id]
    );
    await client.query("COMMIT");

    try {
      if (rows[0].storage_path) await deleteStorageObjects([rows[0].storage_path]);
    } catch (cleanupError) {
      console.error("Audio was deleted but its storage file could not be removed:", cleanupError);
      return res.json({
        ok: true,
        warning: "Audio đã gỡ khỏi database nhưng chưa xoá được tệp trên Storage.",
      });
    }
    return res.json({ ok: true });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch((rollbackError) => {
        console.error("Audio delete rollback failed:", rollbackError);
      });
    }
    return sendAudioError(res, error);
  } finally {
    client?.release();
  }
}
