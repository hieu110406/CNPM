// components/layout/Header.jsx
// Header chung của app — bản redesign: gradient tinh tế, font riêng cho tên hiển thị,
// nút menu (☰) giờ có chức năng thật: mở/đóng panel chú thích (truyền qua onMenuClick).

import React from "react";
import { MapPin, Ticket, Menu } from "lucide-react";

export default function Header({ children, onMenuClick }) {
  return (
    <header className="relative flex items-center gap-4 overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-6 py-3.5 text-white shadow-md">
      {/* điểm nhấn ánh sáng mờ phía sau, chỉ trang trí */}
      <div className="pointer-events-none absolute -top-10 right-24 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl ring-1 ring-inset ring-white/15">
          🐅
        </div>
        <div className="leading-tight">
          <p
            className="text-lg font-semibold tracking-tight text-white"
            style={{ fontFamily: "'Fraunces', ui-serif, Georgia, serif" }}
          >
            Thảo Cầm Viên
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300/80">
            Saigon Zoo &amp; Botanical Gardens
          </p>
        </div>
      </div>

      <div className="mx-1 h-8 w-px shrink-0 bg-white/10" />

      {children}

      <div className="flex shrink-0 items-center gap-1.5">
        <button className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-emerald-100 transition-colors hover:bg-white/10 hover:text-white">
          <MapPin size={16} />
          Bản đồ
        </button>
        <button className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-emerald-100 transition-colors hover:bg-white/10 hover:text-white">
          <Ticket size={16} />
          Vé
        </button>
        <button
          onClick={onMenuClick}
          title="Chú thích & khu nổi bật"
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-emerald-100 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Menu size={19} />
        </button>
      </div>
    </header>
  );
}
