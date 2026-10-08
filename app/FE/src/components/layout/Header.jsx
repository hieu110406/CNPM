
// components/layout/Header.jsx
// Header ứng dụng Thảo Cầm Viên:
// logo, ô tìm kiếm, giờ mở cửa, thời tiết, admin, cài đặt

import React from "react";
import logo from "../../assets/marker/logo.png";
import {
  Settings,
  Clock,
  CloudSun,
  ShieldCheck,
  Compass,
} from "lucide-react";

import { useSettings } from "../../context/SettingsContext";
import LanguageSwitcher from "../language/LanguageSwitcher";

export default function Header({
  children,
  onMenuClick,
  isPanelOpen,
  onNavigateAdmin,
}) {
  const { openSettings, t } = useSettings();

  return (
    <header className="app-header">
      {/* Hiệu ứng ánh sáng nền */}
      <div className="app-header__glow app-header__glow--top" />
      <div className="app-header__glow app-header__glow--bottom" />

      {/* =========================
          LOGO & TÊN THƯƠNG HIỆU
      ========================== */}
      <div className="brand">
        <div className="brand__logo">
          <img
            src={logo}
            alt="Thảo Cầm Viên"
            className="brand__logo-image"
          />

          {/* Trạng thái online */}
          <span className="brand__status">
            <span className="brand__status-ping" />
            <span className="brand__status-dot" />
          </span>
        </div>

        <div className="brand__text">
          <div className="brand__title-row">
            <h1 className="brand__title">
              {t("appTitle")}
            </h1>

            <span className="brand__badge">
              Est. 1864
            </span>
          </div>

          <p className="brand__subtitle">
            {t("brandSubtitle")}
          </p>
        </div>
      </div>

      {/* =========================
          Ô TÌM KIẾM TRUNG TÂM
      ========================== */}
      <div className="header-search">
        {children}
      </div>

      {/* =========================
          THÔNG TIN & NÚT HÀNH ĐỘNG
      ========================== */}
      <div className="header-actions">
        {/* Giờ mở cửa */}
        <div className="header-chip header-chip--hours">
          <Clock
            size={12}
            className="header-chip__icon--clock"
          />

          <span>
            {t("hoursLabel")}
          </span>
        </div>

        {/* Thời tiết */}
        <div className="header-chip header-chip--weather">
          <CloudSun
            size={13}
            className="header-chip__icon--weather"
          />

          <span>
            {t("weatherCity")}
          </span>
        </div>

        {/* =========================
            CHUYỂN ĐỔI NGÔN NGỮ
        ========================== */}
        <LanguageSwitcher />

        {/* =========================
            NÚT QUẢN TRỊ
        ========================== */}
        {onNavigateAdmin && (
          <button
            type="button"
            onClick={onNavigateAdmin}
            title="Đăng nhập Quản trị viên"
            className="btn-admin-header"
            aria-label="Đăng nhập Quản trị viên"
          >
            <ShieldCheck size={15} />

            <span>
              {t("adminBtn") || "Quản trị"}
            </span>
          </button>
        )}

        {/* =========================
            NÚT HƯỚNG DẪN
        ========================== */}
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            title={
              isPanelOpen
                ? "Thu gọn bảng hướng dẫn"
                : "Mở bảng hướng dẫn & khu nổi bật"
            }
            className={`btn-guide-header ${
              isPanelOpen ? "is-active" : ""
            }`}
            aria-label="Hướng dẫn tham quan"
          >
            <Compass
              size={16}
              className="btn-guide-header__icon"
            />

            <span className="btn-guide-header__text">
              {t("guideBtn") || "Hướng dẫn"}
            </span>
          </button>
        )}

        {/* =========================
            NÚT CÀI ĐẶT
        ========================== */}
        <button
          type="button"
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

