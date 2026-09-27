// MapMarkerPin.jsx
// Pin đánh dấu vị trí sang trọng với tooltip xem trước khi rê chuột, hiệu ứng sonar khi active

import React, { useState } from "react";
import { Headphones } from "lucide-react";

export default function MapMarkerPin({
  marker,
  color = "#059669",
  active = false,
  dimmed = false,
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        opacity: dimmed ? 0.2 : 1,
        transition: "opacity 0.25s ease, transform 0.25s ease",
        transform: active ? "scale(1.15)" : isHovered ? "scale(1.1)" : "scale(1)",
        zIndex: active ? 40 : isHovered ? 35 : 10,
      }}
    >
      {/* Tooltip hiển thị khi rê chuột */}
      {(isHovered || active) && marker && (
        <div
          className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/80 bg-slate-900/90 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md"
          style={{
            animation: "pinTooltipFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <span>{marker.emoji}</span>
            <span className="font-semibold text-emerald-300">{marker.name}</span>
            {marker.audioAvailable && (
              <Headphones size={12} className="text-amber-400" />
            )}
          </div>
          {marker.zone && (
            <p className="text-[10px] text-slate-300 font-normal">{marker.zone}</p>
          )}

          {/* Mũi tên tam giác chỉ xuống */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900/90" />
        </div>
      )}

      {/* Vòng lan tỏa (Sonar Pulse) khi marker được chọn */}
      {active && (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
          style={{ backgroundColor: color, opacity: 0.45 }}
        />
      )}

      {/* Thân Pin hình giọt nước đổ bóng 3D */}
      <button
        onClick={onClick}
        className="group relative flex items-center justify-center focus:outline-none"
        title={marker?.name}
        aria-label={marker?.name}
      >
        <div
          className="relative flex h-9 w-9 items-center justify-center rounded-full rounded-bl-none shadow-lg transition-transform duration-200"
          style={{
            background: active
              ? `linear-gradient(135deg, ${color}, #064e3b)`
              : `linear-gradient(135deg, ${color}, ${color}dd)`,
            transform: "rotate(-45deg)",
            boxShadow: active
              ? `0 6px 16px ${color}88, 0 0 0 3px #ffffff`
              : "0 4px 10px rgba(0,0,0,0.22), 0 0 0 2px #ffffff",
          }}
        >
          {/* Emoji bên trong xoay lại thẳng đứng */}
          <span
            style={{ transform: "rotate(45deg)" }}
            className="text-[15px] leading-none drop-shadow-sm transition-transform duration-200 group-hover:scale-115"
          >
            {marker?.emoji || "📍"}
          </span>

          {/* Huy hiệu mini có audio */}
          {marker?.audioAvailable && (
            <span
              className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] text-slate-900 shadow ring-1 ring-white"
              style={{ transform: "rotate(45deg)" }}
            >
              🎧
            </span>
          )}
        </div>
      </button>

      <style>{`
        @keyframes pinTooltipFade {
          from {
            opacity: 0;
            transform: translate(-50%, 6px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
