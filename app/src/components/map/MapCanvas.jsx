// MapCanvas.jsx
// Vùng bản đồ: ảnh nền Thảo Cầm Viên + lớp marker phủ định vị theo %
// Hỗ trợ Drag/Pan chuột kéo rê mượt mà, cuộn chuột để Zoom, giữ nguyên tỉ lệ ảnh gốc không méo/crop

import React, { useRef, useState, useEffect } from "react";
import MapMarkerPin from "./MapMarkerPin";
import { MARKERS, TYPE_META } from "./mapData";

export default function MapCanvas({
  mapImageSrc,
  zoom,
  setZoom,
  selectedId,
  onSelectMarker,
  isDimmed,
  pan,
  setPan,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Xử lý kéo rê bản đồ bằng chuột (Pan)
  const handleMouseDown = (e) => {
    // Chỉ kích hoạt khi click chuột trái và không click vào nút pin
    if (e.button !== 0) return;
    if (e.target.closest("button")) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Hỗ trợ cuộn chuột để phóng to / thu nhỏ
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom?.((prevZoom) => {
      const nextZoom = +(prevZoom + zoomDelta).toFixed(2);
      return Math.min(2.5, Math.max(0.6, nextZoom));
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [setZoom]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative h-full w-full overflow-hidden select-none bg-[#eaf4ec] ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        backgroundImage: "radial-gradient(#c6e3cf 1.2px, transparent 1.2px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Khung bản đồ: Căn giữa tuyệt đối với tỉ lệ ảnh gốc 1371 / 875 */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative transition-transform ease-out will-change-transform"
          style={{
            width: "100%",
            maxWidth: "1371px",
            aspectRatio: "1371 / 875",
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transitionDuration: isDragging ? "0ms" : "200ms",
          }}
        >
          {/* Lớp bóng đổ mềm mại dưới ảnh bản đồ */}
          <div className="absolute inset-0 rounded-3xl shadow-[0_20px_60px_-15px_rgba(6,78,59,0.25)] pointer-events-none" />

          {/* Ảnh bản đồ thật */}
          <img
            src={mapImageSrc}
            alt="Bản đồ Thảo Cầm Viên Sài Gòn"
            className="block h-full w-full rounded-2xl object-cover pointer-events-none select-none shadow-sm"
            draggable={false}
          />

          {/* Lớp marker phủ lên trên ảnh, toạ độ % hoàn toàn chuẩn xác */}
          {MARKERS.map((m) => (
            <div
              key={m.id}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
              }}
            >
              <MapMarkerPin
                marker={m}
                color={TYPE_META[m.type]?.color || "#059669"}
                active={selectedId === m.id}
                dimmed={isDimmed(m)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMarker(m.id);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gợi ý tương tác góc nhỏ */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/60 bg-white/70 px-4 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm backdrop-blur-md transition-opacity">
        💡 Kéo rê chuột để di chuyển • Cuộn chuột hoặc dùng nút +/- để phóng to
      </div>
    </div>
  );
}
