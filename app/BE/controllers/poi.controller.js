import { pool } from "../db/database.js";
import { deleteStorageObjects, StorageServiceError, uploadPoiImage } from "../supabaseStorage.js";

const LANGUAGES = ["vi", "en", "zh"];

function readPoiInput(body) {
  const category = body.category || body.type;
  const mapX = body.mapX ?? body.x;
  const mapY = body.mapY ?? body.y;
  const latitude = body.latitude == null || body.latitude === "" ? null : Number(body.latitude);
  const longitude = body.longitude == null || body.longitude === "" ? null : Number(body.longitude);
  const geofenceRadius = Number(body.geofenceRadius ?? 20);

  if (
    typeof body.id !== "string" ||
    !body.id.trim() ||
    body.id.trim().length > 20 ||
    typeof body.name !== "string" ||
    !body.name.trim() ||
    body.name.trim().length > 120 ||
    !category ||
    typeof category !== "string" ||
    category.trim().length > 80 ||
    typeof body.zone !== "string" ||
    !body.zone.trim() ||
    body.zone.trim().length > 150
  ) {
    return { error: "Mã, tên, loại và phân khu POI là bắt buộc." };
  }

  const x = Number(mapX);
  const y = Number(mapY);
  if (!Number.isFinite(x) || x < 0 || x > 100 || !Number.isFinite(y) || y < 0 || y > 100) {
    return { error: "Tọa độ bản đồ X và Y phải nằm trong khoảng 0–100." };
  }

  if (!Number.isInteger(geofenceRadius) || geofenceRadius < 5 || geofenceRadius > 200) {
    return { error: "Bán kính geofence phải nằm trong khoảng 5–200m." };
  }

  for (const [label, value, min, max] of [
    ["Vĩ độ", latitude, -90, 90],
    ["Kinh độ", longitude, -180, 180],
  ]) {
    if (value !== null && (!Number.isFinite(value) || value < min || value > max)) {
      return { error: `${label} không hợp lệ.` };
    }
  }

  const translationInput = body.translations && typeof body.translations === "object"
    ? body.translations
    : {};
  const translations = Object.fromEntries(
    LANGUAGES.map((language) => {
      const input = translationInput[language];
      if (typeof input === "string") {
        return [language, {
          short: null,
          detail: input.trim(),
          name: null,
          zone: null,
          funFact: null,
        }];
      }

      const value = input && typeof input === "object" && !Array.isArray(input)
        ? input
        : {};
      const readText = (...keys) => {
        const text = keys.map((key) => value[key]).find((candidate) => typeof candidate === "string");
        return text === undefined ? null : text.trim();
      };

      return [language, {
        short: readText("short"),
        detail: readText("detail", "description"),
        name: readText("name"),
        zone: readText("zone"),
        funFact: readText("funFact", "fun_fact"),
      }];
    })
  );
  if (!translations.vi.detail) {
    return { error: "Mô tả tiếng Việt là bắt buộc." };
  }
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return { error: "Trạng thái hoạt động không hợp lệ." };
  }

  return {
    value: {
      code: body.id.trim(),
      name: body.name.trim(),
      category: category.trim(),
      zone: body.zone.trim(),
      emoji: typeof body.emoji === "string" && body.emoji.trim() ? body.emoji.trim() : null,
      latitude,
      longitude,
      mapX: x,
      mapY: y,
      geofenceRadius,
      isActive: body.isActive ?? true,
      translations,
    },
  };
}

function readPoiRequestBody(body) {
  if (typeof body.poi !== "string") return body;
  try {
    return JSON.parse(body.poi);
  } catch {
    return null;
  }
}

function readRemovedImageIds(value) {
  if (value === undefined) return { value: [] };
  let ids = value;
  if (typeof value === "string") {
    try {
      ids = JSON.parse(value);
    } catch {
      return { error: "Danh sách ảnh cần xóa không hợp lệ." };
    }
  }
  if (!Array.isArray(ids)) return { error: "Danh sách ảnh cần xóa không hợp lệ." };
  const normalized = ids.map(Number);
  if (normalized.some((id) => !Number.isInteger(id) || id < 1)) {
    return { error: "Danh sách ảnh cần xóa không hợp lệ." };
  }
  return { value: [...new Set(normalized)] };
}

async function getCategoryId(client, category) {
  const { rows } = await client.query(
    `SELECT category_id FROM category WHERE name = $1`,
    [category]
  );
  return rows[0]?.category_id ?? null;
}

async function saveTranslations(client, poiId, translations) {
  for (const language of LANGUAGES) {
    const translation = translations[language];
    await client.query(
      `INSERT INTO poi_translation
         (poi_id, language_code, short_description, description, name, zone, fun_fact)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (poi_id, language_code) DO UPDATE
       SET short_description = COALESCE(EXCLUDED.short_description, poi_translation.short_description),
           description = COALESCE(EXCLUDED.description, poi_translation.description),
           name = COALESCE(EXCLUDED.name, poi_translation.name),
           zone = COALESCE(EXCLUDED.zone, poi_translation.zone),
           fun_fact = COALESCE(EXCLUDED.fun_fact, poi_translation.fun_fact)`,
      [
        poiId,
        language,
        translation.short,
        translation.detail,
        translation.name,
        translation.zone,
        translation.funFact,
      ]
    );
  }
}

async function syncMapNode(client, poi) {
  await client.query(
    `INSERT INTO map_node (node_id, name, x, y, category)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (node_id) DO UPDATE
       SET name = EXCLUDED.name,
           x = EXCLUDED.x,
           y = EXCLUDED.y,
           category = EXCLUDED.category`,
    [poi.code, poi.name, poi.mapX, poi.mapY, poi.category]
  );
}

function respondWithError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({ error: "Mã POI đã tồn tại." });
  }
  if (error.code === "INVALID_CATEGORY") {
    return res.status(400).json({ error: "Loại POI không hợp lệ." });
  }
  if (error.code === "POI_NOT_FOUND") {
    return res.status(404).json({ error: "Không tìm thấy POI." });
  }
  if (error.code === "INVALID_IMAGE_SELECTION") {
    return res.status(400).json({ error: error.message });
  }
  if (error.code === "POI_IMAGE_LIMIT") {
    return res.status(400).json({ error: error.message });
  }

  console.error("POI database error:", error);
  return res.status(500).json({ error: "Không thể xử lý dữ liệu POI." });
}

export async function listPublicPois(req, res) {
  try {
    const lang = typeof req.query.lang === "string" ? req.query.lang : "vi";
    const { rows } = await pool.query(
      `SELECT
         p.poi_id AS "dbId",
         p.poi_id AS "poiId",
         p.code AS id,
         c.name AS type,
         p.emoji,
         p.x::float AS x,
         p.y::float AS y,
         p.opening_hours AS "openingHours",
         p.feeding_time AS "feedingTime",
         p.audio_available AS "audioAvailable",
         COALESCE(t.name, v.name, p.name) AS name,
         COALESCE(t.zone, v.zone, p.zone) AS zone,
         COALESCE(t.short_description, v.short_description, t.description, v.description) AS "shortDesc",
         COALESCE(t.description, v.description) AS "detailDesc",
         COALESCE(t.fun_fact, v.fun_fact) AS "funFact",
         COALESCE((
           SELECT jsonb_agg(
             jsonb_build_object('id', pi.poi_image_id, 'url', pi.public_url, 'alt', pi.alt_text)
             ORDER BY pi.sort_order, pi.poi_image_id
           )
           FROM poi_image pi
           WHERE pi.poi_id = p.poi_id
         ), '[]'::jsonb) AS images
       FROM poi p
       LEFT JOIN category c ON c.category_id = p.category_id
       LEFT JOIN poi_translation t
         ON t.poi_id = p.poi_id AND t.language_code = $1
       LEFT JOIN poi_translation v
         ON v.poi_id = p.poi_id AND v.language_code = 'vi'
       WHERE p.is_active = TRUE
       ORDER BY p.poi_id`,
      [lang]
    );
    return res.json(rows);
  } catch (error) {
    return respondWithError(res, error);
  }
}

/* GET /api/pois */
export async function listPois(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.poi_id AS "dbId",
        p.code AS id,
        p.name,
        p.emoji,
        c.name AS category,
        p.zone,
        p.latitude,
        p.longitude,
        p.x::float AS "mapX",
        p.y::float AS "mapY",
        p.geofence_radius AS "geofenceRadius",
        p.is_active AS "isActive",
        p.updated_at AS "updatedAt",
        COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object('id', pi.poi_image_id, 'url', pi.public_url, 'alt', pi.alt_text)
            ORDER BY pi.sort_order, pi.poi_image_id
          )
          FROM poi_image pi
          WHERE pi.poi_id = p.poi_id
        ), '[]'::jsonb) AS images,
        jsonb_object_agg(
          t.language_code,
          jsonb_build_object(
            'short', COALESCE(t.short_description, ''),
            'detail', COALESCE(t.description, ''),
            'name', t.name,
            'zone', t.zone,
            'funFact', t.fun_fact
          )
        ) FILTER (WHERE t.language_code IS NOT NULL) AS translations
      FROM poi p
      LEFT JOIN category c ON c.category_id = p.category_id
      LEFT JOIN poi_translation t ON t.poi_id = p.poi_id
      GROUP BY p.poi_id, c.name
      ORDER BY p.poi_id
    `);

    return res.json(
      rows.map((poi) => ({
        ...poi,
        translations: {
          vi: { short: "", detail: "" },
          en: { short: "", detail: "" },
          zh: { short: "", detail: "" },
          ...(poi.translations || {}),
        },
      }))
    );
  } catch (error) {
    return respondWithError(res, error);
  }
}

/* POST /api/pois */
export async function createPoi(req, res) {
  const body = readPoiRequestBody(req.body || {});
  if (!body) return res.status(400).json({ error: "Dữ liệu POI không hợp lệ." });
  const parsed = readPoiInput(body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const poi = parsed.value;
  const imageFiles = req.files || [];
  const uploadedPaths = [];
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const categoryId = await getCategoryId(client, poi.category);
    if (!categoryId) {
      const error = new Error("Unknown POI category");
      error.code = "INVALID_CATEGORY";
      throw error;
    }

    const { rows } = await client.query(
      `INSERT INTO poi
         (code, category_id, name, zone, emoji, latitude, longitude, x, y,
          geofence_radius, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING poi_id AS "dbId"`,
      [
        poi.code, categoryId, poi.name, poi.zone, poi.emoji, poi.latitude, poi.longitude,
        poi.mapX, poi.mapY, poi.geofenceRadius, poi.isActive,
      ]
    );

    await saveTranslations(client, rows[0].dbId, poi.translations);
    await syncMapNode(client, poi);

    for (const [sortOrder, file] of imageFiles.entries()) {
      const image = await uploadPoiImage(file, poi.code);
      uploadedPaths.push(image.path);
      await client.query(
        `INSERT INTO poi_image (poi_id, storage_path, public_url, alt_text, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [rows[0].dbId, image.path, image.publicUrl, poi.name, sortOrder]
      );
    }

    await client.query("COMMIT");
    return res.status(201).json({ dbId: rows[0].dbId, id: poi.code });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch((rollbackError) => {
      console.error("POI transaction rollback failed:", rollbackError);
    });
    try {
      await deleteStorageObjects(uploadedPaths);
    } catch (cleanupError) {
      console.error("POI image cleanup failed after create rollback:", cleanupError);
    }
    if (error instanceof StorageServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    return respondWithError(res, error);
  } finally {
    client?.release();
  }
}

/* PUT /api/pois/:dbId */
export async function updatePoi(req, res) {
  const body = readPoiRequestBody(req.body || {});
  if (!body) return res.status(400).json({ error: "Dữ liệu POI không hợp lệ." });
  const parsed = readPoiInput(body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const poi = parsed.value;
  const imageFiles = req.files || [];
  const removedResult = readRemovedImageIds(req.body?.removedImageIds);
  if (removedResult.error) return res.status(400).json({ error: removedResult.error });
  const removedImageIds = removedResult.value;
  const dbId = Number(req.params.dbId);
  if (!Number.isInteger(dbId) || dbId < 1) {
    return res.status(400).json({ error: "ID POI không hợp lệ." });
  }

  let client;
  const uploadedPaths = [];
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const categoryId = await getCategoryId(client, poi.category);
    if (!categoryId) {
      const error = new Error("Unknown POI category");
      error.code = "INVALID_CATEGORY";
      throw error;
    }

    const { rows: existingRows } = await client.query(
      `SELECT code FROM poi WHERE poi_id = $1 FOR UPDATE`,
      [dbId]
    );

    if (!existingRows.length) {
      const error = new Error("POI not found");
      error.code = "POI_NOT_FOUND";
      throw error;
    }

    const { rows: imageCountRows } = await client.query(
      `SELECT COUNT(*)::int AS count FROM poi_image WHERE poi_id = $1`,
      [dbId]
    );
    let imageCount = imageCountRows[0].count;
    let removedImagePaths = [];
    if (removedImageIds.length) {
      const { rows: removedRows } = await client.query(
        `DELETE FROM poi_image
         WHERE poi_id = $1 AND poi_image_id = ANY($2::int[])
         RETURNING storage_path`,
        [dbId, removedImageIds]
      );
      if (removedRows.length !== removedImageIds.length) {
        const error = new Error("Danh sách ảnh cần xóa không thuộc POI này.");
        error.code = "INVALID_IMAGE_SELECTION";
        throw error;
      }
      imageCount -= removedRows.length;
      removedImagePaths = removedRows.map((row) => row.storage_path).filter(Boolean);
    }
    if (imageCount + imageFiles.length > 10) {
      const error = new Error("Mỗi POI chỉ được có tối đa 10 ảnh.");
      error.code = "POI_IMAGE_LIMIT";
      throw error;
    }
    const { rows: sortOrderRows } = await client.query(
      `SELECT COALESCE(MAX(sort_order), -1) + 1 AS "nextSortOrder"
       FROM poi_image WHERE poi_id = $1`,
      [dbId]
    );
    const nextSortOrder = sortOrderRows[0].nextSortOrder;

    await client.query(
      `
        UPDATE poi SET
          code = $1,
          category_id = $2,
          name = $3,
          zone = $4,
          emoji = $5,
          latitude = $6,
          longitude = $7,
          x = $8,
          y = $9,
          geofence_radius = $10,
          is_active = $11,
          updated_at = NOW()
        WHERE poi_id = $12
      `,
      [
        poi.code,
        categoryId,
        poi.name,
        poi.zone,
        poi.emoji,
        poi.latitude,
        poi.longitude,
        poi.mapX,
        poi.mapY,
        poi.geofenceRadius,
        poi.isActive,
        dbId,
      ]
    );

    if (existingRows[0].code !== poi.code) {
      await client.query(`DELETE FROM map_node WHERE node_id = $1`, [existingRows[0].code]);
    }

    await saveTranslations(client, dbId, poi.translations);
    await syncMapNode(client, poi);

    for (const [index, file] of imageFiles.entries()) {
      const image = await uploadPoiImage(file, poi.code);
      uploadedPaths.push(image.path);
      await client.query(
        `INSERT INTO poi_image (poi_id, storage_path, public_url, alt_text, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [dbId, image.path, image.publicUrl, poi.name, nextSortOrder + index]
      );
    }
    await client.query("COMMIT");
    let warning;
    try {
      await deleteStorageObjects(removedImagePaths);
    } catch (cleanupError) {
      console.error("POI was updated but removed images could not be deleted from Storage:", cleanupError);
      warning = "POI đã cập nhật nhưng chưa xoá được một số ảnh trên Storage.";
    }
    return res.json({ dbId, id: poi.code, warning });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch((rollbackError) => {
        console.error("POI transaction rollback failed:", rollbackError);
      });
    }
    try {
      await deleteStorageObjects(uploadedPaths);
    } catch (cleanupError) {
      console.error("POI image cleanup failed after update rollback:", cleanupError);
    }
    if (error instanceof StorageServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    return respondWithError(res, error);
  } finally {
    client?.release();
  }
}

/* DELETE /api/pois/:dbId */
export async function deletePoi(req, res) {
  const dbId = Number(req.params.dbId);
  if (!Number.isInteger(dbId) || dbId < 1) {
    return res.status(400).json({ error: "ID POI không hợp lệ." });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const { rows: poiRows } = await client.query(
      `SELECT code FROM poi WHERE poi_id = $1 FOR UPDATE`,
      [dbId]
    );
    if (!poiRows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy POI." });
    }
    const { rows: imageRows } = await client.query(
      `SELECT storage_path FROM poi_image WHERE poi_id = $1`,
      [dbId]
    );
    const { rows: audioRows } = await client.query(
      `SELECT storage_path FROM audio_track WHERE poi_id = $1`,
      [dbId]
    );
    await client.query(`DELETE FROM poi WHERE poi_id = $1`, [dbId]);
    await client.query(`DELETE FROM map_node WHERE node_id = $1`, [poiRows[0].code]);
    await client.query("COMMIT");
    try {
      await deleteStorageObjects([
        ...imageRows.map((image) => image.storage_path),
        ...audioRows.map((audio) => audio.storage_path).filter(Boolean),
      ]);
    } catch (cleanupError) {
      console.error("POI was deleted but its storage media could not be removed:", cleanupError);
      return res.json({
        success: true,
        warning: "POI đã xoá khỏi database nhưng chưa xoá được media trên Storage.",
      });
    }
    return res.json({ success: true });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch((rollbackError) => {
      console.error("POI transaction rollback failed:", rollbackError);
    });
    return respondWithError(res, error);
  } finally {
    client?.release();
  }
}
