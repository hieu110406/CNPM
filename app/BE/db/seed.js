import bcrypt from "bcryptjs";
import { pool, initDb } from "./database.js";

async function seed() {
    await initDb();
    const hash = bcrypt.hashSync("khanhly", 10);

    await pool.query(`
    INSERT INTO admin_account (name, email, password_hash, role_id, mfa_enabled)
    VALUES
      ('Nguyễn Trung Hiếu', 'hieu.nguyen@saigonzoo.net', $1, 1, TRUE),
      ('Huỳnh Lê Khánh Ly', 'ly.huynh@saigonzoo.net',    $1, 1, TRUE),
      ('Nguyễn Hoàng Khởi', 'khoi.nguyen@saigonzoo.net', $1, 1, TRUE)
    ON CONFLICT (email) DO NOTHING
  `, [hash]);

    await pool.query(`
    INSERT INTO category (category_id, name) VALUES
      (1, 'Động vật'), (2, 'Thực vật'), (3, 'Cơ sở hạ tầng'),
      (4, 'Dịch vụ'),  (5, 'Cổng vào')
    ON CONFLICT (category_id) DO NOTHING
  `);

    const pois = [
        { code: "POI-001", cat: 1, name: "Khu Voi Châu Á", zone: "Khu Voi & Thú Lớn", lat: 10.7875, lng: 106.7050, r: 25 },
        { code: "POI-002", cat: 1, name: "Chuồng Hổ Bengal", zone: "Khu Thú săn mồi", lat: 10.7878, lng: 106.7053, r: 20 },
        { code: "POI-003", cat: 1, name: "Hồ Hồng Hạc", zone: "Hồ Hồng Hạc", lat: 10.7881, lng: 106.7056, r: 30 },
        { code: "POI-004", cat: 1, name: "Đảo Linh Trưởng", zone: "Đảo Linh Trưởng", lat: 10.7884, lng: 106.7059, r: 18 },
        { code: "POI-005", cat: 2, name: "Vườn Lan Cổ Thụ", zone: "Trục cây di sản", lat: 10.7887, lng: 106.7062, r: 15 },
    ];

    for (const p of pois) {
        const r = await pool.query(`
      INSERT INTO poi (code, category_id, name, zone, latitude, longitude, geofence_radius)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING poi_id
    `, [p.code, p.cat, p.name, p.zone, p.lat, p.lng, p.r]);

        const poiId = r.rows[0].poi_id;

        await pool.query(`
      INSERT INTO poi_translation (poi_id, language_code, description) VALUES
        ($1, 'vi', $2), ($1, 'en', $3), ($1, 'zh', $4)
      ON CONFLICT (poi_id, language_code) DO NOTHING
    `, [poiId, `Mô tả tiếng Việt cho ${p.name}.`, `English description for ${p.name}.`, `${p.name}的中文描述。`]);

        for (let i = 0; i < 3; i++) {
            const lang = ["vi", "en", "zh"][i];
            await pool.query(`
        INSERT INTO audio_track (poi_id, language_code, source, duration_sec, size_mb, status, published_at)
        VALUES ($1, $2, $3, $4, $5, 'published', NOW())
        ON CONFLICT (poi_id, language_code) DO NOTHING
      `, [poiId, lang, i % 2 === 0 ? "upload" : "ai", 60 + i * 15, +(0.8 + i * 0.3).toFixed(2)]);
        }
    }

    await pool.query(`
    INSERT INTO audit_log (admin_id, admin_name, type, event, detail)
    VALUES (1, 'Nguyễn Trung Hiếu', 'success', 'Đăng nhập thành công', 'MFA hợp lệ')
  `);

    // Không seed giả lập usage_log để thống kê chính xác theo lượt nghe thực tế

    console.log("✅ Seed xong. Login: ly.huynh@saigonzoo.net / khanhly");
    await pool.end();
}

seed().catch((e) => { console.error(e); process.exit(1); });