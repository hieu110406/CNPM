// MapInfoCard.jsx
// Thẻ thông tin chi tiết địa điểm: Ảnh/Emoji đại diện, audio thuyết minh sinh động, giờ cho ăn, fun fact & chỉ đường

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
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

  // Reset audio state khi chọn marker khác
  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
  }, [marker?.id]);

  // Giả lập phát audio thuyết minh thông minh
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
    <div
      className="absolute bottom-5 left-5 z-30 w-88 max-w-[calc(100vw-3rem)] overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-all"
      style={{
        animation: "slideInSpring 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Banner đầu trang có màu sắc rực rỡ theo loại */}
      <div
        className="relative flex items-center justify-between p-4 pb-3"
        style={{
          background: `linear-gradient(135deg, ${meta.bgLight}, #ffffff)`,
          borderBottom: `1px solid ${meta.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform hover:scale-105"
            style={{
              backgroundColor: meta.color,
              boxShadow: `0 4px 12px ${meta.color}35`,
            }}
          >
            {marker.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: meta.color }}
              >
                {meta.label}
              </span>
              {marker.zone && (
                <span className="text-[11px] font-medium text-slate-500">
                  {marker.zone}
                </span>
              )}
            </div>
            <h3 className="mt-0.5 text-base font-bold text-slate-900 line-clamp-1">
              {marker.name}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          aria-label="Đóng"
        >
          <X size={15} />
        </button>
      </div>

      {/* Nội dung chi tiết */}
      <div className="space-y-3 p-4">
        {/* Mô tả vị trí */}
        <p className="text-xs leading-relaxed text-slate-600">
          {marker.desc}
        </p>

        {/* Giờ cho ăn hoặc giờ hoạt động */}
        {(marker.feedingTime || marker.openingHours) && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 px-3 py-2 text-xs text-amber-900 border border-amber-200/60">
            <Clock size={14} className="shrink-0 text-amber-600" />
            <div className="flex-1">
              {marker.feedingTime && (
                <p className="font-semibold text-amber-950">
                  🍖 Giờ cho ăn: <span className="font-medium text-amber-800">{marker.feedingTime}</span>
                </p>
              )}
              {marker.openingHours && (
                <p className="text-[11px] text-amber-800">
                  Mở cửa: {marker.openingHours}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bạn có biết (Fun fact) */}
        {marker.funFact && (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50/70 p-2.5 text-xs text-emerald-900 border border-emerald-100">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="leading-snug text-emerald-800">
              <span className="font-semibold text-emerald-950">Bạn có biết? </span>
              {marker.funFact}
            </p>
          </div>
        )}

        {/* Trình phát Audio thuyết minh thông minh */}
        {marker.audioAvailable && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Volume2 size={15} className="text-emerald-600" />
                Thuyết minh giọng đọc AI
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                00:{audioProgress < 10 ? `0${Math.floor(audioProgress * 0.45)}` : Math.floor(audioProgress * 0.45)} / 00:45
              </span>
            </div>

            {/* Thanh tiến trình audio */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-200"
                style={{ width: `${audioProgress}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="flex items-center gap-2 rounded-full bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-95"
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

              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <Headphones size={13} /> Tiếng Việt (chuẩn)
              </span>
            </div>
          </div>
        )}

        {/* Hàng nút hành động tương tác */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => alert(`Bắt đầu dẫn đường đến: ${marker.name}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-98"
          >
            <Navigation size={14} />
            Chỉ đường tới đây
          </button>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-90 ${
              isLiked
                ? "border-rose-200 bg-rose-50 text-rose-600 shadow-xs"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 active:scale-90"
            title="Chia sẻ địa điểm"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInSpring {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
