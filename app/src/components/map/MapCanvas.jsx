// MapCanvas.jsx
// Vùng bản đồ: ảnh nền + marker, kéo rê (pan), lăn chuột để zoom

import React, { useRef, useState } from "react";
import MapMarkerPin from "./MapMarkerPin";
import { MARKERS, TYPE_META } from "./mapData";

export default function MapCanvas({
  mapImageSrc,
  zoom,
  setZoom,
  pan,
  setPan,
  selectedId,
  onSelectMarker,
  isDimmed,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef({ startX: 0, startY: 0, originX: 0, originY: 0, moved: false });

  const handlePointerDown = (e) => {
    if (e.target.closest(".pin")) return; // bấm vào pin thì không kéo
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
      moved: false,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    setPan({ x: drag.current.originX + dx, y: drag.current.originY + dy });
  };

  const endDrag = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(2.5, Math.max(0.6, +(z + delta).toFixed(2))));
  };

  return (
    <div
      className={`map-canvas ${isDragging ? "is-dragging" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={handleWheel}
    >
      <div className="map-canvas__viewport">
        <div
          className="map-canvas__frame"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transitionDuration: isDragging ? "0ms" : "300ms",
          }}
        >
          <div className="map-canvas__shadow" />
          <img
            src={mapImageSrc}
            alt="Bản đồ Thảo Cầm Viên Sài Gòn"
            className="map-canvas__img"
            draggable={false}
          />

          {MARKERS.map((m) => (
            <div
              key={m.id}
              className="map-canvas__marker"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <MapMarkerPin
                marker={m}
                color={TYPE_META[m.type]?.color}
                active={selectedId === m.id}
                dimmed={isDimmed(m)}
                onClick={() => onSelectMarker(m.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="map-canvas__hint" style={{ opacity: isDragging ? 0 : 1 }}>
        Kéo để di chuyển • Lăn chuột để phóng to / thu nhỏ
      </div>
    </div>
  );
}