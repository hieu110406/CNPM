// RoutePickerModal.jsx
// Popup chỉ đường — minimal, white & green

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Navigation, Loader2, ChevronRight, MapPinned } from "lucide-react";
import { MARKERS } from "./mapData";
import { shortestPath } from "./mapGraph";
import { useSettings } from "../../context/SettingsContext";
import "./routePickerModal.css";

function RoutePickerModalInner({ destination, markers, onClose, onPathReady, onStartRouteMode }) {
  const { t } = useSettings();
  const [fromId, setFromId]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(null);

  const nodeOptions = markers.filter((m) => m.id !== destination?.id);
  const fromName    = markers.find((m) => m.id === fromId)?.name ?? "";

  const handleFind = useCallback(() => {
    if (!fromId) { setError(t("route.selectStartRequired", "Vui lòng chọn điểm xuất phát.")); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = shortestPath(fromId, destination.id);
      if (!data) {
        setError(t("route.noRoute", "Không tìm thấy đường đi giữa 2 địa điểm này."));
      } else {
        setResult(data);
      }
    } catch (e) {
        setError(e.message || t("route.errorGeneric", "Lỗi tìm đường"));
    } finally {
      setLoading(false);
    }
  }, [fromId, destination, t]);

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
            <p className="rp-header__title">{t("map.infoCard.navigate", "Chỉ đường tới đây")}</p>
            <p className="rp-header__dest">{destination?.name}</p>
          </div>
          <button className="rp-header__close" onClick={onClose} aria-label={t("map.infoCard.close", "Đóng")}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="rp-body">

          {/* Dải From → To */}
          <div className="rp-route-strip">
            <span className="rp-dot rp-dot--from" />
            <span className="rp-route-strip__label">{t("route.from", "Từ")}</span>
            <span className="rp-route-strip__name">
              {fromName || <span style={{ color: "#bdbdbd", fontWeight: 400 }}>{t("route.notSelected", "Chưa chọn")}</span>}
            </span>
            <span className="rp-route-strip__line" />
            <span className="rp-dot rp-dot--to" />
            <span className="rp-route-strip__label">{t("route.to", "Đến")}</span>
            <span className="rp-route-strip__name">{destination?.name}</span>
          </div>

          {/* Chọn điểm */}
          <div>
            <span className="rp-select-label">{t("route.startPoint", "Điểm xuất phát")}</span>
            <select
              className="rp-select"
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value);
                setResult(null);
                setError(null);
              }}
            >
              <option value="">{t("route.chooseLocation", "Chọn vị trí của bạn")}</option>
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
              ? <><Loader2 size={14} className="spin" /> {t("route.calculating", "Đang tính…")}</>
              : <><Navigation size={14} /> {t("route.findShortest", "Tìm đường ngắn nhất")}</>
            }
          </button>

          {/* Chọn 2 điểm ngay trên bản đồ */}
          <button
            type="button"
            className="rp-pick-btn"
            onClick={() => {
              onStartRouteMode?.();
              onClose();
            }}
          >
            <MapPinned size={14} />
            {t("route.mapChoice", "Chọn 2 điểm trên bản đồ")}
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
                     {result.path ? result.path.length - 1 : (result.stepsCount || 0)} {t("route.steps", "chặng")}
                  </span>
                  <span className="rp-badge rp-badge--dist">
                    {result.distanceMeters ? `~${result.distanceMeters}m (${result.estimatedMinutes} ph)` : `${(result.totalWeight || result.totalDistance || 0).toFixed(1)} đv`}
                  </span>
                 <span className="rp-result__hint">{t("route.viewOnMapHint", "Bấm \"Xem trên bản đồ\" để hiện đường đi")}</span>
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
             <button className="rp-footer__btn" onClick={onClose}>{t("map.infoCard.close", "Đóng")}</button>
            <button className="rp-footer__btn rp-footer__btn--primary" onClick={handleShowOnMap}>
              {t("route.viewMap", "Xem trên bản đồ")}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function RoutePickerModal({ destination, markers = MARKERS, onClose, onPathReady, onStartRouteMode }) {
  if (!destination || typeof document === "undefined") return null;
  return createPortal(
    <RoutePickerModalInner
      destination={destination}
      markers={markers}
      onClose={onClose}
      onPathReady={onPathReady}
      onStartRouteMode={onStartRouteMode}
    />,
    document.body
  );
}
