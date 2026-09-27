// components/layout/Header.jsx
// Header ứng dụng Thảo Cầm Viên: Phong cách sang trọng, thanh lịch với hiệu ứng ánh sáng ngọc bích,
// thông tin thời tiết trực tiếp, trạng thái mở cửa và nút mua vé nổi bật

import React from "react";
import { Ticket, Menu, Sparkles, Clock, CloudSun } from "lucide-react";

export default function Header({ children, onMenuClick, isPanelOpen }) {
  return (
    <header
      className="relative z-30 flex items-center justify-between gap-4 px-5 py-2.5 text-white shadow-lg select-none"
      style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 45%, #047857 100%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      {/* Vệt sáng trang trí mềm mại phía sau */}
      <div className="pointer-events-none absolute -top-12 left-1/4 h-36 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-20 h-32 w-48 rounded-full bg-teal-300/10 blur-2xl" />

      {/* Logo & Tên thương hiệu */}
      <div className="flex shrink-0 items-center gap-3">
        <div
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
        >
          <span className="text-2xl select-none">🐅</span>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white" />
          </span>
        </div>

        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <h1
              className="text-base font-bold tracking-tight text-white sm:text-lg"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Thảo Cầm Viên
            </h1>
            <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-200 backdrop-blur-xs md:inline-block">
              Est. 1864
            </span>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-200/80">
            Saigon Zoo &amp; Botanical Gardens
          </p>
        </div>
      </div>

      {/* Vị trí ô tìm kiếm trung tâm */}
      <div className="flex-1 max-w-xl mx-2">
        {children}
      </div>

      {/* Thông tin trực tiếp & Nút hành động */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Chip trạng thái mở cửa */}
        <div className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-emerald-100 backdrop-blur-md xl:flex">
          <Clock size={12} className="text-emerald-300" />
          <span>Mở cửa: <strong className="text-white">07:00 - 18:30</strong></span>
        </div>

        {/* Chip thời tiết */}
        <div className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-emerald-100 backdrop-blur-md lg:flex">
          <CloudSun size={13} className="text-amber-300" />
          <span>TP.HCM <strong className="text-white">31°C</strong></span>
        </div>

        {/* Nút Đặt vé online */}
        <button
          onClick={() => alert("Chuyển đến trang mua vé trực tuyến Thảo Cầm Viên")}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-emerald-950 shadow-md transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          <Ticket size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Mua vé online</span>
          <span className="sm:hidden">Vé</span>
        </button>

        {/* Nút Toggle mở/đóng Panel Chú thích */}
        <button
          onClick={onMenuClick}
          title="Bật/tắt thanh chú thích & khu nổi bật"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
            isPanelOpen
              ? "bg-white text-emerald-900 shadow-sm"
              : "text-emerald-100 hover:bg-white/15 hover:text-white"
          }`}
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
