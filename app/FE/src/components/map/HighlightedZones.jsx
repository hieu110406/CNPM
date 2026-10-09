
import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { HIGHLIGHT_GROUPS } from "./mapData";
import { useSettings } from "../../context/SettingsContext";

const GROUP_TRANSLATIONS = {
  big: {
    title: "guide.bigAnimalsTitle",
    subtitle: "guide.bigAnimalsSubtitle",
    badge: "guide.bigBadge",
  },
  birds: {
    title: "guide.birdsTitle",
    subtitle: "guide.birdsSubtitle",
    badge: "guide.birdsBadge",
  },
  primates: {
    title: "guide.primatesTitle",
    subtitle: "guide.primatesSubtitle",
    badge: "guide.primatesBadge",
  },
  entertainment: {
    title: "guide.entertainmentTitle",
    subtitle: "guide.entertainmentSubtitle",
    badge: "guide.entertainmentBadge",
  },
  botanical: {
    title: "guide.botanicalTitle",
    subtitle: "guide.botanicalSubtitle",
    badge: "guide.botanicalBadge",
  },
};

export default function HighlightedZones({
  selectedGroupId,
  onSelectGroup,
}) {
  const { t } = useSettings();

  return (
    <div className="zones">
      <div className="zones__head">
        <p className="panel-title">
          <Sparkles size={0} className="ic-amber" />
          {t("guide.tabs.zones")}
        </p>

        <span className="zones__count">
          {HIGHLIGHT_GROUPS.length} {t("guide.groups")}
        </span>
      </div>

      <div className="zones__list">
        {HIGHLIGHT_GROUPS.map((group) => {
          const isSelected = selectedGroupId === group.id;

          const translation =
            GROUP_TRANSLATIONS[group.id];

          return (
            <button
              key={group.id}
              onClick={() =>
                onSelectGroup(isSelected ? null : group)
              }
              className={`zone-card ${
                isSelected ? "is-selected" : ""
              }`}
            >
              <div
                className={`zone-card__avatar zone-card__avatar--${group.id}`}
              >
                <span>{group.emoji}</span>
              </div>

              <div className="zone-card__info">
                <div className="zone-card__row">
                  <p className="zone-card__title">
                    {translation
                      ? t(translation.title)
                      : group.title}
                  </p>

                  {group.badge && (
                    <span className="zone-card__badge">
                      {translation
                        ? t(translation.badge)
                        : group.badge}
                    </span>
                  )}
                </div>

                <p className="zone-card__subtitle">
                  {translation
                    ? t(translation.subtitle)
                    : group.subtitle}
                </p>
              </div>

              <ChevronRight
                size={15}
                className="zone-card__chevron"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}