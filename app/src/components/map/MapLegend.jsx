// MapLegend.jsx
// Panel "Chú thích" — click 1 loại để lọc marker theo loại đó (toggle).

import React from "react";
import { TYPE_META } from "./mapData";

export default function MapLegend({ typeFilter, onToggleType }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-800">Chú thích</p>
      <div className="space-y-1.5">
        {Object.entries(TYPE_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const active = typeFilter === key;
          return (
            <button
              key={key}
              onClick={() => onToggleType(active ? null : key)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                active ? "bg-emerald-50" : "hover:bg-slate-50"
              }`}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: meta.color }}
              >
                <Icon size={12} />
              </span>
              <span className="text-slate-600">{meta.label}</span>
            </button>
          );
        })}
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600">
          <span className="h-1.5 w-6 rounded-full bg-[#e8ddc7]" />
          Đường đi
        </div>
      </div>
    </div>
  );
}
