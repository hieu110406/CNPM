import { Router } from "express";
import { listAudit } from "../controllers/audit.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
r.get("/", requireAuth, listAudit);
export default r;