// HighlightedZones.jsx
// Danh sách các khu vực nổi bật trong Thảo Cầm Viên: thẻ card với gradient, avatar, badge

import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { HIGHLIGHT_GROUPS } from "./mapData";

export default function HighlightedZones({ selectedGroupId, onSelectGroup }) {
  return (
    <div className="zones">
      <div className="zones__head">
        <p className="panel-title">
          <Sparkles size={13} className="ic-amber" />
          Khu vực nổi bật
        </p>
        <span className="zones__count">{HIGHLIGHT_GROUPS.length} nhóm</span>
      </div>

      <div className="zones__list">
        {HIGHLIGHT_GROUPS.map((g) => {
          const isSelected = selectedGroupId === g.id;

          return (
            <button
              key={g.id}
              onClick={() => onSelectGroup(isSelected ? null : g)}
              className={`zone-card ${isSelected ? "is-selected" : ""}`}
            >
              <div className={`zone-card__avatar zone-card__avatar--${g.id}`}>
                <span>{g.emoji}</span>
              </div>

              <div className="zone-card__info">
                <div className="zone-card__row">
                  <p className="zone-card__title">{g.title}</p>
                  {g.badge && <span className="zone-card__badge">{g.badge}</span>}
                </div>
                <p className="zone-card__subtitle">{g.subtitle}</p>
              </div>

              <ChevronRight size={15} className="zone-card__chevron" />
            </button>
          );
        })}
      </div>
    </div>
  );
}