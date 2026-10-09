// RoutePickerModal.jsx
// Popup chỉ đường — minimal, white & green

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Navigation, Loader2, ChevronRight } from "lucide-react";
import { MARKERS } from "./mapData";
import "./routePickerModal.css";

const BASE = "http://localhost:5000/api";

async function apiFindPath(from, to) {
  const res = await fetch(`${BASE}/pathfinding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Lỗi tìm đường");
  return data;
}

function RoutePickerModalInner({ destination, markers, onClose, onPathReady }) {
  const [fromId, setFromId]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(null);

  const nodeOptions = markers.filter((m) => m.id !== destination?.id);
  const fromName    = markers.find((m) => m.id === fromId)?.name ?? "";

  const handleFind = useCallback(async () => {
    if (!fromId) { setError("Vui lòng chọn điểm xuất phát."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiFindPath(fromId, destination.id);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fromId, destination]);

  const handleShowOnMap = () => {
    if (result?.path) onPathReady(result.path);
    onClose();
  };

  return (
    <div className="rp-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="rp-card" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="rp-header">
          <div className="rp-header__icon">
            <Navigation size={17} />
          </div>
          <div className="rp-header__text">
            <p className="rp-header__title">Chỉ đường tới đây</p>
            <p className="rp-header__dest">{destination?.name}</p>
          </div>
          <button className="rp-header__close" onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="rp-body">

          {/* Dải From → To */}
          <div className="rp-route-strip">
            <span className="rp-dot rp-dot--from" />
            <span className="rp-route-strip__label">Từ</span>
            <span className="rp-route-strip__name">
              {fromName || <span style={{ color: "#bdbdbd", fontWeight: 400 }}>Chưa chọn</span>}
            </span>
            <span className="rp-route-strip__line" />
            <span className="rp-dot rp-dot--to" />
            <span className="rp-route-strip__label">Đến</span>
            <span className="rp-route-strip__name">{destination?.name}</span>
          </div>

          {/* Chọn điểm */}
          <div>
            <span className="rp-select-label">Điểm xuất phát</span>
            <select
              className="rp-select"
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value);
                setResult(null);
                setError(null);
              }}
            >
              <option value="">Chọn vị trí của bạn</option>
              {nodeOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Tìm đường */}
          <button
            className="rp-find-btn"
            onClick={handleFind}
            disabled={loading || !fromId}
          >
            {loading
              ? <><Loader2 size={14} className="spin" /> Đang tính…</>
              : <><Navigation size={14} /> Tìm đường ngắn nhất</>
            }
          </button>

          {/* Lỗi */}
          {error && <div className="rp-error">{error}</div>}

          {/* Kết quả */}
          {result && !error && (() => {
            const displayNodes = result.path?.filter(
              (n, idx) => idx === 0 || idx === result.path.length - 1 || n.category !== "waypoint"
            ) || [];

            return (
              <div className="rp-result">
                <div className="rp-result__summary">
                  <span className="rp-badge rp-badge--steps">
                    {result.path ? result.path.length - 1 : (result.stepsCount || 0)} chặng
                  </span>
                  <span className="rp-badge rp-badge--dist">
                    {result.distanceMeters ? `~${result.distanceMeters}m (${result.estimatedMinutes} ph)` : `${(result.totalWeight || result.totalDistance || 0).toFixed(1)} đv`}
                  </span>
                  <span className="rp-result__hint">Bấm "Xem trên bản đồ" để hiện đường đi</span>
                </div>

                <div className="rp-steps">
                  {displayNodes.map((node, idx) => (
                    <div
                      key={node.node_id || node.code || node.id || idx}
                      className={`rp-step${idx === 0 ? " is-start" : ""}${idx === displayNodes.length - 1 ? " is-end" : ""}`}
                    >
                      <span className="rp-step__num">{idx + 1}</span>
                      <span className="rp-step__dot" />
                      <span className="rp-step__name">{node.name}</span>
                      {idx < displayNodes.length - 1 && (
                        <ChevronRight size={11} className="rp-step__arr" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        {result && (
          <div className="rp-footer">
            <button className="rp-footer__btn" onClick={onClose}>Đóng</button>
            <button className="rp-footer__btn rp-footer__btn--primary" onClick={handleShowOnMap}>
              Xem trên bản đồ
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function RoutePickerModal({ destination, markers = MARKERS, onClose, onPathReady }) {
  if (!destination || typeof document === "undefined") return null;
  return createPortal(
    <RoutePickerModalInner
      destination={destination}
      markers={markers}
      onClose={onClose}
      onPathReady={onPathReady}
    />,
    document.body
  );
}
