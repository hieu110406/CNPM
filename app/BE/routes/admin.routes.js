import { Router } from "express";
import { listAdmins, deactivateAdmin } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
r.get("/", requireAuth, listAdmins);
r.put("/:id/deactivate", requireAuth, deactivateAdmin);
export default r;