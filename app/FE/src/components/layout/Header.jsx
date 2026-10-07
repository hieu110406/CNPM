// components/layout/Header.jsx
// Header ứng dụng Thảo Cầm Viên: logo, ô tìm kiếm, giờ mở cửa, thời tiết, admin, cài đặt

import React from "react";
import { Settings, Clock, CloudSun, ShieldCheck, Compass } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import LanguageSwitcher from "../language/LanguageSwitcher";

export default function Header({ children, onMenuClick, isPanelOpen, onNavigateAdmin }) {
  const { openSettings, t } = useSettings();

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
            <h1 className="brand__title">{t("appTitle")}</h1>
            <span className="brand__badge">Est. 1864</span>
          </div>
          <p className="brand__subtitle">{t("brandSubtitle")}</p>
        </div>
      </div>

      {/* Vị trí ô tìm kiếm trung tâm */}
      <div className="header-search">{children}</div>

      {/* Thông tin trực tiếp & Nút hành động */}
      <div className="header-actions">
        <div className="header-chip header-chip--hours">
          <Clock size={12} className="header-chip__icon--clock" />
          <span>{t("hoursLabel")}</span>
        </div>

        <div className="header-chip header-chip--weather">
          <CloudSun size={13} className="header-chip__icon--weather" />
          <span>{t("weatherCity")}</span>
        </div>

        {/* Chuyển đổi ngôn ngữ nhanh */}
        <LanguageSwitcher />

        {onNavigateAdmin && (
          <button
            onClick={onNavigateAdmin}
            title="Đăng nhập Quản trị viên"
            className="btn-admin-header"
          >
            <ShieldCheck size={15} />
            <span>{t("adminBtn")}</span>
          </button>
        )}

        {/* Nút bật/tắt bảng hướng dẫn tham quan */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            title={isPanelOpen ? "Thu gọn bảng hướng dẫn" : "Mở bảng hướng dẫn & khu nổi bật"}
            className={`btn-guide-header ${isPanelOpen ? "is-active" : ""}`}
          >
            <Compass size={15} />
            <span className="btn-guide-header__text">{t("guideBtn")}</span>
          </button>
        )}

        {/* Nút Mở Cài đặt hệ thống (Ngôn ngữ, Phông chữ...) */}
        <button
          onClick={openSettings}
          title={t("settingsTitle")}
          className="btn-menu"
          aria-label="Cài đặt hệ thống"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

