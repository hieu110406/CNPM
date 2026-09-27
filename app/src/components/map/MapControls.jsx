// MapControls.jsx
// Nút điều khiển bản đồ: Zoom In/Out, La bàn N, Về vị trí trung tâm, Bật toàn màn hình

import React, { useState } from "react";
import { Plus, Minus, LocateFixed, Maximize2, Minimize2, Compass } from "lucide-react";

export default function MapControls({ onZoomIn, onZoomOut, onReset, zoom = 1 }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="absolute bottom-5 right-5 z-20 flex flex-col items-center gap-2.5">
      {/* Cụm Zoom in / Zoom out + phần trăm */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl backdrop-blur-md">
        <button
          onClick={onZoomIn}
          className="flex h-10 w-10 items-center justify-center text-slate-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700 active:scale-90"
          title="Phóng to"
        >
          <Plus size={18} strokeWidth={2.4} />
        </button>

        <div className="flex h-6 items-center justify-center border-y border-slate-100 bg-slate-50/70 text-[10px] font-bold text-slate-500">
          {Math.round(zoom * 100)}%
        </div>

        <button
          onClick={onZoomOut}
          className="flex h-10 w-10 items-center justify-center text-slate-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700 active:scale-90"
          title="Thu nhỏ"
        >
          <Minus size={18} strokeWidth={2.4} />
        </button>
      </div>

      {/* Nút reset vị trí */}
      <button
        onClick={onReset}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-700 shadow-xl backdrop-blur-md transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700 active:scale-90"
        title="Về trung tâm bản đồ"
      >
        <LocateFixed size={18} />
      </button>

      {/* Nút Toàn màn hình */}
      <button
        onClick={toggleFullscreen}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-700 shadow-xl backdrop-blur-md transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700 active:scale-90"
        title={isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
      >
        {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
      </button>

      {/* La bàn phong cách hiện đại */}
      <div
        className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-xl backdrop-blur-md transition-transform hover:scale-105"
        title="Hướng Bắc"
      >
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-rose-600 leading-none">▲</span>
          <span className="text-[10px] font-black text-slate-800 tracking-wider">N</span>
        </div>
      </div>
    </div>
  );
}
