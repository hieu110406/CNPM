// MapSearchBar.jsx
// Ô tìm kiếm + dropdown gợi ý theo tên marker.

import React from "react";
import { Search } from "lucide-react";

export default function MapSearchBar({ query, onQueryChange, results, onSelectResult }) {
  return (
    <div className="relative mx-2 max-w-md flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Tìm kiếm loài động vật, khu vực..."
        className="w-full rounded-full bg-white py-2 pl-9 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-11 z-20 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg">
          {results.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectResult(m.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-emerald-50"
            >
              <span>{m.emoji}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
