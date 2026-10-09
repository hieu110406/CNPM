import { pool } from "../db/database.js";

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

  const translations = body.translations && typeof body.translations === "object"
    ? body.translations
    : {};
  if (typeof translations.vi !== "string" || !translations.vi.trim()) {
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

async function getCategoryId(client, category) {
  const { rows } = await client.query(
    `SELECT category_id FROM category WHERE name = $1`,
    [category]
  );
  return rows[0]?.category_id ?? null;
}

async function saveTranslations(client, poiId, translations) {
  for (const language of LANGUAGES) {
    const description = typeof translations[language] === "string"
      ? translations[language].trim()
      : "";
    await client.query(
      `INSERT INTO poi_translation (poi_id, language_code, description)
       VALUES ($1, $2, NULLIF($3, ''))
       ON CONFLICT (poi_id, language_code) DO UPDATE
       SET description = EXCLUDED.description`,
      [poiId, language, description]
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

  console.error("POI database error:", error);
  return res.status(500).json({ error: "Không thể xử lý dữ liệu POI." });
}

export async function listPublicPois(req, res) {
  try {
    const lang = typeof req.query.lang === "string" ? req.query.lang : "vi";
    const { rows } = await pool.query(
      `SELECT
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
         COALESCE(t.description, v.description) AS "desc",
         COALESCE(t.fun_fact, v.fun_fact) AS "funFact"
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
export async function listPois(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.poi_id AS "dbId",
        p.code AS id,
        p.name,
        c.name AS category,
        p.zone,
        p.latitude,
        p.longitude,
        p.x::float AS "mapX",
        p.y::float AS "mapY",
        p.geofence_radius AS "geofenceRadius",
        p.is_active AS "isActive",
        p.updated_at AS "updatedAt",
        jsonb_object_agg(
          t.language_code,
          jsonb_build_object(
            'short', COALESCE(t.short_description, ''),
            'detail', COALESCE(t.description, '')
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
}

/* POST /api/pois */
export async function createPoi(req, res) {
export async function createPoi(req, res) {
  const parsed = readPoiInput(req.body || {});
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const poi = parsed.value;
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
      `
        INSERT INTO poi (code, category_id, name, zone, latitude, longitude, geofence_radius, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING poi_id
      `,
      [
        poi.id,
        categoryId,
        poi.name,
        poi.zone,
        Number(poi.latitude),
        Number(poi.longitude),
        Number(poi.geofenceRadius),
        !!poi.isActive,
      ]
    );

    const poiId = rows[0].poi_id;
    for (const l of ["vi", "en", "zh"]) {
      const tr = poi.translations?.[l] || {};
      await client.query(
        `
          INSERT INTO poi_translation (poi_id, language_code, short_description, description)
          VALUES ($1, $2, $3, $4)
        `,
        [poiId, l, tr.short || "", tr.detail || ""]
      );
    }

    await client.query("COMMIT");
    return res.json({ ok: true, poiId });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    if (error.code === "INVALID_CATEGORY") {
      return res.status(400).json({ error: "Unknown POI category" });
    }
    return respondWithError(res, error);
  }
}
    }

    const { rows } = await client.query(
      `INSERT INTO poi
         (code, category_id, name, zone, latitude, longitude, x, y,
          geofence_radius, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING poi_id AS "dbId"`,
      [
        poi.code, categoryId, poi.name, poi.zone, poi.latitude, poi.longitude,
        poi.mapX, poi.mapY, poi.geofenceRadius, poi.isActive,
      ]
    );

    await saveTranslations(client, rows[0].dbId, poi.translations);
    await syncMapNode(client, poi);
    await client.query("COMMIT");
    return res.status(201).json({ dbId: rows[0].dbId, id: poi.code });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch((rollbackError) => {
      console.error("POI transaction rollback failed:", rollbackError);
    });
    return respondWithError(res, error);
  } finally {
    client?.release();
  }
}

/* PUT /api/pois/:dbId */
export async function updatePoi(req, res) {
  const parsed = readPoiInput(req.body || {});
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const poi = parsed.value;
  const dbId = Number(req.params.dbId);
  if (!Number.isInteger(dbId) || dbId < 1) {
    return res.status(400).json({ error: "ID POI không hợp lệ." });
  }

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

    const { rows: existingRows } = await client.query(
      `SELECT poi_id FROM poi WHERE poi_id = $1`,
      [poi.dbId]
    );

    if (!existingRows.length) {
      const error = new Error("POI not found");
      error.code = "POI_NOT_FOUND";
      throw error;
    }

    await client.query(
      `
        UPDATE poi SET
          name = $1,
          category_id = $2,
          zone = $3,
          latitude = $4,
          longitude = $5,
          geofence_radius = $6,
          is_active = $7,
          updated_at = NOW()
        WHERE poi_id = $8
      `,
      [
        poi.name,
        categoryId,
        poi.zone,
        Number(poi.latitude),
        Number(poi.longitude),
        Number(poi.geofenceRadius),
        !!poi.isActive,
        poi.dbId,
      ]
    );

    for (const l of ["vi", "en", "zh"]) {
      const tr = poi.translations?.[l] || {};
      await client.query(
        `
          INSERT INTO poi_translation (poi_id, language_code, short_description, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (poi_id, language_code)
          DO UPDATE SET
            short_description = EXCLUDED.short_description,
            description = EXCLUDED.description
        `,
        [poi.dbId, l, tr.short || "", tr.detail || ""]
      );
    }

    await client.query("COMMIT");
    return res.json({ ok: true });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    return respondWithError(res, error);
  }
    }

    const { rows: existingRows } = await client.query(
      `SELECT code FROM poi WHERE poi_id = $1 FOR UPDATE`,
      [dbId]
    );
    if (!existingRows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy POI." });
    }

    const { rows } = await client.query(
      `UPDATE poi
       SET code = $1,
           category_id = $2,
           name = $3,
           zone = $4,
           latitude = $5,
           longitude = $6,
           x = $7,
           y = $8,
           geofence_radius = $9,
           is_active = $10,
           updated_at = NOW()
       WHERE poi_id = $11
       RETURNING poi_id`,
      [
        poi.code, categoryId, poi.name, poi.zone, poi.latitude, poi.longitude,
        poi.mapX, poi.mapY, poi.geofenceRadius, poi.isActive, dbId,
      ]
    );
    await saveTranslations(client, dbId, poi.translations);
    if (existingRows[0].code !== poi.code) {
      await client.query(`DELETE FROM map_node WHERE node_id = $1`, [existingRows[0].code]);
    }
    await syncMapNode(client, poi);
    await client.query("COMMIT");
    return res.json({ dbId, id: poi.code });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch((rollbackError) => {
      console.error("POI transaction rollback failed:", rollbackError);
    });
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
    const { rows } = await client.query(
      `DELETE FROM poi WHERE poi_id = $1 RETURNING code`,
      [dbId]
    );
    if (!rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy POI." });
    }
    await client.query(`DELETE FROM map_node WHERE node_id = $1`, [rows[0].code]);
    await client.query("COMMIT");
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
