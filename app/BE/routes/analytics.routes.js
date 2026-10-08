import { Router } from "express";
import { getOverview } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
r.get("/overview", requireAuth, getOverview);
export default r;