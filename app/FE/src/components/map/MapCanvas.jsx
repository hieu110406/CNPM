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
  markers = MARKERS,
  pathNodes = [], // [{code, name, x, y}] kết quả Dijkstra — vẽ SVG lên bản đồ
  routeStartId,
  routeEndId,
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

          {/* SVG overlay: vẽ đường đi ngắn nhất Dijkstra */}
          {pathNodes && pathNodes.length >= 2 && (() => {
            const pointsStr = pathNodes
              .map((n) => `${(Number(n.x) * 13.71).toFixed(1)},${(Number(n.y) * 8.75).toFixed(1)}`)
              .join(" ");

            const startNode = pathNodes[0];
            const endNode = pathNodes[pathNodes.length - 1];
            const startX = (Number(startNode.x) * 13.71).toFixed(1);
            const startY = (Number(startNode.y) * 8.75).toFixed(1);
            const endX = (Number(endNode.x) * 13.71).toFixed(1);
            const endY = (Number(endNode.y) * 8.75).toFixed(1);

            return (
              <svg
                viewBox="0 0 1371 875"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  overflow: "visible",
                  zIndex: 8,
                }}
              >
                <defs>
                  <marker
                    id="rp-arrow"
                    markerWidth="6"
                    markerHeight="6"
                    refX="4"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L0,6 L6,3 z" fill="#047857" />
                  </marker>
                </defs>

                {/* 1. Đổ bóng viền ngoài */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.2)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 2. Đường viền trắng dày làm nổi bật trên nền bản đồ */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 3. Đường chính nét đứt xanh lá đậm chạy animation */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="10 6"
                  markerEnd="url(#rp-arrow)"
                  className="path-line-animated"
                />

                {/* 4. Các điểm dừng trung gian */}
                {pathNodes.slice(1, -1).map((n, idx) => {
                  const cx = (Number(n.x) * 13.71).toFixed(1);
                  const cy = (Number(n.y) * 8.75).toFixed(1);
                  const isWaypoint = n.category === "waypoint";
                  if (isWaypoint) {
                    return (
                      <circle
                        key={n.node_id || n.code || idx}
                        cx={cx}
                        cy={cy}
                        r="3"
                        fill="#047857"
                        opacity="0.6"
                      />
                    );
                  }
                  return (
                    <circle
                      key={n.node_id || n.code || idx}
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill="#047857"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* 5. Điểm bắt đầu (Xanh lá) */}
                <circle
                  cx={startX}
                  cy={startY}
                  r="14"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  opacity="0.8"
                />
                <circle
                  cx={startX}
                  cy={startY}
                  r="8"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="3"
                />
                <circle
                  cx={startX}
                  cy={startY}
                  r="3"
                  fill="#ffffff"
                />
                {/* 6. Điểm đích đến (Đỏ) */}
                <circle
                  cx={endX}
                  cy={endY}
                  r="14"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  opacity="0.8"
                />
                <circle
                  cx={endX}
                  cy={endY}
                  r="8"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="3"
                />
                <circle
                  cx={endX}
                  cy={endY}
                  r="3"
                  fill="#ffffff"
                />
              </svg>
            );
          })()}

          {markers.map((m) => (
            <div
              key={m.id}
              className="map-canvas__marker"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <MapMarkerPin
                marker={m}
                color={
                  routeStartId === m.id
                    ? "#047857"
                    : routeEndId === m.id
                      ? "#dc2626"
                      : TYPE_META[m.type]?.color
                }
                active={
                  selectedId === m.id ||
                  routeStartId === m.id ||
                  routeEndId === m.id
                }
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