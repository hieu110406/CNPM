import { query } from "../db/database.js";

const CAT_MAP = { animal: 1, plant: 2, facility: 3, service: 4, entrance: 5 };
const CAT_REV = ["", "animal", "plant", "facility", "service", "entrance"];

/* GET /api/pois */
export async function listPois(req, res) {
    try {
        const { rows: pois } = await query(`SELECT * FROM poi ORDER BY poi_id DESC`);
        const { rows: translations } = await query(`SELECT * FROM poi_translation`);

        const result = pois.map((p) => {
            const t = {
                vi: { short: "", detail: "" },
                en: { short: "", detail: "" },
                zh: { short: "", detail: "" },
            };
            translations
                .filter((x) => x.poi_id === p.poi_id)
                .forEach((x) => {
                    if (t[x.language_code]) {
                        t[x.language_code] = {
                            short: x.short_description || "",
                            detail: x.description || "",
                        };
                    }
                });

            return {
                id: p.code,
                dbId: p.poi_id,
                name: p.name,
                category: CAT_REV[p.category_id] || "animal",
                zone: p.zone,
                latitude: p.latitude,
                longitude: p.longitude,
                geofenceRadius: p.geofence_radius,
                isActive: p.is_active,
                updatedAt: p.updated_at,
                translations: t,
            };
        });

        return res.json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}

/* POST /api/pois */
export async function createPoi(req, res) {
    try {
        const { id, name, category, zone, latitude, longitude, geofenceRadius, isActive, translations } = req.body;
        const { rows } = await query(`
      INSERT INTO poi (code, category_id, name, zone, latitude, longitude, geofence_radius, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING poi_id
    `, [id, CAT_MAP[category] || 1, name, zone, +latitude, +longitude, +geofenceRadius, !!isActive]);

        const poiId = rows[0].poi_id;
        for (const l of ["vi", "en", "zh"]) {
            const tr = translations?.[l] || {};
            await query(
                `INSERT INTO poi_translation (poi_id, language_code, short_description, description)
         VALUES ($1, $2, $3, $4)`,
                [poiId, l, tr.short || "", tr.detail || ""]
            );
        }
        return res.json({ ok: true, poiId });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}

/* PUT /api/pois/:dbId */
export async function updatePoi(req, res) {
    try {
        const { dbId } = req.params;
        const { name, category, zone, latitude, longitude, geofenceRadius, isActive, translations } = req.body;

        await query(`
      UPDATE poi SET name=$1, category_id=$2, zone=$3, latitude=$4, longitude=$5,
        geofence_radius=$6, is_active=$7, updated_at=NOW()
      WHERE poi_id=$8
    `, [name, CAT_MAP[category] || 1, zone, +latitude, +longitude, +geofenceRadius, !!isActive, dbId]);

        for (const l of ["vi", "en", "zh"]) {
            const tr = translations?.[l] || {};
            await query(`
        INSERT INTO poi_translation (poi_id, language_code, short_description, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (poi_id, language_code)
        DO UPDATE SET short_description = EXCLUDED.short_description,
                      description = EXCLUDED.description
      `, [dbId, l, tr.short || "", tr.detail || ""]);
        }
        return res.json({ ok: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Lỗi server" });
    }
}

/* DELETE /api/pois/:dbId */
export async function deletePoi(req, res) {
    try {
        await query(`DELETE FROM poi WHERE poi_id = $1`, [req.params.dbId]);
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: "Lỗi server" });
    }
}