// HighlightedZones.jsx
// Panel "Các khu nổi bật" — click 1 nhóm để highlight các marker thuộc nhóm đó.

import React from "react";
import { ChevronRight } from "lucide-react";
import { HIGHLIGHT_GROUPS } from "./mapData";

export default function HighlightedZones({ selectedGroupId, onSelectGroup }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-800">Các khu nổi bật</p>
      <div className="space-y-1">
        {HIGHLIGHT_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelectGroup(g)}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
              selectedGroupId === g.id ? "bg-emerald-50" : "hover:bg-slate-50"
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/5 text-lg">
              {g.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">{g.title}</p>
              <p className="truncate text-[11px] text-slate-400">{g.subtitle}</p>
            </span>
            <ChevronRight size={14} className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
