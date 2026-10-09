// MapLegend.jsx
// Chú thích bản đồ tương tác: bấm để lọc các loại địa điểm, hiển thị số lượng từng loại


import React from "react";
import { Layers, RotateCcw } from "lucide-react";
import { TYPE_META, MARKERS } from "./mapData";
import { useSettings } from "../../context/SettingsContext";

export default function MapLegend({ typeFilter, onToggleType, markers = MARKERS }) {
  const { t } = useSettings();

  const counts = React.useMemo(() => {
    const res = {};

    markers.forEach((marker) => {
      res[marker.type] = (res[marker.type] || 0) + 1;
    });

    return res;
  }, [markers]);

  // Lấy tên loại địa điểm theo ngôn ngữ hiện tại
  const getTypeLabel = (key, meta) => {
    const translated = t(`types.${key}`, "");

    if (translated && translated !== `types.${key}`) {
      return translated;
    }

    return meta.label;
  };

  return (
    <div className="legend">
      <div className="legend__head">
        <p className="panel-title">
          <Layers size={13} className="ic-emerald" />
          {t("map.legend.title", "Phân loại địa điểm")}
        </p>

        {typeFilter && (
          <button
            onClick={() => onToggleType(null)}
            className="legend__reset"
          >
            <RotateCcw size={11} />
            {t("map.legend.reset", "Bỏ lọc")}
          </button>
        )}
      </div>

      <div className="legend__list">
        {Object.entries(TYPE_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const active = typeFilter === key;
          const count = counts[key] || 0;

          return (
            <button
              key={key}
              onClick={() => onToggleType(active ? null : key)}
              className={`legend-item ${active ? "is-active" : ""}`}
            >
              <div className="legend-item__left">
                <span
                  className="legend-item__icon"
                  style={{
                    backgroundColor: meta.color,
                    boxShadow: active
                      ? `0 2px 8px ${meta.color}55`
                      : "none",
                  }}
                >
                  <Icon size={14} />
                </span>

                <span className="legend-item__label">
                  {getTypeLabel(key, meta)}
                </span>
              </div>

              <span className="legend-item__count">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}