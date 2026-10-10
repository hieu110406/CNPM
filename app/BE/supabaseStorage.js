import { randomUUID } from "node:crypto";

const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const GENERIC_AUDIO_MIME_TYPES = new Set(["application/octet-stream"]);

export class StorageServiceError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "StorageServiceError";
    this.status = status;
  }
}

function getStorageConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media-public";

  if (!url || !key) {
    throw new StorageServiceError(
      "Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY ở backend.",
      503
    );
  }

  return { url, key, bucket };
}

function encodeStoragePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function getImageExtension(contentType) {
  return IMAGE_EXTENSIONS[contentType] || null;
}

function assertImageContent(file) {
  const { buffer, mimetype } = file;
  const isJpeg = mimetype === "image/jpeg"
    && buffer.length >= 3
    && buffer[0] === 0xff
    && buffer[1] === 0xd8
    && buffer[2] === 0xff;
  const isPng = mimetype === "image/png"
    && buffer.length >= 8
    && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = mimetype === "image/webp"
    && buffer.length >= 12
    && buffer.toString("ascii", 0, 4) === "RIFF"
    && buffer.toString("ascii", 8, 12) === "WEBP";

  if (!getImageExtension(mimetype) || !(isJpeg || isPng || isWebp)) {
    throw new StorageServiceError("Tệp tải lên không phải ảnh JPEG, PNG hoặc WebP hợp lệ.", 400);
  }
}

function getAudioFormat(file) {
  const { buffer, mimetype } = file;
  const isAllowedMimeType = mimetype.startsWith("audio/")
    || GENERIC_AUDIO_MIME_TYPES.has(mimetype)
    || mimetype === "video/mp4";
  const isAac = buffer.length >= 2
    && buffer[0] === 0xff
    && (buffer[1] & 0xf6) === 0xf0;
  let isMpeg = buffer.subarray(0, 3).toString("ascii") === "ID3";
  for (let offset = 0; !isMpeg && offset < Math.min(buffer.length - 3, 4096); offset += 1) {
    isMpeg = buffer[offset] === 0xff
      && (buffer[offset + 1] & 0xe0) === 0xe0
      && (buffer[offset + 1] & 0x06) !== 0;
  }
  const isWav = buffer.length >= 12
    && buffer.toString("ascii", 0, 4) === "RIFF"
    && buffer.toString("ascii", 8, 12) === "WAVE";
  const isOgg = buffer.toString("ascii", 0, 4) === "OggS";
  const isMp4 = buffer.length >= 12
    && buffer.toString("ascii", 4, 8) === "ftyp";
  const isWebm = buffer.length >= 4
    && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));

  if (!isAllowedMimeType || !(isMpeg || isWav || isOgg || isMp4 || isAac || isWebm)) {
    throw new StorageServiceError("Tệp tải lên không phải audio hợp lệ thuộc định dạng được hỗ trợ.", 400);
  }

  if (isAac) return { extension: "aac", contentType: "audio/aac" };
  if (isMpeg) return { extension: "mp3", contentType: "audio/mpeg" };
  if (isWav) return { extension: "wav", contentType: "audio/wav" };
  if (isOgg) return { extension: "ogg", contentType: "audio/ogg" };
  if (isMp4) return { extension: "m4a", contentType: "audio/mp4" };
  return { extension: "webm", contentType: "audio/webm" };
}

export async function uploadPoiImage(file, poiCode) {
  assertImageContent(file);
  const path = `img/pois/${poiCode}/${randomUUID()}.${getImageExtension(file.mimetype)}`;
  return uploadStorageObject(path, file.buffer, file.mimetype);
}

export async function uploadPoiAudio(file, poiCode, language) {
  const format = getAudioFormat(file);
  const path = `audio/${poiCode}/${language}/${randomUUID()}.${format.extension}`;
  return uploadStorageObject(path, file.buffer, format.contentType);
}

async function uploadStorageObject(path, buffer, contentType) {
  const { url, key, bucket } = getStorageConfig();
  const response = await fetch(
    `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`,
    {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body: buffer,
    }
  );

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    console.error("Supabase image upload failed:", response.status, detail);
    throw new StorageServiceError("Không thể tải ảnh lên Supabase Storage.");
  }

  return {
    path,
    publicUrl: `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`,
  };
}

export async function deleteStorageObjects(paths) {
  if (!paths.length) return;
  const { url, key, bucket } = getStorageConfig();
  const response = await fetch(
    `${url}/storage/v1/object/${encodeURIComponent(bucket)}`,
    {
      method: "DELETE",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: paths }),
    }
  );

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    console.error("Supabase object delete failed:", response.status, detail);
    throw new StorageServiceError("Không thể xoá ảnh khỏi Supabase Storage.");
  }
}
