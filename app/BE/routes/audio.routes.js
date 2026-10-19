import { Router } from "express";
import multer from "multer";
import { listAudio, listPublicAudio, createAudio, deleteAudio } from "../controllers/audio.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (
      !file.mimetype.startsWith("audio/")
      && file.mimetype !== "application/octet-stream"
      && file.mimetype !== "video/mp4"
    ) {
      return callback(new Error("Chỉ hỗ trợ audio MP3, WAV, OGG, M4A hoặc WebM."));
    }
    return callback(null, true);
  },
});

function receiveAudioFile(req, res, next) {
  audioUpload.single("file")(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "Tệp audio không được vượt quá 30 MB."
        : "Không thể nhận tệp audio.";
      return res.status(400).json({ error: message });
    }
    return res.status(400).json({ error: error.message || "Tệp audio không hợp lệ." });
  });
}

r.get("/public", listPublicAudio);
r.get("/", requireAuth, listAudio);
r.post("/", requireAuth, receiveAudioFile, createAudio);
r.delete("/:id", requireAuth, deleteAudio);
export default r;