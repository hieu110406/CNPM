// MapInfoCard.jsx
// Thẻ thông tin chi tiết địa điểm: emoji đại diện, audio thuyết minh, giờ cho ăn, pop-up xem ảnh chi tiết & chỉ đường

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  Navigation,
  Share2,
  Heart,
  ExternalLink,
} from "lucide-react";
import { MARKERS, TYPE_META } from "./mapData";
import AnimalDetailModal from "./AnimalDetailModal";
import RoutePickerModal from "./RoutePickerModal";
import { useSettings } from "../../context/SettingsContext"; // chỉnh đường dẫn cho đúng
import PoiAudioControl from "../audio/PoiAudioControl";

export default function MapInfoCard({ marker, markers = MARKERS, onClose, onStartRouteMode, onPathReady }) {
  const { t, language } = useSettings();

  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [prevId, setPrevId] = useState(marker?.id);

  // Đồng bộ reset state khi chuyển sang marker khác
  if (marker?.id !== prevId) {
    setPrevId(marker?.id);
    setIsModalOpen(false);
    setShowRoute(false);
  }

  if (!marker) return null;

  const meta = TYPE_META[marker.type] || TYPE_META.animal;
  const typeLabel = t(`types.${marker.type}`, t(`filters.${marker.type}`, meta.label));
  const markerName = marker.fromDatabase ? marker.name : t(`markers.${marker.id}.name`, marker.name);
  const markerZone = marker.zone
    ? marker.fromDatabase ? marker.zone : t(`markers.${marker.id}.zone`, marker.zone)
    : "";
  const markerDesc = marker.fromDatabase ? marker.desc : t(`markers.${marker.id}.desc`, marker.desc);
  return (
    <>
      <div className="info-card">
        <div
          className="info-card__banner"
          style={{
            background: `linear-gradient(135deg, ${meta.color}, ${meta.color}b3)`,
          }}
        >
          <span className="info-card__watermark" aria-hidden="true">
            {marker.emoji || (marker.type === "plant" ? "🌿" : "🦁")}
          </span>
          <span className="info-card__type">{typeLabel}</span>
          <button
            onClick={onClose}
            className="info-card__close"
            aria-label={t("map.infoCard.close", "Đóng")}
          >
            <X size={14} />
          </button>
        </div>

        <div className="info-card__body">
          <div className="info-card__avatar">{marker.emoji || (marker.type === "plant" ? "🌿" : "🦁")}</div>

          <div>
            <h3 className="info-card__name">{markerName}</h3>
            {markerZone && <p className="info-card__zone">{markerZone}</p>}
          </div>

          <p className="info-card__desc">{markerDesc}</p>

          {/* Nút mở Pop-up xem chi tiết đầy đủ & hình ảnh */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="info-card__more"
          >
            <span>{t("map.infoCard.viewDetails", "Xem chi tiết & hình ảnh")}</span>
            <ExternalLink size={12} />
          </button>

          {/* Giờ hoạt động: luôn hiện gọn */}
          {(marker.feedingTime || marker.openingHours) && (
            <div className="info-card__time">
              <Clock size={14} className="info-card__time-icon" />
              <div>
                {marker.feedingTime && (
                  <p>
                    🍖 {t("map.infoCard.feedingTime", "Giờ cho ăn")}: <b>{marker.feedingTime}</b>
                  </p>
                )}
                {marker.openingHours && (
                  <p>
                    {t("map.infoCard.openingHours", "Mở cửa")}: <b>{marker.openingHours}</b>
                  </p>
                )}
              </div>
            </div>
          )}

          <PoiAudioControl marker={marker} language={language} />

          <div className="info-card__actions">
            <button
              onClick={() => setShowRoute(true)}
              className="info-card__nav"
            >
              <Navigation size={13} />
              {t("map.infoCard.navigate", "Chỉ đường tới đây")}
            </button>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`info-card__icon-btn ${isLiked ? "is-liked" : ""}`}
              title={t("map.infoCard.favorite", "Lưu vào danh sách yêu thích")}
            >
              <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: markerName, text: markerDesc });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  alert(t("map.infoCard.copied", "Đã sao chép liên kết chia sẻ địa điểm!"));
                }
              }}
              className="info-card__icon-btn"
              title={t("map.infoCard.share", "Chia sẻ địa điểm")}
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up chi tiết phóng to giữa màn hình */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimalDetailModal
            marker={marker}
            markers={markers}
            onClose={() => setIsModalOpen(false)}
            onStartRouteMode={onStartRouteMode}
            onPathReady={onPathReady}
          />,
          document.body
        )}

      {/* Popup chỉ đường từ info card nhỏ */}
      {showRoute && (
        <RoutePickerModal
          destination={marker}
          markers={markers}
          onClose={() => setShowRoute(false)}
          onStartRouteMode={onStartRouteMode}
          onPathReady={(path) => {
            onPathReady?.(path);
            setShowRoute(false);
          }}
        />
      )}
    </>
  );
}