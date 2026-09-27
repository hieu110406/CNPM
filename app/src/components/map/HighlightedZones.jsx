// HighlightedZones.jsx
// Danh sách các khu vực nổi bật trong Thảo Cầm Viên: thẻ thiết kế dạng card với gradient, avatar, badge số loài

import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { HIGHLIGHT_GROUPS } from "./mapData";

export default function HighlightedZones({ selectedGroupId, onSelectGroup }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sparkles size={13} className="text-amber-500" />
          Khu vực nổi bật
        </p>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          {HIGHLIGHT_GROUPS.length} nhóm
        </span>
      </div>

      <div className="space-y-1.5">
        {HIGHLIGHT_GROUPS.map((g) => {
          const isSelected = selectedGroupId === g.id;

          return (
            <button
              key={g.id}
              onClick={() => onSelectGroup(isSelected ? null : g)}
              className={`group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-r from-emerald-50 to-teal-50/60 ring-2 ring-emerald-600/30 shadow-xs"
                  : "bg-slate-50/70 hover:bg-slate-100/80 hover:shadow-xs"
              }`}
            >
              {/* Avatar biểu tượng với gradient rực rỡ */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm transition-transform duration-200 group-hover:scale-105 text-white"
                style={{
                  background: g.id === "big"
                    ? "linear-gradient(135deg, #f59e0b, #ea580c)"
                    : g.id === "birds"
                    ? "linear-gradient(135deg, #fb7185, #e11d48)"
                    : g.id === "primates"
                    ? "linear-gradient(135deg, #10b981, #0f766e)"
                    : g.id === "entertainment"
                    ? "linear-gradient(135deg, #a855f7, #4f46e5)"
                    : "linear-gradient(135deg, #22c55e, #047857)",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                }}
              >
                <span>{g.emoji}</span>
              </div>

              {/* Thông tin khu */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                    {g.title}
                  </p>
                  {g.badge && (
                    <span className="shrink-0 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 shadow-2xs border border-slate-200/60">
                      {g.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {g.subtitle}
                </p>
              </div>

              <ChevronRight
                size={15}
                className={`transition-transform duration-200 ${
                  isSelected
                    ? "rotate-90 text-emerald-600"
                    : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
