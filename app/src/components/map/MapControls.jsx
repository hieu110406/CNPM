// MapControls.jsx
// Nút zoom +/- và nút "về mặc định", cộng la bàn N.

import React from "react";
import { Plus, Minus, LocateFixed } from "lucide-react";

export default function MapControls({ onZoomIn, onZoomOut, onReset }) {
  return (
    <div className="absolute bottom-5 right-5 flex flex-col items-center gap-2">
      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
        <button onClick={onZoomIn} className="p-2 hover:bg-slate-50">
          <Plus size={16} />
        </button>
        <div className="h-px bg-slate-200" />
        <button onClick={onZoomOut} className="p-2 hover:bg-slate-50">
          <Minus size={16} />
        </button>
      </div>
      <button
        onClick={onReset}
        className="rounded-full border border-slate-200 bg-white p-2 shadow hover:bg-slate-50"
        title="Về vị trí mặc định"
      >
        <LocateFixed size={16} />
      </button>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-emerald-800 shadow">
        N
      </div>
    </div>
  );
}
