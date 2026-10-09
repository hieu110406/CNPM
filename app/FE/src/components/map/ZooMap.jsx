
import React, { useEffect, useMemo, useState } from "react";
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
  TYPE_META,
} from "./mapData";
import { api } from "../../api/client";
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
  const { t, language } = useSettings();

  const [markers, setMarkers] = useState(MARKERS);
  const [poiLoadError, setPoiLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("gate_main");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState("zones"); // 'zones' | 'legend'
  const [pathNodes, setPathNodes] = useState([]); // [{code,name,x,y}] kết quả Dijkstra

  useEffect(() => {
    let cancelled = false;

    async function loadPois() {
      try {
        const data = await api.getPublicPois(language);
        if (!Array.isArray(data)) {
          throw new Error("API POI trả về dữ liệu không hợp lệ.");
        }

        let missingCoordinates = 0;
        const databaseMarkers = data.flatMap((poi) => {
          if (!poi || typeof poi.id !== "string") return [];

          const fallback = MARKERS.find((marker) => marker.id === poi.id);
          const x = poi.x ?? fallback?.x;
          const y = poi.y ?? fallback?.y;
          if (!Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) {
            missingCoordinates += 1;
            return [];
          }

          return [{
            ...fallback,
            ...poi,
            id: poi.id,
            name: poi.name || fallback?.name || poi.id,
            zone: poi.zone || fallback?.zone || "",
            desc: poi.desc || fallback?.desc || "",
            emoji: poi.emoji || fallback?.emoji || "📍",
            type: poi.type || fallback?.type || "animal",
            x: Number(x),
            y: Number(y),
            fromDatabase: true,
          }];
        });

        if (!cancelled) {
          setMarkers(databaseMarkers);
          setPoiLoadError(
            data.length === 0
              ? "Database chưa có POI hoạt động; chạy npm run seed:pois để nạp các điểm mặc định."
              : missingCoordinates
              ? `${missingCoordinates} POI chưa có tọa độ bản đồ nên không hiển thị.`
              : ""
          );
          setSelectedId((selected) =>
            databaseMarkers.some((marker) => marker.id === selected)
              ? selected
              : databaseMarkers[0]?.id ?? null
          );
        }
      } catch (error) {
        console.error("Không thể tải POI từ database:", error);
        if (!cancelled) {
          setMarkers(MARKERS);
          setSelectedId((selected) =>
            MARKERS.some((marker) => marker.id === selected)
              ? selected
              : MARKERS[0]?.id ?? null
          );
          setPoiLoadError("Không thể tải POI từ máy chủ; đang hiển thị dữ liệu bản đồ mặc định.");
        }
      }
    }

    loadPois();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const selectedMarker = useMemo(
    () => markers.find((marker) => marker.id === selectedId),
    [markers, selectedId]
  );

  const activeGroup = useMemo(
    () => HIGHLIGHT_GROUPS_LOOKUP[selectedGroupId],
    [selectedGroupId]
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchText = query.trim().toLowerCase();

    return markers.filter(
      (marker) =>
        marker.name.toLowerCase().includes(searchText) ||
        (marker.zone &&
          marker.zone.toLowerCase().includes(searchText)) ||
        (marker.desc &&
          marker.desc.toLowerCase().includes(searchText))
    ).slice(0, 6);
  }, [markers, query]);

  const filterCategories = useMemo(() => {
    const existingKeys = new Set(FILTER_CATEGORIES.map(({ key }) => key));
    return [
      ...FILTER_CATEGORIES,
      ...Object.entries(TYPE_META)
        .filter(([key]) => !existingKeys.has(key) && markers.some((marker) => marker.type === key))
        .map(([key, meta]) => ({ key, label: meta.label })),
    ];
  }, [markers]);

  function selectMarker(id) {
    setSelectedId(id);
    setSelectedGroupId(null);
    setQuery("");

    const marker = markers.find((item) => item.id === id);

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
            {filterCategories.map((category) => {
              const active = typeFilter === category.key;

              const labelKey =
                FILTER_LABEL_KEYS[category.key] || category.key;
              const CategoryIcon = TYPE_META[category.key]?.icon;

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
                    {CategoryIcon ? <CategoryIcon size={14} /> : category.icon}
                  </span>

                  <span>
                    {t(
                      `filters.${labelKey}`,
                      category.label || TYPE_META[category.key]?.label || category.key
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* {poiLoadError && (
            <div className="poi-load-warning" role="status">
              {poiLoadError}
            </div>
          )} */}

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
          markers={markers}
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
          markers={markers}
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