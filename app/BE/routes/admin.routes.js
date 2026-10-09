import { Router } from "express";
import {
    listAdmins,
    createAdmin,
    updateAdmin,
    deactivateAdmin,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
r.get("/", requireAuth, listAdmins);
r.post("/", requireAuth, createAdmin);
r.put("/:id", requireAuth, updateAdmin);
r.put("/:id/deactivate", requireAuth, deactivateAdmin);
export default r;