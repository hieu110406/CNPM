// MapControls.jsx
// Nút điều khiển bản đồ: Zoom In/Out, La bàn N, Về vị trí trung tâm, Bật toàn màn hình

import React, { useState } from "react";
import { Plus, Minus, LocateFixed, Maximize2, Minimize2 } from "lucide-react";

export default function MapControls({ onZoomIn, onZoomOut, onReset, zoom = 1 }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="map-controls">
      <div className="map-controls__zoom glass">
        <button onClick={onZoomIn} className="map-btn" title="Phóng to">
          <Plus size={18} strokeWidth={2.4} />
        </button>

        <div className="map-controls__pct">{Math.round(zoom * 100)}%</div>

        <button onClick={onZoomOut} className="map-btn" title="Thu nhỏ">
          <Minus size={18} strokeWidth={2.4} />
        </button>
      </div>

      <button
        onClick={onReset}
        className="map-btn map-btn--solid"
        title="Về trung tâm bản đồ"
      >
        <LocateFixed size={18} />
      </button>

      <button
        onClick={toggleFullscreen}
        className="map-btn map-btn--solid"
        title={isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
      >
        {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
      </button>

      <div className="map-compass glass" title="Hướng Bắc">
        <div className="map-compass__inner">
          <span className="map-compass__arrow">▲</span>
          <span className="map-compass__n">N</span>
        </div>
      </div>
    </div>
  );
}