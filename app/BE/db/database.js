import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        }
        : {
            host: process.env.DB_HOST || "localhost",
            port: +process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || "saigonzoo",
            user: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        }
);

pool.on("connect", () => {
    console.log("🐘 PostgreSQL connected");
});

export async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const ms = Date.now() - start;
    if (ms > 500) console.warn(`⚠️ Query chậm (${ms}ms):`, text.slice(0, 80));
    return res;
}

export async function initDb() {
    await pool.query("SET search_path TO public");
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
    await pool.query(schema);
    console.log("✅ Schema OK");
}