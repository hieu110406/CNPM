import { Router } from "express";
import multer from "multer";
import {
  listPois, createPoi, updatePoi, deletePoi,
  listPublicPois,            // mới
} from "../controllers/poi.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return callback(new Error("Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP."));
    }
    return callback(null, true);
  },
});

function receivePoiImages(req, res, next) {
  imageUpload.array("images", 10)(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "Mỗi ảnh không được vượt quá 8 MB."
        : error.code === "LIMIT_FILE_COUNT"
          ? "Mỗi POI chỉ được tải tối đa 10 ảnh."
          : "Không thể nhận tệp ảnh.";
      return res.status(400).json({ error: message });
    }
    return res.status(400).json({ error: error.message || "Tệp ảnh không hợp lệ." });
  });
}

r.get("/public", listPublicPois);          // không cần đăng nhập, cho bản đồ khách

r.get("/", requireAuth, listPois);
r.post("/", requireAuth, receivePoiImages, createPoi);
r.put("/:dbId", requireAuth, receivePoiImages, updatePoi);
r.delete("/:dbId", requireAuth, deletePoi);
export default r;