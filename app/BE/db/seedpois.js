import { MARKERS } from "../../FE/src/components/map/mapData.js";
import { initDb, pool } from "./database.js";

async function seedPois() {
  await initDb();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const marker of MARKERS) {
      const { rows: categories } = await client.query(
        `SELECT category_id FROM category WHERE name = $1`,
        [marker.type]
      );
      const categoryId = categories[0]?.category_id;
      if (!categoryId) {
        throw new Error(`Không tìm thấy loại POI "${marker.type}" trong database.`);
      }

      const { rows: inserted } = await client.query(
        `INSERT INTO poi
           (code, category_id, name, zone, x, y, emoji, opening_hours,
            feeding_time, audio_available)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (code) DO NOTHING
         RETURNING poi_id`,
        [
          marker.id,
          categoryId,
          marker.name,
          marker.zone ?? null,
          marker.x,
          marker.y,
          marker.emoji ?? null,
          marker.openingHours ?? null,
          marker.feedingTime ?? null,
          Boolean(marker.audioAvailable),
        ]
      );

      const poiId = inserted[0]?.poi_id;
      if (poiId) {
        await client.query(
          `INSERT INTO poi_translation
             (poi_id, language_code, name, zone, description, fun_fact)
           VALUES ($1, 'vi', $2, $3, $4, $5)
           ON CONFLICT (poi_id, language_code) DO NOTHING`,
          [
            poiId,
            marker.name,
            marker.zone ?? null,
            marker.desc ?? null,
            marker.funFact ?? null,
          ]
        );
      }
    }

    await client.query(
      `INSERT INTO map_node (node_id, name, x, y, category)
       SELECT p.code, p.name, p.x, p.y, c.name
       FROM poi p
       JOIN category c ON c.category_id = p.category_id
       WHERE p.x IS NOT NULL AND p.y IS NOT NULL
       ON CONFLICT (node_id) DO UPDATE
         SET name = EXCLUDED.name,
             x = EXCLUDED.x,
             y = EXCLUDED.y,
             category = EXCLUDED.category`
    );

    await client.query("COMMIT");
    console.log(`Đã seed ${MARKERS.length} POI và đồng bộ map_node.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

seedPois()
  .catch((error) => {
    console.error("Seed POI thất bại:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
