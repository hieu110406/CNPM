import { Router } from "express";
import { listPois, createPoi, updatePoi, deletePoi } from "../controllers/poi.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
r.get("/", requireAuth, listPois);
r.post("/", requireAuth, createPoi);
r.put("/:dbId", requireAuth, updatePoi);
r.delete("/:dbId", requireAuth, deletePoi);
export default r;