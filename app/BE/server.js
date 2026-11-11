import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db/database.js";

import authRoutes from "./routes/auth.routes.js";
import poiRoutes from "./routes/poi.routes.js";
import audioRoutes from "./routes/audio.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import pathfindingRoutes from "./routes/pathfinding.routes.js";
import offlineRoutes from './routes/offline.routes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));


app.use("/api/auth", authRoutes);
app.use("/api/pois", poiRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/pathfinding", pathfindingRoutes);
app.use("/api/route", pathfindingRoutes);
app.use('/api/offline', offlineRoutes);


const PORT = process.env.PORT || 5000;


initDb()
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 BE chạy ở http://localhost:${PORT}`));
    })
    .catch((e) => {
        console.error("❌ Không kết nối được PostgreSQL:", e.message);
        process.exit(1);
    });