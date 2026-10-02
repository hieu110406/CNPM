// components/audio/AudioPlayer.jsx
// Trình phát thuyết minh âm thanh tự động cho Thảo Cầm Viên (End-user Audio Guide)

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Languages,
  Radio,
  ChevronUp,
  X,
} from "lucide-react";

export function MiniPlayer({
  track,
  isPlaying,
  onTogglePlay,
  onOpenFull,
  onClose,
  progress = 0,
}) {
  if (!track) return null;

  return (
    <div className="mini-player-bar">
      {/* Thanh tiến trình siêu mỏng trên đầu */}
      <div className="mini-player-progress-bg">
        <div
          className="mini-player-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mini-player-inner" onClick={onOpenFull}>
        <div className="mini-player-info">
          <div className="mini-player-avatar">
            <span className="mini-player-emoji">{track.emoji || "🎧"}</span>
            {isPlaying && (
              <span className="mini-player-pulse">
                <Radio size={12} className="animate-spin text-emerald-500" />
              </span>
            )}
          </div>
          <div className="mini-player-text">
            <p className="mini-player-title">{track.title || track.name}</p>
            <p className="mini-player-subtitle">
              {isPlaying ? "Đang thuyết minh..." : "Tạm dừng"} • {track.zone || "Thảo Cầm Viên"}
            </p>
          </div>
        </div>

        <div className="mini-player-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="mini-player-btn mini-player-btn--play"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Tạm dừng" : "Phát thuyết minh"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
          </button>
          <button
            type="button"
            className="mini-player-btn mini-player-btn--expand"
            onClick={onOpenFull}
            title="Mở trình phát đầy đủ"
          >
            <ChevronUp size={16} />
          </button>
          {onClose && (
            <button
              type="button"
              className="mini-player-btn mini-player-btn--close"
              onClick={onClose}
              title="Đóng trình phát"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AudioPlayer({
  track,
  isPlaying = false,
  onTogglePlay,
  onNext,
  onPrev,
  language = "vi",
  onToggleLanguage,
  autoGps = true,
  onToggleAutoGps,
}) {
  const [currentTime, setCurrentTime] = useState(24);
  const [duration, setDuration] = useState(135);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);

  // Giả lập tiến trình phát âm thanh thuyết minh
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            onTogglePlay?.();
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, duration, playbackRate, onTogglePlay]);

  // Đặt lại thời gian khi chuyển bài
  useEffect(() => {
    setCurrentTime(0);
    setDuration(track?.duration || 140);
  }, [track?.id]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(pos * duration));
  }

  function handleSkip(delta) {
    setCurrentTime((t) => Math.max(0, Math.min(duration, t + delta)));
  }

  function cycleRate() {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player-card">
      {/* Header trình phát */}
      <div className="audio-player-head">
        <div className="audio-player-tag">
          <span className="audio-player-live-dot" />
          <span>Thuyết minh tự động (Audio Tour)</span>
        </div>
        <div className="audio-player-top-actions">
          <button
            type="button"
            className={`audio-badge-btn ${autoGps ? "is-active" : ""}`}
            onClick={onToggleAutoGps}
            title="Tự động phát khi đến gần toạ độ thú"
          >
            <Radio size={13} className={autoGps ? "animate-pulse" : ""} />
            <span>GPS Auto</span>
          </button>
          <button
            type="button"
            className="audio-badge-btn"
            onClick={onToggleLanguage}
            title="Đổi ngôn ngữ thuyết minh"
          >
            <Languages size={13} />
            <span>{language === "vi" ? "Tiếng Việt" : "English"}</span>
          </button>
        </div>
      </div>

      {/* Thông tin bài thuyết minh */}
      <div className="audio-track-main">
        <div className="audio-track-avatar">
          <span className="audio-track-emoji">{track?.emoji || "🦒"}</span>
          {isPlaying && (
            <div className="audio-waves">
              <span className="wave-bar wave-1" />
              <span className="wave-bar wave-2" />
              <span className="wave-bar wave-3" />
              <span className="wave-bar wave-4" />
              <span className="wave-bar wave-5" />
            </div>
          )}
        </div>

        <div className="audio-track-meta">
          <h4 className="audio-track-title">{track?.name || "Voi Châu Á - Thảo Cầm Viên"}</h4>
          <p className="audio-track-zone">{track?.zone || "Khu thú lớn • Trạm số 04"}</p>
          <p className="audio-track-desc">
            {track?.desc ||
              "Lắng nghe thuyết minh chi tiết về tập tính, nguồn gốc và lịch sử bảo tồn động vật tại Thảo Cầm Viên Sài Gòn."}
          </p>
        </div>
      </div>

      {/* Thanh tiến trình */}
      <div className="audio-scrubber-wrapper">
        <div className="audio-scrubber" onClick={handleSeek}>
          <div className="audio-scrubber-rail">
            <div
              className="audio-scrubber-fill"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="audio-scrubber-thumb"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="audio-time-row">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(duration - currentTime)}</span>
        </div>
      </div>

      {/* Bộ điều khiển chính */}
      <div className="audio-controls-row">
        <button
          type="button"
          className="audio-ctrl-btn audio-ctrl-btn--rate"
          onClick={cycleRate}
          title="Tốc độ đọc"
        >
          {playbackRate}x
        </button>

        <button
          type="button"
          className="audio-ctrl-btn"
          onClick={() => handleSkip(-10)}
          title="Lùi 10 giây"
        >
          <RotateCcw size={18} />
          <span className="audio-ctrl-skip-label">10s</span>
        </button>

        <button
          type="button"
          className="audio-ctrl-btn audio-ctrl-btn--play"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
        </button>

        <button
          type="button"
          className="audio-ctrl-btn"
          onClick={() => handleSkip(10)}
          title="Tua tới 10 giây"
        >
          <RotateCw size={18} />
          <span className="audio-ctrl-skip-label">10s</span>
        </button>

        <button
          type="button"
          className="audio-ctrl-btn"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
}
