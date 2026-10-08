import { Router } from "express";
import { listAudio, createAudio, publishAudio, deleteAudio } from "../controllers/audio.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
r.get("/", requireAuth, listAudio);
r.post("/", requireAuth, createAudio);
r.put("/:id/publish", requireAuth, publishAudio);
r.delete("/:id", requireAuth, deleteAudio);
export default r;