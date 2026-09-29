// components/layout/Header.jsx
// Header ứng dụng Thảo Cầm Viên: logo, ô tìm kiếm, giờ mở cửa, thời tiết, nút mua vé

import React from "react";
import { Ticket, Menu, Clock, CloudSun } from "lucide-react";

export default function Header({ children, onMenuClick, isPanelOpen }) {
  return (
    <header className="app-header">
      <div className="app-header__glow app-header__glow--top" />
      <div className="app-header__glow app-header__glow--bottom" />

      {/* Logo & Tên thương hiệu */}
      <div className="brand">
        <div className="brand__logo">
          <span>🐅</span>
          <span className="brand__status">
            <span className="brand__status-ping" />
            <span className="brand__status-dot" />
          </span>
        </div>

        <div className="brand__text">
          <div className="brand__title-row">
            <h1 className="brand__title">Thảo Cầm Viên</h1>
            <span className="brand__badge">Est. 1864</span>
          </div>
          <p className="brand__subtitle">Saigon Zoo &amp; Botanical Gardens</p>
        </div>
      </div>

      {/* Vị trí ô tìm kiếm trung tâm */}
      <div className="header-search">{children}</div>

      {/* Thông tin trực tiếp & Nút hành động */}
      <div className="header-actions">
        <div className="header-chip header-chip--hours">
          <Clock size={12} className="header-chip__icon--clock" />
          <span>Mở cửa: <strong>07:00 - 18:30</strong></span>
        </div>

        <div className="header-chip header-chip--weather">
          <CloudSun size={13} className="header-chip__icon--weather" />
          <span>TP.HCM <strong>31°C</strong></span>
        </div>

        <button
          onClick={() => alert("Chuyển đến trang mua vé trực tuyến Thảo Cầm Viên")}
          className="btn-ticket"
        >
          <Ticket size={14} strokeWidth={2.5} />
          <span className="btn-ticket__label--full">Mua vé online</span>
          <span className="btn-ticket__label--short">Vé</span>
        </button>

        <button
          onClick={onMenuClick}
          title="Bật/tắt thanh chú thích & khu nổi bật"
          className={`btn-menu ${isPanelOpen ? "is-active" : ""}`}
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}