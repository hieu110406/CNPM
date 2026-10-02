// MapMarkerPin.jsx
// Pin đánh dấu vị trí với tooltip xem trước khi rê chuột, hiệu ứng sonar khi active

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
      className="pin"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        opacity: dimmed ? 0.2 : 1,
        transition: "opacity 0.25s ease, transform 0.25s ease",
        transform: active ? "scale(1.15)" : isHovered ? "scale(1.1)" : "scale(1)",
        zIndex: active ? 40 : isHovered ? 35 : 10,
      }}
    >
      {(isHovered || active) && marker && (
        <div className="pin__tooltip">
          <div className="pin__tooltip-row">
            <span>{marker.emoji}</span>
            <span className="pin__tooltip-name">{marker.name}</span>
            {marker.audioAvailable && (
              <Headphones size={12} className="pin__tooltip-audio" />
            )}
          </div>
          {marker.zone && <p className="pin__tooltip-zone">{marker.zone}</p>}
          <div className="pin__tooltip-arrow" />
        </div>
      )}

      {active && (
        <span
          className="pin__pulse"
          style={{ backgroundColor: color, opacity: 0.45 }}
        />
      )}

      <button
        onClick={onClick}
        className="pin__btn"
        title={marker?.name}
        aria-label={marker?.name}
      >
        <div
          className="pin__body"
          style={{
            background: active
              ? `linear-gradient(135deg, ${color}, #064e3b)`
              : `linear-gradient(135deg, ${color}, ${color}dd)`,
            boxShadow: active
              ? `0 6px 16px ${color}88, 0 0 0 3px #ffffff`
              : "0 4px 10px rgba(0,0,0,0.22), 0 0 0 2px #ffffff",
          }}
        >
          <span className="pin__emoji">{marker?.emoji || "📍"}</span>

          {marker?.audioAvailable && <span className="pin__badge">🎧</span>}
        </div>
      </button>
    </div>
  );
}