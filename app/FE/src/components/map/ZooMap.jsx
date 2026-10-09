
import React, { useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import MapCanvas from "./MapCanvas";
import MapControls from "./MapControls";
import HighlightedZones from "./HighlightedZones";
import MapSearchBar from "./MapSearchBar";
import MapInfoCard from "./MapInfoCard";
import {
  MARKERS,
  HIGHLIGHT_GROUPS,
  FILTER_CATEGORIES,
} from "./mapData";
import zooMapImage from "../../assets/map/zoo_map.png";
import { Sparkles, ChevronRight, X } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import "./map.css";

const HIGHLIGHT_GROUPS_LOOKUP = Object.fromEntries(
  HIGHLIGHT_GROUPS.map((group) => [group.id, group])
);

const FILTER_LABEL_KEYS = {
  all: "all",
  animal: "animal",
  plant: "plant",
  entertainment: "entertainment",
  restaurant: "restaurant",
  service: "service",
  restroom: "restroom",
};

export default function ZooMap({
  mapImageSrc = zooMapImage,
  onNavigateAdmin,
}) {
  const { t } = useSettings();

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("gate_main");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState("zones"); // 'zones' | 'legend'
  const [pathNodes, setPathNodes] = useState([]); // [{code,name,x,y}] kết quả Dijkstra

  const selectedMarker = useMemo(
    () => MARKERS.find((marker) => marker.id === selectedId),
    [selectedId]
  );

  const activeGroup = useMemo(
    () => HIGHLIGHT_GROUPS_LOOKUP[selectedGroupId],
    [selectedGroupId]
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchText = query.trim().toLowerCase();

    return MARKERS.filter(
      (marker) =>
        marker.name.toLowerCase().includes(searchText) ||
        (marker.zone &&
          marker.zone.toLowerCase().includes(searchText)) ||
        (marker.desc &&
          marker.desc.toLowerCase().includes(searchText))
    ).slice(0, 6);
  }, [query]);

  function selectMarker(id) {
    setSelectedId(id);
    setSelectedGroupId(null);
    setQuery("");

    const marker = MARKERS.find((item) => item.id === id);

    if (marker && zoom > 1.2) {
      const offsetX = (50 - marker.x) * 4;
      const offsetY = (50 - marker.y) * 4;

      setPan({ x: offsetX, y: offsetY });
    }
  }

  function selectGroup(group) {
    if (!group) {
      setSelectedGroupId(null);
      return;
    }

    setSelectedGroupId(group.id);

    if (group.memberIds?.length > 0) {
      setSelectedId(group.memberIds[0]);
    }
  }

  function isDimmed(marker) {
    if (
      typeFilter !== "all" &&
      marker.type !== typeFilter
    ) {
      return true;
    }

    if (
      activeGroup &&
      !activeGroup.memberIds.includes(marker.id)
    ) {
      return true;
    }

    return false;
  }

  function handleReset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setTypeFilter("all");
    setSelectedGroupId(null);
  }

  function handleNavigate(key) {
    if (key !== "admin") return;

    if (onNavigateAdmin) {
      onNavigateAdmin();
    } else {
      window.location.hash = "admin";
    }
  }

  return (
    <AppLayout
      activeNavKey="map"
      isPanelOpen={isPanelOpen}
      onMenuClick={() => setIsPanelOpen((open) => !open)}
      onNavigateAdmin={onNavigateAdmin}
      onNavigate={handleNavigate}
      headerSlot={
        <MapSearchBar
          query={query}
          onQueryChange={setQuery}
          results={searchResults}
          onSelectResult={selectMarker}
        />
      }
    >
      <main className="zoo-main">
        <div className="filter-bar">
          <div className="filter-bar__list glass custom-scrollbar">
            {FILTER_CATEGORIES.map((category) => {
              const active = typeFilter === category.key;

              const labelKey =
                FILTER_LABEL_KEYS[category.key] || category.key;

              return (
                <button
                  key={category.key}
                  onClick={() => {
                    setTypeFilter(category.key);
                    setSelectedGroupId(null);
                  }}
                  className={`filter-chip ${
                    active ? "is-active" : ""
                  }`}
                >
                  <span className="filter-chip__icon">
                    {category.icon}
                  </span>

                  <span>
                    {t(`filters.${labelKey}`)}
                  </span>
                </button>
              );
            })}
          </div>

          {!isPanelOpen && (
            <button
              onClick={() => setIsPanelOpen(true)}
              className="btn-explore glass"
            >
              <Sparkles size={14} className="ic-amber" />
              <span>{t("exploreBtn")}</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        <MapCanvas
          mapImageSrc={mapImageSrc}
          zoom={zoom}
          setZoom={setZoom}
          pan={pan}
          setPan={setPan}
          selectedId={selectedId}
          onSelectMarker={selectMarker}
          isDimmed={isDimmed}
          pathNodes={pathNodes}
        />

        <MapControls
          zoom={zoom}
          onZoomIn={() =>
            setZoom((value) =>
              Math.min(2.5, +(value + 0.2).toFixed(2))
            )
          }
          onZoomOut={() =>
            setZoom((value) =>
              Math.max(0.6, +(value - 0.2).toFixed(2))
            )
          }
          onReset={handleReset}
        />

        <MapInfoCard
          marker={selectedMarker}
          onClose={() => setSelectedId(null)}
          onPathReady={(path) => {
            setPathNodes(path);
            if (path.length) {
              const startId = path[0].code || path[0].node_id || path[0].id;
              if (startId) selectMarker(startId);
            }
          }}
        />

        {pathNodes.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              zIndex: 30,
            }}
          >
            <button
              onClick={() => setPathNodes([])}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "24px",
                background: "#ffffff",
                color: "#dc2626",
                border: "1px solid #fecaca",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
              }}
            >
              <X size={14} />
              <span>Xoá lộ trình dẫn đường</span>
            </button>
          </div>
        )}
      </main>

      <aside
        className={`right-panel ${
          isPanelOpen ? "is-open" : ""
        }`}
      >
        <div className="right-panel__head">
          <div className="right-panel__title-row">
            <h2 className="right-panel__title">
              <span />
              {t("rightPanelTitle")}
            </h2>

            <button
              onClick={() => setIsPanelOpen(false)}
              className="icon-btn"
              title={t("settings.actions.close")}
              aria-label={t("settings.actions.close")}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="right-panel__body custom-scrollbar">
          <HighlightedZones
            selectedGroupId={selectedGroupId}
            onSelectGroup={selectGroup}
          />

          <div className="tour-banner">
            <div className="tour-banner__head">
              <span className="tour-banner__icon">🚂</span>

              <p className="tour-banner__title">
                {t("guide.electricTram")}
              </p>
            </div>

            <p className="tour-banner__desc">
              {t("guide.tramDescription")}
            </p>

            <div className="tour-banner__foot">
              <span className="tour-banner__price">
                {t("guide.ticketPrice")}
              </span>

              <button
                onClick={() => selectMarker("tram_station")}
                className="tour-banner__link"
              >
                {t("guide.viewRoute")} →
              </button>
            </div>
          </div>
        </div>
      </aside>
    </AppLayout>
  );
}