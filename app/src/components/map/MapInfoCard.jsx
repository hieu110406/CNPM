// MapInfoCard.jsx
// Thẻ thông tin điểm đang được chọn, neo góc dưới trái bản đồ.

import React from "react";
import { X } from "lucide-react";
import { TYPE_META } from "./mapData";

export default function MapInfoCard({ marker, onClose }) {
  if (!marker) return null;

  return (
    <div className="absolute bottom-5 left-5 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="flex items-start gap-2">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
          style={{ backgroundColor: `${TYPE_META[marker.type].color}22` }}
        >
          {marker.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{marker.name}</p>
          <p className="mt-0.5 text-xs leading-snug text-slate-500">{marker.desc}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
