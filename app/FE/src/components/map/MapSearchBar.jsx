// MapSearchBar.jsx
// Thanh tìm kiếm nhanh địa điểm với gợi ý phân loại, avatar emoji và phím tắt Ctrl/⌘ + K

import React, { useRef, useEffect } from "react";
import { Search, X, Sparkles, Navigation } from "lucide-react";
import { TYPE_META } from "./mapData";
import { useSettings } from "../../context/SettingsContext";

export default function MapSearchBar({
  query,
  onQueryChange,
  results,
  onSelectResult,
}) {
  const { t } = useSettings();
  const inputRef = useRef(null);

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
    <div className="search">
      <div className="search__field">
        <Search className="search__icon" size={16} />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="search__input"
        />

        {query ? (
          <button onClick={() => onQueryChange("")} className="search__clear">
            <X size={14} />
          </button>
        ) : (
          <div className="search__kbd">
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="search__dropdown">
          <div className="search__label">
            <Sparkles size={12} className="ic-emerald" />
            Gợi ý địa điểm ({results.length})
          </div>

          <div className="search__list">
            {results.map((m) => {
              const meta = TYPE_META[m.type];
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectResult(m.id)}
                  className="search-result"
                >
                  <div className="search-result__left">
                    <span
                      className="search-result__avatar"
                      style={{ backgroundColor: `${meta?.color || "#059669"}20` }}
                    >
                      {m.emoji}
                    </span>
                    <div>
                      <p className="search-result__name">{m.name}</p>
                      <p className="search-result__zone">{m.zone || meta?.label}</p>
                    </div>
                  </div>

                  <span className="search-result__go">
                    <Navigation size={12} />
                    Xem
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}