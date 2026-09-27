// components/map/ZooMap.jsx
// Trang bản đồ tương tác Thảo Cầm Viên Sài Gòn:
// Thanh lọc nhanh, kéo rê chuột (Pan), Phóng to/thu nhỏ, Danh mục nổi bật & Thẻ chi tiết sinh động

import React, { useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import MapCanvas from "./MapCanvas";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import HighlightedZones from "./HighlightedZones";
import MapSearchBar from "./MapSearchBar";
import MapInfoCard from "./MapInfoCard";
import { MARKERS, HIGHLIGHT_GROUPS, FILTER_CATEGORIES, TYPE_META } from "./mapData";
import zooMapImage from "../../assets/map/zoo_map.png";
import { Sparkles, Layers, ChevronRight, X } from "lucide-react";

const HIGHLIGHT_GROUPS_LOOKUP = Object.fromEntries(
  HIGHLIGHT_GROUPS.map((g) => [g.id, g])
);

export default function ZooMap({ mapImageSrc = zooMapImage }) {
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

  // Tìm kiếm theo từ khóa
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

  // Chọn marker cụ thể và căn map vào khu vực đó
  function selectMarker(id) {
    setSelectedId(id);
    setSelectedGroupId(null);
    setQuery("");

    // Căn chỉnh vị trí bản đồ mượt mà về marker
    const marker = MARKERS.find((m) => m.id === id);
    if (marker && zoom > 1.2) {
      // Nhẹ nhàng di chuyển pan
      const offsetX = (50 - marker.x) * 4;
      const offsetY = (50 - marker.y) * 4;
      setPan({ x: offsetX, y: offsetY });
    }
  }

  // Chọn nhóm khu vực nổi bật
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

  // Xác định marker nào bị làm mờ (Dimmed) khi đang lọc
  function isDimmed(marker) {
    if (typeFilter && typeFilter !== "all" && marker.type !== typeFilter) {
      return true;
    }
    if (activeGroup && !activeGroup.memberIds.includes(marker.id)) {
      return true;
    }
    return false;
  }

  // Reset toàn bộ bản đồ về mặc định
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
      headerSlot={
        <MapSearchBar
          query={query}
          onQueryChange={setQuery}
          results={searchResults}
          onSelectResult={selectMarker}
        />
      }
    >
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Thanh lọc phân loại nhanh nổi phía trên bản đồ (Floating Fast Filter) */}
        <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/80 bg-white/90 p-1.5 shadow-xl backdrop-blur-md pointer-events-auto custom-scrollbar max-w-full">
            {FILTER_CATEGORIES.map((cat) => {
              const active = typeFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setTypeFilter(cat.key);
                    setSelectedGroupId(null);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Nút mở lại thanh bên nếu đã đóng */}
          {!isPanelOpen && (
            <button
              onClick={() => setIsPanelOpen(true)}
              className="pointer-events-auto hidden md:flex items-center gap-1.5 rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-xl backdrop-blur-md hover:bg-emerald-50 transition-all"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Khám phá khu vực</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Khung bản đồ Canvas tương tác */}
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

        {/* Cụm điều khiển phóng to / thu nhỏ / toàn màn hình */}
        <MapControls
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(2)))}
          onReset={handleReset}
        />

        {/* Thẻ hiển thị chi tiết địa điểm được chọn */}
        <MapInfoCard
          marker={selectedMarker}
          onClose={() => setSelectedId(null)}
        />
      </main>

      {/* Thanh bên phải: Danh mục khu nổi bật & Chú thích phân loại */}
      <aside
        className={`flex flex-col border-l border-slate-200/80 bg-white shadow-2xl transition-all duration-300 ease-in-out ${
          isPanelOpen
            ? "w-80 translate-x-0"
            : "w-0 -translate-x-full overflow-hidden opacity-0 pointer-events-none md:w-0"
        }`}
      >
        {/* Tiêu đề & Chuyển Tabs */}
        <div className="p-4 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>🧭</span> Hướng Dẫn Tham Quan
            </h2>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Thu gọn bảng"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100/80 p-1 text-xs font-semibold">
            <button
              onClick={() => setRightPanelTab("zones")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                rightPanelTab === "zones"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles size={13} className={rightPanelTab === "zones" ? "text-amber-500" : ""} />
              Khu nổi bật
            </button>

            <button
              onClick={() => setRightPanelTab("legend")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                rightPanelTab === "legend"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers size={13} className={rightPanelTab === "legend" ? "text-emerald-600" : ""} />
              Chú thích ({MARKERS.length})
            </button>
          </div>
        </div>

        {/* Nội dung danh sách cuộn mượt mà */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          {rightPanelTab === "zones" ? (
            <HighlightedZones
              selectedGroupId={selectedGroupId}
              onSelectGroup={selectGroup}
            />
          ) : (
            <MapLegend
              typeFilter={typeFilter === "all" ? null : typeFilter}
              onToggleType={(type) => setTypeFilter(type || "all")}
            />
          )}

          {/* Banner thông báo tour xe điện & trải nghiệm */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 p-3.5 text-white shadow-md">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-sm">
                🚂
              </span>
              <p className="text-xs font-bold text-emerald-200">
                Tour Xe Điện Khám Phá
              </p>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-100/80">
              Trải nghiệm xe điện dạo quanh 20 hecta vườn thú với lời bình audio sinh động.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-amber-300">20.000đ / vé</span>
              <button
                onClick={() => selectMarker("tram_station")}
                className="font-bold text-white underline hover:text-emerald-200 transition-colors"
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
