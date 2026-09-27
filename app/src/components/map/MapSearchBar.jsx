// MapSearchBar.jsx
// Thanh tìm kiếm nhanh địa điểm với gợi ý phân loại, avatar emoji và phím tắt tiện lợi

import React, { useRef, useEffect } from "react";
import { Search, X, Sparkles, Navigation } from "lucide-react";
import { TYPE_META } from "./mapData";

export default function MapSearchBar({
  query,
  onQueryChange,
  results,
  onSelectResult,
}) {
  const inputRef = useRef(null);

  // Phím tắt Ctrl+K hoặc / để focus tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-lg flex-1">
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 text-emerald-300"
          size={16}
        />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm voi, hổ, hươu cao cổ, nhà hàng, WC..."
          className="w-full rounded-2xl border border-white/20 bg-white/15 py-2.5 pl-10 pr-20 text-sm text-white placeholder:text-emerald-100/60 outline-none backdrop-blur-md transition-all duration-200 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400 focus:shadow-lg focus:ring-4 focus:ring-emerald-400/25"
        />

        {query ? (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white"
          >
            <X size={14} />
          </button>
        ) : (
          <div className="pointer-events-none absolute right-3 hidden items-center gap-1 rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-200 sm:flex">
            <span>⌘</span>
            <span>K</span>
          </div>
        )}
      </div>

      {/* Dropdown kết quả tìm kiếm */}
      {results.length > 0 && (
        <div
          className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl"
          style={{ animation: "dropMenuFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-600" />
            Gợi ý địa điểm ({results.length})
          </div>

          <div className="space-y-0.5">
            {results.map((m) => {
              const meta = TYPE_META[m.type];
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectResult(m.id)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors duration-150 hover:bg-emerald-50/80 group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-base shadow-xs"
                      style={{ backgroundColor: `${meta?.color || "#059669"}20` }}
                    >
                      {m.emoji}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-950">
                        {m.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {m.zone || meta?.label}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Navigation size={12} />
                    Xem
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropMenuFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
