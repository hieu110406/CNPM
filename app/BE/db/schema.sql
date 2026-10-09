CREATE TABLE IF NOT EXISTS admin_account (
  admin_id        SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role_id         INTEGER DEFAULT 1,
  is_locked       BOOLEAN DEFAULT FALSE,
  failed_attempts INTEGER DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  mfa_enabled     BOOLEAN DEFAULT TRUE,
  status          VARCHAR(20) DEFAULT 'active',
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category (
  category_id SERIAL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS poi (
  poi_id          SERIAL PRIMARY KEY,
  code            VARCHAR(20) UNIQUE NOT NULL,
  category_id     INTEGER REFERENCES category(category_id),
  name            VARCHAR(200) NOT NULL,
  zone            VARCHAR(150),
  latitude        NUMERIC(10, 6),
  longitude       NUMERIC(10, 6),
  geofence_radius INTEGER DEFAULT 20,
  is_active       BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poi_translation (
  translation_id    SERIAL PRIMARY KEY,
  poi_id            INTEGER REFERENCES poi(poi_id) ON DELETE CASCADE,
  language_code     VARCHAR(5) NOT NULL,
  short_description TEXT DEFAULT '',
  description       TEXT,
  UNIQUE (poi_id, language_code)
);

CREATE TABLE IF NOT EXISTS audio_track (
  audio_id      SERIAL PRIMARY KEY,
  poi_id        INTEGER REFERENCES poi(poi_id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  source        VARCHAR(20),
  duration_sec  INTEGER,
  size_mb       NUMERIC(6, 2),
  file_url      TEXT,
  status        VARCHAR(20) DEFAULT 'draft',
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (poi_id, language_code)
);

CREATE TABLE IF NOT EXISTS audit_log (
  log_id     SERIAL PRIMARY KEY,
  admin_id   INTEGER,
  admin_name VARCHAR(120),
  type       VARCHAR(20),
  event      VARCHAR(200),
  detail     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_log (
  usage_id      SERIAL PRIMARY KEY,
  poi_id        INTEGER,
  language_code VARCHAR(5),
  trigger_type  VARCHAR(10),
  completed     BOOLEAN DEFAULT FALSE,
  played_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_poi   ON usage_log(poi_id);
CREATE INDEX IF NOT EXISTS idx_usage_lang  ON usage_log(language_code);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audio_poi   ON audio_track(poi_id);

CREATE TABLE IF NOT EXISTS map_node (
  node_id  VARCHAR(50) PRIMARY KEY,
  name     VARCHAR(120) NOT NULL,
  x        REAL NOT NULL,
  y        REAL NOT NULL,
  category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS map_edge (
  edge_id  SERIAL PRIMARY KEY,
  from_id  VARCHAR(50) REFERENCES map_node(node_id) ON DELETE CASCADE,
  to_id    VARCHAR(50) REFERENCES map_node(node_id) ON DELETE CASCADE,
  distance REAL NOT NULL
);
-- nối phần POI vào trong database
-- poi: thêm cột cho bản đồ
ALTER TABLE poi
  ADD COLUMN IF NOT EXISTS x               REAL,          -- % theo ảnh zoo_map.png
  ADD COLUMN IF NOT EXISTS y               REAL,
  ADD COLUMN IF NOT EXISTS emoji           VARCHAR(8),
  ADD COLUMN IF NOT EXISTS opening_hours   VARCHAR(80),
  ADD COLUMN IF NOT EXISTS feeding_time    VARCHAR(40),
  ADD COLUMN IF NOT EXISTS audio_available BOOLEAN DEFAULT FALSE;

-- poi_translation: thêm tên, khu vực, fun fact
ALTER TABLE poi_translation
  ADD COLUMN IF NOT EXISTS name     VARCHAR(200),
  ADD COLUMN IF NOT EXISTS zone     VARCHAR(150),
  ADD COLUMN IF NOT EXISTS fun_fact TEXT;

-- category.name sẽ lưu đúng key của TYPE_META
WITH category_aliases(alias_name, canonical_name) AS (
  VALUES
    ('Động vật', 'animal'),
    ('Thực vật', 'plant'),
    ('Cơ sở hạ tầng', 'building'),
    ('Cổng vào', 'building'),
    ('facility', 'building'),
    ('entrance', 'building'),
    ('Dịch vụ', 'service')
),
category_candidates AS (
  SELECT aliases.canonical_name, c.category_id, c.name
  FROM category c
  JOIN category_aliases aliases
    ON c.name = aliases.alias_name OR c.name = aliases.canonical_name
),
preferred_categories AS (
  SELECT
    canonical_name,
    COALESCE(
      MIN(category_id) FILTER (WHERE name = canonical_name),
      MIN(category_id)
    ) AS category_id
  FROM category_candidates
  GROUP BY canonical_name
)
UPDATE poi p
SET category_id = preferred.category_id
FROM category_candidates candidate
JOIN preferred_categories preferred USING (canonical_name)
WHERE p.category_id = candidate.category_id
  AND candidate.category_id <> preferred.category_id;

WITH category_aliases(alias_name, canonical_name) AS (
  VALUES
    ('Động vật', 'animal'),
    ('Thực vật', 'plant'),
    ('Cơ sở hạ tầng', 'building'),
    ('Cổng vào', 'building'),
    ('facility', 'building'),
    ('entrance', 'building'),
    ('Dịch vụ', 'service')
),
category_candidates AS (
  SELECT aliases.canonical_name, c.category_id, c.name
  FROM category c
  JOIN category_aliases aliases
    ON c.name = aliases.alias_name OR c.name = aliases.canonical_name
),
preferred_categories AS (
  SELECT
    canonical_name,
    COALESCE(
      MIN(category_id) FILTER (WHERE name = canonical_name),
      MIN(category_id)
    ) AS category_id
  FROM category_candidates
  GROUP BY canonical_name
)
DELETE FROM category c
USING category_candidates candidate
JOIN preferred_categories preferred USING (canonical_name)
WHERE c.category_id = candidate.category_id
  AND c.category_id <> preferred.category_id;

WITH category_aliases(alias_name, canonical_name) AS (
  VALUES
    ('Động vật', 'animal'),
    ('Thực vật', 'plant'),
    ('Cơ sở hạ tầng', 'building'),
    ('Cổng vào', 'building'),
    ('facility', 'building'),
    ('entrance', 'building'),
    ('Dịch vụ', 'service')
),
category_candidates AS (
  SELECT aliases.canonical_name, c.category_id, c.name
  FROM category c
  JOIN category_aliases aliases
    ON c.name = aliases.alias_name OR c.name = aliases.canonical_name
),
preferred_categories AS (
  SELECT
    canonical_name,
    COALESCE(
      MIN(category_id) FILTER (WHERE name = canonical_name),
      MIN(category_id)
    ) AS category_id
  FROM category_candidates
  GROUP BY canonical_name
)
UPDATE category c
SET name = preferred.canonical_name
FROM preferred_categories preferred
WHERE c.category_id = preferred.category_id
  AND c.name <> preferred.canonical_name;

WITH ranked_categories AS (
  SELECT
    category_id,
    MIN(category_id) OVER (PARTITION BY name) AS canonical_id
  FROM category
)
UPDATE poi p
SET category_id = ranked_categories.canonical_id
FROM ranked_categories
WHERE p.category_id = ranked_categories.category_id
  AND ranked_categories.category_id <> ranked_categories.canonical_id;

DELETE FROM category c
USING (
  SELECT category_id
  FROM (
    SELECT
      category_id,
      ROW_NUMBER() OVER (PARTITION BY name ORDER BY category_id) AS row_number
    FROM category
  ) ranked
  WHERE row_number > 1
) duplicate_categories
WHERE c.category_id = duplicate_categories.category_id;

CREATE UNIQUE INDEX IF NOT EXISTS category_name_uq ON category(name);

INSERT INTO category (name) VALUES
 ('animal'),('plant'),('building'),('entertainment'),
 ('restaurant'),('restroom'),('service'),('medical'),('photo')
ON CONFLICT (name) DO NOTHING;