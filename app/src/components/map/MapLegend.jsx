// MapLegend.jsx
// Chú thích bản đồ tương tác: Bấm để lọc các loại địa điểm, hiển thị số lượng từng loại

import React from "react";
import { Layers, RotateCcw } from "lucide-react";
import { TYPE_META, MARKERS } from "./mapData";

export default function MapLegend({ typeFilter, onToggleType }) {
  // Đếm số lượng marker theo từng loại
  const counts = React.useMemo(() => {
    const res = {};
    MARKERS.forEach((m) => {
      res[m.type] = (res[m.type] || 0) + 1;
    });
    return res;
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Layers size={13} className="text-emerald-600" />
          Phân loại địa điểm
        </p>

        {typeFilter && (
          <button
            onClick={() => onToggleType(null)}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <RotateCcw size={11} />
            Bỏ lọc
          </button>
        )}
      </div>

      <div className="space-y-1">
        {Object.entries(TYPE_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const active = typeFilter === key;
          const count = counts[key] || 0;

          return (
            <button
              key={key}
              onClick={() => onToggleType(active ? null : key)}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all duration-200 ${
                active
                  ? "bg-emerald-100/70 font-semibold text-emerald-950 shadow-2xs ring-1 ring-emerald-600/30"
                  : "text-slate-600 hover:bg-slate-100/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-2xs transition-transform duration-200"
                  style={{
                    backgroundColor: meta.color,
                    boxShadow: active ? `0 2px 8px ${meta.color}55` : "none",
                  }}
                >
                  <Icon size={14} />
                </span>
                <span className="truncate">{meta.label}</span>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-200/60 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
