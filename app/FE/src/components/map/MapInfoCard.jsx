// MapInfoCard.jsx
// Thẻ thông tin chi tiết địa điểm: emoji đại diện, audio thuyết minh, giờ cho ăn, pop-up xem ảnh chi tiết & chỉ đường

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  Play,
  Pause,
  Navigation,
  Share2,
  Heart,
  ExternalLink,
} from "lucide-react";
import { TYPE_META } from "./mapData";
import AnimalDetailModal from "./AnimalDetailModal";

const TOTAL_SECONDS = 45;
const fmt = (s) => `00:${String(s).padStart(2, "0")}`;

export default function MapInfoCard({ marker, onClose }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prevId, setPrevId] = useState(marker?.id);

  // Đồng bộ reset state khi chuyển sang marker khác
  if (marker?.id !== prevId) {
    setPrevId(marker?.id);
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setIsModalOpen(false);
  }

  useEffect(() => {
    if (!isPlayingAudio) return;
    const interval = setInterval(() => {
      setAudioProgress((prev) => {
        if (prev >= 100) {
          setIsPlayingAudio(false);
          return 0;
        }
        return prev + 2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  if (!marker) return null;

  const meta = TYPE_META[marker.type] || TYPE_META.animal;
  const elapsed = Math.floor((audioProgress / 100) * TOTAL_SECONDS);

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
            {marker.emoji}
          </span>
          <span className="info-card__type">{meta.label}</span>
          <button onClick={onClose} className="info-card__close" aria-label="Đóng">
            <X size={14} />
          </button>
        </div>

        <div className="info-card__body">
          <div className="info-card__avatar">{marker.emoji}</div>

          <div>
            <h3 className="info-card__name">{marker.name}</h3>
            {marker.zone && <p className="info-card__zone">{marker.zone}</p>}
          </div>

          <p className="info-card__desc">{marker.desc}</p>

          {/* Nút mở Pop-up xem chi tiết đầy đủ & hình ảnh */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="info-card__more"
            title="Mở bảng thông tin chi tiết và album hình ảnh"
          >
            <span>Xem chi tiết & hình ảnh</span>
            <ExternalLink size={12} />
          </button>

          {/* Giờ hoạt động: luôn hiện gọn */}
          {(marker.feedingTime || marker.openingHours) && (
            <div className="info-card__time">
              <Clock size={14} className="info-card__time-icon" />
              <div>
                {marker.feedingTime && (
                  <p>
                    🍖 Giờ cho ăn: <b>{marker.feedingTime}</b>
                  </p>
                )}
                {marker.openingHours && (
                  <p>
                    Mở cửa: <b>{marker.openingHours}</b>
                  </p>
                )}
              </div>
            </div>
          )}

          {marker.audioAvailable && (
            <div className="audio">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="audio__play"
                aria-label={isPlayingAudio ? "Tạm dừng" : "Nghe thuyết minh"}
              >
                {isPlayingAudio ? (
                  <Pause size={12} fill="currentColor" />
                ) : (
                  <Play size={12} fill="currentColor" />
                )}
              </button>

              <div className="audio__main">
                <span className="audio__title">Nghe thuyết minh</span>
                <div className="audio__track">
                  <div className="audio__bar" style={{ width: `${audioProgress}%` }} />
                </div>
              </div>

              <span className="audio__time">
                {isPlayingAudio || audioProgress > 0 ? fmt(elapsed) : fmt(TOTAL_SECONDS)}
              </span>
            </div>
          )}

          <div className="info-card__actions">
            <button
              onClick={() => alert(`Bắt đầu dẫn đường đến: ${marker.name}`)}
              className="info-card__nav"
            >
              <Navigation size={13} />
              Chỉ đường tới đây
            </button>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`info-card__icon-btn ${isLiked ? "is-liked" : ""}`}
              title="Lưu vào danh sách yêu thích"
            >
              <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: marker.name, text: marker.desc });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Đã sao chép liên kết chia sẻ địa điểm!");
                }
              }}
              className="info-card__icon-btn"
              title="Chia sẻ địa điểm"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up chi tiết phóng to giữa màn hình */}
      {isModalOpen && typeof document !== "undefined" && createPortal(
        <AnimalDetailModal
          marker={marker}
          onClose={() => setIsModalOpen(false)}
        />,
        document.body
      )}
    </>
  );
}