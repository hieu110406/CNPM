// MapInfoCard.jsx
// Thẻ thông tin chi tiết địa điểm: emoji đại diện, audio thuyết minh, giờ cho ăn, fun fact & chỉ đường

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Sparkles,
  Headphones,
  Play,
  Pause,
  Navigation,
  Share2,
  Heart,
  Volume2,
} from "lucide-react";
import { TYPE_META } from "./mapData";

export default function MapInfoCard({ marker, onClose }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
  }, [marker?.id]);

  useEffect(() => {
    let interval;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  if (!marker) return null;

  const meta = TYPE_META[marker.type] || TYPE_META.animal;

  return (
    <div className="info-card">
      {/* Banner đầu thẻ, màu theo loại địa điểm */}
      <div
        className="info-card__banner"
        style={{
          background: `linear-gradient(135deg, ${meta.bgLight}, #ffffff)`,
          borderBottom: `1px solid ${meta.border}`,
        }}
      >
        <div className="info-card__banner-left">
          <div
            className="info-card__avatar"
            style={{
              backgroundColor: meta.color,
              boxShadow: `0 4px 12px ${meta.color}35`,
            }}
          >
            {marker.emoji}
          </div>
          <div>
            <div className="info-card__tags">
              <span
                className="info-card__type"
                style={{ backgroundColor: meta.color }}
              >
                {meta.label}
              </span>
              {marker.zone && <span className="info-card__zone">{marker.zone}</span>}
            </div>
            <h3 className="info-card__name">{marker.name}</h3>
          </div>
        </div>

        <button onClick={onClose} className="info-card__close" aria-label="Đóng">
          <X size={15} />
        </button>
      </div>

      <div className="info-card__body">
        <p className="info-card__desc">{marker.desc}</p>

        {(marker.feedingTime || marker.openingHours) && (
          <div className="info-card__time">
            <Clock size={14} className="info-card__time-icon" />
            <div className="info-card__time-text">
              {marker.feedingTime && (
                <p className="info-card__feeding">
                  🍖 Giờ cho ăn: <span>{marker.feedingTime}</span>
                </p>
              )}
              {marker.openingHours && (
                <p className="info-card__opening">Mở cửa: {marker.openingHours}</p>
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

        {marker.audioAvailable && (
          <div className="audio">
            <div className="audio__head">
              <span className="audio__title">
                <Volume2 size={15} className="ic-emerald" />
                Thuyết minh giọng đọc AI
              </span>
              <span className="audio__time">
                00:{audioProgress < 10 ? `0${Math.floor(audioProgress * 0.45)}` : Math.floor(audioProgress * 0.45)} / 00:45
              </span>
            </div>

            <div className="audio__track">
              <div className="audio__bar" style={{ width: `${audioProgress}%` }} />
            </div>

            <div className="audio__foot">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="audio__play"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause size={13} /> Tạm dừng
                  </>
                ) : (
                  <>
                    <Play size={13} /> Nghe thuyết minh
                  </>
                )}
              </button>

              <span className="audio__lang">
                <Headphones size={13} /> Tiếng Việt (chuẩn)
              </span>
            </div>
          </div>
        )}

        <div className="info-card__actions">
          <button
            onClick={() => alert(`Bắt đầu dẫn đường đến: ${marker.name}`)}
            className="info-card__nav"
          >
            <Navigation size={14} />
            Chỉ đường tới đây
          </button>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`info-card__icon-btn ${isLiked ? "is-liked" : ""}`}
            title="Lưu vào danh sách yêu thích"
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
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
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}