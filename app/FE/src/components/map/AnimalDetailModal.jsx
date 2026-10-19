// AnimalDetailModal.jsx
// Modal pop-up phóng to giữa màn hình: album hình ảnh thực tế & thông tin sinh học chi tiết của động vật / địa điểm

import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Navigation,
  Share2,
  Heart,
  Globe,
  Utensils,
  ShieldCheck,
  Scale,
  Calendar,
} from "lucide-react";
import { getMarkerDetails } from "./animalMediaData";
import { TYPE_META } from "./mapData";
import { useSettings } from "../../context/SettingsContext";
import PoiAudioControl from "../audio/PoiAudioControl";
import RoutePickerModal from "./RoutePickerModal";
import "./animalModal.css";

export default function AnimalDetailModal({ marker, markers = [], onClose, onStartRouteMode, onPathReady }) {
  const { t, language } = useSettings();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showRoute, setShowRoute] = useState(false);

  const details = getMarkerDetails(marker);
  const markerName = marker?.fromDatabase
    ? marker.name
    : t(`markers.${marker?.id}.name`, marker?.name);
  const markerZone = marker?.zone
    ? marker.fromDatabase ? marker.zone : t(`markers.${marker?.id}.zone`, marker.zone)
    : "";
  const markerDesc = marker?.fromDatabase
    ? marker.desc
    : t(`markers.${marker?.id}.desc`, marker?.desc);

  // Đóng bằng phím Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!marker || !details) return null;

  const images = marker.fromDatabase && marker.images?.length
    ? marker.images.map((image) => ({ url: image.url, caption: image.alt || marker.name }))
    : details.images || [];
  const currentImage = images[currentImgIndex] || images[0];
  const meta = TYPE_META[marker.type] || TYPE_META.animal;
  const handlePrevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="animal-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="animal-modal-title"
    >
      <div
        className="animal-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          className="animal-modal-close"
          aria-label="Đóng bảng chi tiết"
        >
          <X size={20} />
        </button>

        {/* Khung trưng bày hình ảnh / Carousel */}
        {images.length > 0 && (
          <>
            <div className="animal-modal-gallery">
              <img
                src={currentImage?.url}
                alt={currentImage?.caption || marker.name}
                className="animal-modal-gallery__img"
              />
              <div className="animal-modal-gallery__gradient" />

              {/* Nút chuyển ảnh nếu có nhiều hơn 1 ảnh */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImg}
                    className="animal-modal-gallery__btn animal-modal-gallery__btn--prev"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImg}
                    className="animal-modal-gallery__btn animal-modal-gallery__btn--next"
                    aria-label="Ảnh kế tiếp"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Tiêu đề ảnh & đếm số ảnh */}
              <div className="animal-modal-gallery__overlay">
                <span className="animal-modal-gallery__caption">
                  {currentImage?.caption}
                </span>
                {images.length > 1 && (
                  <span className="animal-modal-gallery__counter">
                    {currentImgIndex + 1} / {images.length}
                  </span>
                )}
              </div>
            </div>

            {/* Dải ảnh nhỏ xem trước (thumbnails) */}
            {images.length > 1 && (
              <div className="animal-modal-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`animal-modal-thumb ${idx === currentImgIndex ? "is-active" : ""}`}
                    onClick={() => setCurrentImgIndex(idx)}
                    aria-label={`Xem ảnh ${idx + 1}`}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Thân nội dung cuộn */}
        <div className="animal-modal-body">
          {/* Nhãn phân loại & Tiêu đề */}
          <div className="animal-modal-header">
            <div className="animal-modal-tags">
              <span
                className="animal-modal-badge"
                style={{ backgroundColor: meta.color, color: "#fff" }}
              >
                {marker.emoji} {t(`types.${marker.type}`, meta.label)}
              </span>

              {markerZone && (
                <span className="animal-modal-badge animal-modal-badge--zone">
                  📍 {markerZone}
                </span>
              )}

              {details.conservation && (
                <span
                  className="animal-modal-badge animal-modal-badge--conservation"
                  style={{ backgroundColor: details.conservation.badgeColor }}
                  title={details.conservation.desc}
                >
                  <ShieldCheck size={12} /> {details.conservation.status} ({details.conservation.code})
                </span>
              )}
            </div>

            <div className="animal-modal-title-row">
              <h2 id="animal-modal-title" className="animal-modal-title">
                {markerName}
              </h2>
              {details.scientificName && (
                <span className="animal-modal-scientific">
                  ({details.scientificName})
                </span>
              )}
            </div>

            <p className="animal-modal-desc">{markerDesc}</p>
          </div>

          {/* Audio thuyết minh */}
          <PoiAudioControl marker={marker} language={language} />

          {/* Lưới thông số sinh học & điều kiện sống */}
          <div className="animal-modal-grid">
            {details.origin && (
              <div className="animal-modal-spec">
                <span className="animal-modal-spec__label">
                  <Globe size={13} /> Nguồn gốc
                </span>
                <span className="animal-modal-spec__value">{details.origin}</span>
              </div>
            )}

            {details.habitat && (
              <div className="animal-modal-spec">
                <span className="animal-modal-spec__label">
                  🌿 Môi trường sống
                </span>
                <span className="animal-modal-spec__value">{details.habitat}</span>
              </div>
            )}

            {details.diet && (
              <div className="animal-modal-spec">
                <span className="animal-modal-spec__label">
                  <Utensils size={13} /> Thức ăn
                </span>
                <span className="animal-modal-spec__value">{details.diet}</span>
              </div>
            )}

            {details.weight && (
              <div className="animal-modal-spec">
                <span className="animal-modal-spec__label">
                  <Scale size={13} /> Khối lượng
                </span>
                <span className="animal-modal-spec__value">{details.weight}</span>
              </div>
            )}

            {details.lifespan && (
              <div className="animal-modal-spec">
                <span className="animal-modal-spec__label">
                  <Calendar size={13} /> Tuổi thọ
                </span>
                <span className="animal-modal-spec__value">{details.lifespan}</span>
              </div>
            )}

            {(marker.feedingTime || marker.openingHours) && (
              <div className="animal-modal-spec">
                <span className="animal-modal-spec__label">
                  <Clock size={13} /> {marker.feedingTime ? "Giờ cho ăn" : "Mở cửa"}
                </span>
                <span className="animal-modal-spec__value" style={{ color: "#b45309" }}>
                  {marker.feedingTime || marker.openingHours}
                </span>
              </div>
            )}
          </div>

          {/* Danh sách đặc điểm nổi bật */}
          {details.characteristics && details.characteristics.length > 0 && (
            <div>
              <h4 className="animal-modal-section-title">
                Đặc điểm sinh học & tập tính
              </h4>
              <ul className="animal-modal-bullets">
                {details.characteristics.map((item, idx) => (
                  <li key={idx} className="animal-modal-bullet-item">
                    <span className="animal-modal-bullet-dot" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hộp sự thật thú vị "Bạn có biết?" */}
          {details.funFacts && details.funFacts.length > 0 && (
            <div className="animal-modal-fact">
              <Sparkles size={20} className="animal-modal-fact__icon" />
              <div className="animal-modal-fact__text">
                <strong>Bạn có biết? </strong>
                {details.funFacts.join(" ")}
              </div>
            </div>
          )}
        </div>

        {/* Chân modal hành động */}
        <div className="animal-modal-footer">
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className="animal-modal-btn-close"
              style={{
                color: isLiked ? "#e11d48" : "#64748b",
                borderColor: isLiked ? "#fecdd3" : "#e2e8f0",
                background: isLiked ? "#fff1f2" : "#fff",
              }}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              <span style={{ marginLeft: "6px" }}>{isLiked ? "Đã thích" : "Yêu thích"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: marker.name, text: marker.desc });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Đã sao chép liên kết chia sẻ!");
                }
              }}
              className="animal-modal-btn-close"
            >
              <Share2 size={16} />
              <span style={{ marginLeft: "6px" }}>Chia sẻ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowRoute(true)}
            className="animal-modal-btn-nav"
          >
            <Navigation size={16} />
            <span>Chỉ đường tới đây</span>
          </button>
        </div>
      </div>

      {/* Popup chỉ đường */}
      {showRoute && (
        <RoutePickerModal
          destination={marker}
          markers={markers}
          onClose={() => setShowRoute(false)}
          onStartRouteMode={onStartRouteMode}
          onPathReady={(path) => {
            onPathReady?.(path);
            setShowRoute(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}
