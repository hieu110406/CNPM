
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { query } from '../db/database.js';
import { createZip } from '../utils/zip.js';

const LANGUAGES = new Set(['vi', 'en', 'zh']);
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_MEDIA_BYTES = 80 * 1024 * 1024;

function languageFrom(req) {
    return LANGUAGES.has(req.query.lang)
        ? req.query.lang
        : 'vi';
}

function allowedMediaHost() {
    try {
        return new URL(process.env.SUPABASE_URL).host;
    } catch {
        return null;
    }
}

async function retrieveMedia(url, host) {
    const parsed = new URL(url);

    if (
        parsed.protocol !== 'https:' ||
        !host ||
        parsed.host !== host ||
        !parsed.pathname.includes('/storage/v1/object/public/')
    ) {
        throw new Error('MEDIA_HOST_NOT_ALLOWED');
    }

    const response = await fetch(parsed, {
        signal: AbortSignal.timeout(15000),
        redirect: 'error'
    });

    if (!response.ok) {
        throw new Error(`MEDIA_HTTP_${response.status}`);
    }

    const size = Number(response.headers.get('content-length'));

    if (size > MAX_FILE_BYTES) {
        throw new Error('MEDIA_TOO_LARGE');
    }

    const chunks = [];
    let total = 0;

    for await (const chunk of response.body) {
        total += chunk.length;

        if (total > MAX_FILE_BYTES) {
            throw new Error('MEDIA_TOO_LARGE');
        }

        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
}

function extensionFor(url, kind) {
    const ext = new URL(url).pathname
        .match(/\.(jpg|jpeg|png|webp|mp3|m4a|aac|ogg|wav)$/i)?.[1]
        ?.toLowerCase();

    return ext || (kind === 'audio' ? 'mp3' : 'jpg');
}

// API: Lấy thông tin package
export async function getOfflineMetadata(req, res) {
    try {
        const [{ rows: pois }, { rows: media }] =
            await Promise.all([
                query(`
          SELECT COUNT(*)::int AS count,
                 MAX(updated_at) AS updated
          FROM poi
          WHERE is_active = TRUE
        `),

                query(`
          SELECT
            (SELECT COUNT(*) FROM poi_image) AS images,
            (SELECT COUNT(*)
             FROM audio_track
             WHERE file_url IS NOT NULL) AS audios
        `)
            ]);

        res.json({
            format: 'zip',
            version: pois[0].updated
                ? new Date(pois[0].updated).toISOString().slice(0, 10)
                : '1',
            pois: pois[0].count,
            images: Number(media[0].images),
            audios: Number(media[0].audios),
            languages: [...LANGUAGES]
        });
    } catch (error) {
        console.error('Offline metadata:', error);
        res.status(500).json({
            error: 'Không lấy được thông tin gói offline.'
        });
    }
}

// API: Tạo và tải package ZIP
export async function downloadOfflinePackage(req, res) {
    const language = languageFrom(req);

    const platform = ['web', 'android', 'ios']
        .includes(req.query.platform)
        ? req.query.platform
        : 'web';

    try {
        const [
            { rows: pois },
            { rows: audio },
            { rows: graph }
        ] = await Promise.all([
            query(`
        SELECT
          p.code AS id,
          p.name AS original_name,
          p.x::float AS x,
          p.y::float AS y,
          p.latitude::float AS latitude,
          p.longitude::float AS longitude,
          p.emoji,
          c.name AS type,
          COALESCE(t.name, v.name, p.name) AS name,
          COALESCE(t.zone, v.zone, p.zone) AS zone,
          COALESCE(
            t.short_description,
            v.short_description
          ) AS "shortDesc",
          COALESCE(
            t.description,
            v.description
          ) AS "detailDesc",
          COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'url', pi.public_url,
                'alt', pi.alt_text
              )
              ORDER BY pi.sort_order, pi.poi_image_id
            )
            FROM poi_image pi
            WHERE pi.poi_id = p.poi_id
          ), '[]'::jsonb) AS images
        FROM poi p
        LEFT JOIN category c
          ON c.category_id = p.category_id
        LEFT JOIN poi_translation t
          ON t.poi_id = p.poi_id
          AND t.language_code = $1
        LEFT JOIN poi_translation v
          ON v.poi_id = p.poi_id
          AND v.language_code = 'vi'
        WHERE p.is_active = TRUE
        ORDER BY p.poi_id
      `, [language]),

            query(`
        SELECT
          p.code AS id,
          a.file_url AS url,
          a.language_code AS lang
        FROM audio_track a
        JOIN poi p ON p.poi_id = a.poi_id
        WHERE p.is_active = TRUE
          AND a.file_url IS NOT NULL
          AND a.language_code IN ($1, 'vi')
        ORDER BY p.poi_id,
          CASE
            WHEN a.language_code = $1 THEN 0
            ELSE 1
          END
      `, [language]),

            query(`
        SELECT node_id, name, x, y, category
        FROM map_node
        ORDER BY node_id
      `)
        ]);

        const files = [];

        const mapImage = fileURLToPath(
            new URL(
                '../../FE/src/assets/map/zoo_map.png',
                import.meta.url
            )
        );

        files.push({
            name: 'map/zoo_map.png',
            data: await readFile(mapImage)
        });

        const host = allowedMediaHost();

        const manifest = {
            schemaVersion: 1,
            language,
            generatedAt: new Date().toISOString(),
            map: 'map/zoo_map.png',
            pois,
            graph,
            audio: []
        };

        let totalMedia = 0;
        const cache = new Map();

        async function addMedia(url, filename) {
            if (!url) return null;
            if (cache.has(url)) return cache.get(url);

            const data = await retrieveMedia(url, host);

            totalMedia += data.length;

            if (totalMedia > MAX_MEDIA_BYTES) {
                throw new Error('PACKAGE_TOO_LARGE');
            }

            files.push({ name: filename, data });
            cache.set(url, filename);

            return filename;
        }

        // Đóng gói hình ảnh POI
        for (const poi of pois) {
            for (let i = 0; i < poi.images.length; i++) {
                const image = poi.images[i];

                image.path = await addMedia(
                    image.url,
                    `images/${encodeURIComponent(poi.id)}-${i}.${extensionFor(image.url, 'image')
                    }`
                );

                delete image.url;
            }
        }

        // Đóng gói audio
        const uniqueAudio = new Set();

        for (const item of audio) {
            if (uniqueAudio.has(item.id)) continue;

            uniqueAudio.add(item.id);

            const path = await addMedia(
                item.url,
                `audio/${encodeURIComponent(item.id)}.${extensionFor(item.url, 'audio')
                }`
            );

            manifest.audio.push({
                poiId: item.id,
                language: item.lang,
                path
            });
        }

        files.push({
            name: 'manifest.json',
            data: Buffer.from(
                JSON.stringify(manifest, null, 2)
            )
        });

        // Tạo file ZIP
        const zip = createZip(files);

        const checksum = createHash('sha256')
            .update(zip)
            .digest('hex');

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition':
                `attachment; filename="zoo-offline-${language}.zip"`,
            'Content-Length': String(zip.length),
            'X-Package-SHA256': checksum,
            'Cache-Control': 'no-store',
            'Access-Control-Expose-Headers':
                'Content-Length, X-Package-SHA256, Content-Disposition'
        });

        res.end(zip);

        // Ghi nhận lần tải package
        query(`
      INSERT INTO offline_package
        (version, total_size_mb, checksum, published_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING package_id
    `, [
            manifest.generatedAt,
            zip.length / (1024 * 1024),
            checksum
        ])
            .then(({ rows }) =>
                query(`
          INSERT INTO package_download
            (package_id, platform, language_code, downloaded_at)
          VALUES ($1, $2, $3, NOW())
        `, [
                    rows[0].package_id,
                    platform,
                    language
                ])
            )
            .catch(error =>
                console.error('Offline log:', error)
            );

    } catch (error) {
        console.error('Offline download:', error);

        res.status(
            error.message === 'PACKAGE_TOO_LARGE' ? 413 : 502
        ).json({
            error: 'Không thể đóng gói dữ liệu offline.',
            code: error.message
        });
    }
}
