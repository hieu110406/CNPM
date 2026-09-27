// MapCanvas.jsx
// Vùng bản đồ: ảnh nền thật + lớp marker phủ lên trên theo toạ độ %.
// Không biết gì về sidebar/legend — chỉ nhận props và bắn callback ra ngoài.

import React from "react";
import MapMarkerPin from "./MapMarkerPin";
import { MARKERS, TYPE_META } from "./mapData";

export default function MapCanvas({
  mapImageSrc,
  zoom,
  selectedId,
  onSelectMarker,
  isDimmed,
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-emerald-50">
      <div
        className="absolute inset-0 origin-center transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Ảnh bản đồ thật của bạn */}
        <img
          src={mapImageSrc}
          alt="Bản đồ Thảo Cầm Viên"
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
          draggable={false}
        />

        {/* Lớp marker phủ lên trên ảnh, định vị theo % */}
        {MARKERS.map((m) => (
          <div key={m.id} className="absolute" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
            <MapMarkerPin
              color={selectedId === m.id ? "#1b4332" : TYPE_META[m.type].color}
              active={selectedId === m.id}
              dimmed={isDimmed(m)}
              onClick={() => onSelectMarker(m.id)}
            >
              {m.emoji}
            </MapMarkerPin>
          </div>
        ))}
      </div>
    </div>
  );
}
