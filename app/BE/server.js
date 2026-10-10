import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db/database.js";

import authRoutes from "./routes/auth.routes.js";
import poiRoutes from "./routes/poi.routes.js";
import audioRoutes from "./routes/audio.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import pathfindingRoutes from "./routes/pathfinding.routes.js";

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Frontend origin is not allowed by CORS."));
    },
}));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/pois", poiRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/admin-accounts", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/pathfinding", pathfindingRoutes);

const PORT = process.env.PORT || 5000;

initDb()
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 BE chạy ở http://localhost:${PORT}`));
    })
    .catch((e) => {
        console.error("❌ Không kết nối được PostgreSQL:", e.message);
        process.exit(1);
    });