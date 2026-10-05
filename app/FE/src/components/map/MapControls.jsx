// MapInfoCard.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  Sparkles,
  Play,
  Pause,
  Navigation,
  Share2,
  Heart,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { TYPE_META } from "./mapData";

const TOTAL_SECONDS = 45;
const fmt = (s) => `00:${String(s).padStart(2, "0")}`;

export default function MapInfoCard({ marker, onClose }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setShowDetail(false);
  }, [marker?.id]);

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

  // Đóng popup bằng phím Esc
  useEffect(() => {
    if (!showDetail) return;
    const onKey = (e) => e.key === "Escape" && setShowDetail(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDetail]);

  if (!marker) return null;

  const meta = TYPE_META[marker.type] || TYPE_META.animal;
  const bannerBg = `linear-gradient(135deg, ${meta.color}, ${meta.color}b3)`;
  const elapsed = Math.floor((audioProgress / 100) * TOTAL_SECONDS);

  return (
    <>
      <div className="info-card">
        <div className="info-card__banner" style={{ background: bannerBg }}>
          <span className="info-card__watermark" aria-hidden="true">
            {marker.emoji}
          </span>
          <span className="info-card__type">{meta.label}</span>
          <button onClick={onClose} className="info-card__close" aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        <div className="info-card__body">
          <div className="info-card__avatar">{marker.emoji}</div>

          <div>
            <h3 className="info-card__name">{marker.name}</h3>
            {marker.zone && <p className="info-card__zone">{marker.zone}</p>}
          </div>

          <p className="info-card__desc">{marker.desc}</p>

          {(marker.feedingTime || marker.openingHours) && (
            <div className="info-card__time">
              <Clock size={16} className="info-card__time-icon" />
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

          {marker.funFact && (
            <button
              onClick={() => setShowDetail(true)}
              className="info-card__more"
            >
              Xem chi tiết
              <ChevronRight size={14} />
            </button>
          )}

          {marker.audioAvailable && (
            <div className="audio">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="audio__play"
                aria-label={isPlayingAudio ? "Tạm dừng" : "Nghe thuyết minh"}
              >
                {isPlayingAudio ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
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
              <Navigation size={16} />
              Chỉ đường tới đây
            </button>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`info-card__icon-btn ${isLiked ? "is-liked" : ""}`}
              title="Lưu vào danh sách yêu thích"
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
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
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Popup xem chi tiết ===== */}
      {showDetail &&
        createPortal(
          <div
            className="detail-modal__backdrop"
            onClick={() => setShowDetail(false)}
          >
            <div
              className="detail-modal"
              role="dialog"
              aria-modal="true"
              aria-label={marker.name}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="detail-modal__banner"
                style={{ background: bannerBg }}
              >
                <span className="info-card__watermark" aria-hidden="true">
                  {marker.emoji}
                </span>
                <span className="info-card__type">{meta.label}</span>
                <button
                  onClick={() => setShowDetail(false)}
                  className="info-card__close"
                  aria-label="Đóng"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="detail-modal__body">
                <div className="info-card__avatar">{marker.emoji}</div>

                <div>
                  <h3 className="detail-modal__name">{marker.name}</h3>
                  {marker.zone && (
                    <p className="detail-modal__zone">
                      <MapPin size={13} /> {marker.zone}
                    </p>
                  )}
                </div>

                <p className="detail-modal__desc">{marker.desc}</p>

                {(marker.feedingTime || marker.openingHours) && (
                  <div className="info-card__time">
                    <Clock size={16} className="info-card__time-icon" />
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

                {marker.funFact && (
                  <div className="info-card__fact">
                    <Sparkles size={14} className="info-card__fact-icon" />
                    <p>
                      <strong>Bạn có biết? </strong>
                      {marker.funFact}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowDetail(false)}
                  className="detail-modal__done"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}