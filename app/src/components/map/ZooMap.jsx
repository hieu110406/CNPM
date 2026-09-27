// components/map/ZooMap.jsx
// Chỉ còn nội dung RIÊNG của trang bản đồ: state, canvas, legend, khu nổi bật...
// Header/Sidebar giờ nằm ở components/layout, dùng chung cho mọi trang.

import React, { useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import MapCanvas from "./MapCanvas";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import HighlightedZones from "./HighlightedZones";
import MapSearchBar from "./MapSearchBar";
import MapInfoCard from "./MapInfoCard";
import { MARKERS, HIGHLIGHT_GROUPS } from "./mapData";

// Dùng import ảnh thay vì string path để Vite tự xử lý đường dẫn khi build.
// Đổi tên file cho khớp ảnh thật bạn bỏ vào src/assets/map/
import zooMapImage from "../../assets/map/zoo_map.png";

const HIGHLIGHT_GROUPS_LOOKUP = Object.fromEntries(HIGHLIGHT_GROUPS.map((g) => [g.id, g]));

export default function ZooMap({ mapImageSrc = zooMapImage }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("gate");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [zoom, setZoom] = useState(1);

  const selectedMarker = useMemo(() => MARKERS.find((m) => m.id === selectedId), [selectedId]);
  const activeGroup = useMemo(() => HIGHLIGHT_GROUPS_LOOKUP[selectedGroupId], [selectedGroupId]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return MARKERS.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  function selectMarker(id) {
    setSelectedId(id);
    setSelectedGroupId(null);
    setQuery("");
  }

  function selectGroup(group) {
    setSelectedGroupId(group.id);
    setSelectedId(group.memberIds[0]);
  }

  function isDimmed(marker) {
    if (typeFilter && marker.type !== typeFilter) return true;
    if (activeGroup && !activeGroup.memberIds.includes(marker.id)) return true;
    return false;
  }

  return (
    <AppLayout
      activeNavKey="map"
      headerSlot={
        <MapSearchBar
          query={query}
          onQueryChange={setQuery}
          results={searchResults}
          onSelectResult={selectMarker}
        />
      }
    >
      <main className="relative flex-1 overflow-hidden">
        <MapCanvas
          mapImageSrc={mapImageSrc}
          zoom={zoom}
          selectedId={selectedId}
          onSelectMarker={selectMarker}
          isDimmed={isDimmed}
        />

        <MapControls
          onZoomIn={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
          onReset={() => {
            setZoom(1);
            setTypeFilter(null);
            setSelectedGroupId(null);
          }}
        />

        <MapInfoCard marker={selectedMarker} onClose={() => setSelectedId(null)} />
      </main>

      <aside className="hidden w-64 shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-100 bg-white p-4 lg:flex">
        <MapLegend typeFilter={typeFilter} onToggleType={setTypeFilter} />
        <HighlightedZones selectedGroupId={selectedGroupId} onSelectGroup={selectGroup} />
      </aside>
    </AppLayout>
  );
}
