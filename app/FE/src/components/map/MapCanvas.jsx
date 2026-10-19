
import React, { useRef, useState } from "react";
import MapMarkerPin from "./MapMarkerPin";
import { MARKERS, TYPE_META } from "./mapData";

// Làm mềm đường gấp khúc thành đường cong mượt (Catmull-Rom -> Bezier).
// Giữ nguyên các điểm path đi qua, chỉ bo cong ở khúc cua nên vẫn bám đường công viên.
function buildSmoothPath(pts) {
  if (!pts || pts.length < 2) return "";
  if (pts.length === 2) {
    return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;
  }
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function MapCanvas({
  t,
  mapImageSrc,
  zoom,
  setZoom,
  pan,
  setPan,
  selectedId,
  onSelectMarker,
  isDimmed,
<<<<<<< HEAD
  pathNodes = [],
=======
  markers = MARKERS,
  pathNodes = [], // [{code, name, x, y}] kết quả Dijkstra — vẽ SVG lên bản đồ
  routeStartId,
  routeEndId,
>>>>>>> main
}) {
  const [isDragging, setIsDragging] = useState(false);

  const drag = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  // Lấy nội dung theo ngôn ngữ đang chọn
  const translate = (key, fallback) => {
    const value = typeof t === "function" ? t(key) : null;

    return value && value !== key ? value : fallback;
  };

  // Bắt đầu kéo bản đồ
  const handlePointerDown = (e) => {
    if (e.target.closest(".pin")) return;

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

  // Di chuyển bản đồ
  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;

    if (Math.abs(dx) + Math.abs(dy) > 3) {
      drag.current.moved = true;
    }

    setPan({
      x: drag.current.originX + dx,
      y: drag.current.originY + dy,
    });
  };

  // Kết thúc kéo bản đồ
  const endDrag = (e) => {
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Phóng to và thu nhỏ bằng con lăn chuột
  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;

    setZoom((z) =>
      Math.min(2.5, Math.max(0.6, +(z + delta).toFixed(2)))
    );
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

          {/* Ảnh bản đồ */}
          <img
            src={mapImageSrc}
            alt={translate(
              "map.canvas.imageAlt",
              "Bản đồ Thảo Cầm Viên Sài Gòn"
            )}
            className="map-canvas__img"
            draggable={false}
          />

<<<<<<< HEAD
          {/* Vẽ đường đi ngắn nhất Dijkstra */}
          {pathNodes &&
            pathNodes.length >= 2 &&
            (() => {
              const pointsStr = pathNodes
                .map(
                  (n) =>
                    `${(Number(n.x) * 13.71).toFixed(1)},${(
                      Number(n.y) * 8.75
                    ).toFixed(1)}`
                )
                .join(" ");
=======
          {/* SVG overlay: vẽ đường đi ngắn nhất Dijkstra (bo cong mềm mại) */}
          {pathNodes && pathNodes.length >= 2 && (() => {
            const px = (n) => Number(n.x) * 13.71;
            const py = (n) => Number(n.y) * 8.75;
            const smoothD = buildSmoothPath(
              pathNodes.map((n) => ({ x: px(n), y: py(n) }))
            );
>>>>>>> main

              const startNode = pathNodes[0];
              const endNode = pathNodes[pathNodes.length - 1];

              const startX = (Number(startNode.x) * 13.71).toFixed(1);
              const startY = (Number(startNode.y) * 8.75).toFixed(1);
              const endX = (Number(endNode.x) * 13.71).toFixed(1);
              const endY = (Number(endNode.y) * 8.75).toFixed(1);

<<<<<<< HEAD
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
                      <path
                        d="M0,0 L0,6 L6,3 z"
                        fill="#047857"
                      />
                    </marker>
                  </defs>

                  {/* Viền bóng của đường đi */}
                  <polyline
                    points={pointsStr}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.2)"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Viền trắng */}
                  <polyline
                    points={pointsStr}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Đường đi màu xanh */}
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

                  {/* Các điểm dừng trung gian */}
                  {pathNodes.slice(1, -1).map((n, idx) => {
                    const cx = (Number(n.x) * 13.71).toFixed(1);
                    const cy = (Number(n.y) * 8.75).toFixed(1);

                    if (n.category === "waypoint") {
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
=======
                {/* 1. Đổ bóng viền ngoài — đường cong mềm */}
                <path
                  d={smoothD}
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.2)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 2. Đường viền trắng dày làm nổi bật trên nền bản đồ — đường cong mềm */}
                <path
                  d={smoothD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 3. Đường chính nét đứt xanh lá đậm chạy animation — đường cong mềm */}
                <path
                  d={smoothD}
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="10 6"
                  markerEnd="url(#rp-arrow)"
                  className="path-line-animated"
                />
>>>>>>> main

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

<<<<<<< HEAD
                  {/* Điểm xuất phát */}
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

                  <text
                    x={startX}
                    y={Number(startY) + 20}
                    textAnchor="middle"
                    fill="#065f46"
                    fontSize="11"
                    fontWeight="700"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                  >
                    {translate("map.canvas.start", "Xuất phát")}
                  </text>

                  {/* Điểm đến */}
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

                  <text
                    x={endX}
                    y={Number(endY) + 20}
                    textAnchor="middle"
                    fill="#991b1b"
                    fontSize="11"
                    fontWeight="700"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                  >
                    {translate("map.canvas.destination", "Điểm đến")}
                  </text>
                </svg>
              );
            })()}

          {/* Các marker trên bản đồ */}
          {MARKERS.map((m) => (
=======
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
>>>>>>> main
            <div
              key={m.id}
              className="map-canvas__marker"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
              }}
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

      {/* Hướng dẫn kéo và thu phóng theo ngôn ngữ */}
      <div className="map-canvas__hint">
  {translate(
    "map.canvas.hint",
    "Kéo để di chuyển • Lăn chuột để phóng to / thu nhỏ"
  )}
</div>
    </div>
  );
}
