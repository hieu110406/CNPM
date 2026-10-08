// components/map/ZooMap.jsx
// Trang bản đồ tương tác Thảo Cầm Viên Sài Gòn:
// Thanh lọc nhanh, kéo rê (Pan), phóng to/thu nhỏ, danh mục nổi bật & thẻ chi tiết

import React, { useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import MapCanvas from "./MapCanvas";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import HighlightedZones from "./HighlightedZones";
import MapSearchBar from "./MapSearchBar";
import MapInfoCard from "./MapInfoCard";
import { MARKERS, HIGHLIGHT_GROUPS, FILTER_CATEGORIES } from "./mapData";
import zooMapImage from "../../assets/map/zoo_map.png";
import { Sparkles, Layers, ChevronRight, X } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import "./map.css";

const HIGHLIGHT_GROUPS_LOOKUP = Object.fromEntries(
  HIGHLIGHT_GROUPS.map((g) => [g.id, g])
);

export default function ZooMap({ mapImageSrc = zooMapImage, onNavigateAdmin }) {
  const { t } = useSettings();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("gate_main");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState("zones"); // 'zones' | 'legend'

  const selectedMarker = useMemo(
    () => MARKERS.find((m) => m.id === selectedId),
    [selectedId]
  );

  const activeGroup = useMemo(
    () => HIGHLIGHT_GROUPS_LOOKUP[selectedGroupId],
    [selectedGroupId]
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return MARKERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.zone && m.zone.toLowerCase().includes(q)) ||
        (m.desc && m.desc.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [query]);

  function selectMarker(id) {
    setSelectedId(id);
    setSelectedGroupId(null);
    setQuery("");

    const marker = MARKERS.find((m) => m.id === id);
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
    if (group.memberIds && group.memberIds.length > 0) {
      setSelectedId(group.memberIds[0]);
    }
  }

  function isDimmed(marker) {
    if (typeFilter && typeFilter !== "all" && marker.type !== typeFilter) {
      return true;
    }
    if (activeGroup && !activeGroup.memberIds.includes(marker.id)) {
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

  return (
    <AppLayout
      activeNavKey="map"
      isPanelOpen={isPanelOpen}
      onMenuClick={() => setIsPanelOpen(!isPanelOpen)}
      onNavigateAdmin={onNavigateAdmin}
      onNavigate={(key) => {
        if (key === "admin") {
          if (onNavigateAdmin) {
            onNavigateAdmin();
          } else {
            window.location.hash = "admin";
          }
        }
      }}
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
        {/* Thanh lọc phân loại nhanh nổi phía trên bản đồ */}
        <div className="filter-bar">
          <div className="filter-bar__list glass custom-scrollbar">
            {FILTER_CATEGORIES.map((cat) => {
              const active = typeFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setTypeFilter(cat.key);
                    setSelectedGroupId(null);
                  }}
                  className={`filter-chip ${active ? "is-active" : ""}`}
                >
                  <span className="filter-chip__icon">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {!isPanelOpen && (
            <button onClick={() => setIsPanelOpen(true)} className="btn-explore glass">
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
        />

        <MapControls
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(2)))}
          onReset={handleReset}
        />

        <MapInfoCard
          marker={selectedMarker}
          onClose={() => setSelectedId(null)}
        />
      </main>

      {/* Thanh bên phải: Khu nổi bật */}
      <aside className={`right-panel ${isPanelOpen ? "is-open" : ""}`}>
        <div className="right-panel__head">
          <div className="right-panel__title-row">
            <h2 className="right-panel__title">
              <span>🧭</span> {t("rightPanelTitle")}
            </h2>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="icon-btn"
              title="Thu gọn bảng"
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
              <p className="tour-banner__title">Tour Xe Điện Khám Phá</p>
            </div>
            <p className="tour-banner__desc">
              Trải nghiệm xe điện dạo quanh 20 hecta vườn thú với lời bình audio sinh động.
            </p>
            <div className="tour-banner__foot">
              <span className="tour-banner__price">20.000đ / vé</span>
              <button
                onClick={() => selectMarker("tram_station")}
                className="tour-banner__link"
              >
                Xem vị trí ga →
              </button>
            </div>
          </div>
        </div>
      </aside>
    </AppLayout>
  );
}