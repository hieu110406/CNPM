// components/settings/SettingsModal.jsx
// Hộp thoại Cài đặt hệ thống: Chuyển ngôn ngữ, Phông chữ, Cỡ chữ, Giao diện & Tiện ích

import React, { useState, useEffect } from "react";
import {
  Globe,
  Type,
  Palette,
  Volume2,
  X,
  RotateCcw,
  Check,
  Sun,
  Moon,
  Sparkles,
  MapPin,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { useSettings, LANGUAGES, FONT_SIZES } from "../../context/SettingsContext";
import "./settings.css";

export default function SettingsModal() {
  const {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    motionEnabled,
    setMotionEnabled,
    autoAudio,
    setAutoAudio,
    showLabels,
    setShowLabels,
    isSettingsOpen,
    closeSettings,
    resetDefaults,
    t,
  } = useSettings();

  const [activeTab, setActiveTab] = useState("lang"); // "lang" | "font" | "display" | "audio"

  // Đóng modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isSettingsOpen) {
        closeSettings();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen) return null;

  return (
    <div className="settings-backdrop" onClick={closeSettings}>
      <div
        className="settings-modal custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Nút đóng modal góc trên phải */}
        <button
          onClick={closeSettings}
          className="settings-close-btn"
          aria-label="Đóng cài đặt"
          title="Đóng (Esc)"
        >
          <X size={18} />
        </button>

        {/* Header Modal */}
        <div className="settings-header">
          <div className="settings-header__icon">
            <Sliders size={22} className="text-emerald" />
          </div>
          <div>
            <h2 id="settings-title" className="settings-header__title">
              {t("settingsTitle")}
            </h2>
            <p className="settings-header__desc">{t("settingsDesc")}</p>
          </div>
        </div>

        {/* Thanh chuyển Tab */}
        <div className="settings-tabs">
          <button
            onClick={() => setActiveTab("lang")}
            className={`settings-tab-btn ${activeTab === "lang" ? "is-active" : ""}`}
          >
            <Globe size={15} />
            <span>{t("tabLang")}</span>
            <span className="settings-tab-badge">{language.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setActiveTab("font")}
            className={`settings-tab-btn ${activeTab === "font" ? "is-active" : ""}`}
          >
            <Type size={15} />
            <span>{t("tabFont")}</span>
          </button>

          <button
            onClick={() => setActiveTab("display")}
            className={`settings-tab-btn ${activeTab === "display" ? "is-active" : ""}`}
          >
            <Palette size={15} />
            <span>{t("tabDisplay")}</span>
          </button>

          <button
            onClick={() => setActiveTab("audio")}
            className={`settings-tab-btn ${activeTab === "audio" ? "is-active" : ""}`}
          >
            <Volume2 size={15} />
            <span>{t("tabAudio")}</span>
          </button>
        </div>

        {/* Nội dung từng Tab */}
        <div className="settings-body custom-scrollbar">
          {/* ================= TAB 1: NGÔN NGỮ ================= */}
          {activeTab === "lang" && (
            <div className="settings-section animate-fade-in">
              <label className="settings-label">
                <span>{t("tabLang")}</span>
                <span className="settings-label__hint">
                {t("settings.languageHint")}
</span>
              </label>

              <div className="lang-grid">
                {LANGUAGES.map((item) => {
                  const isSelected = language === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => setLanguage(item.code)}
                      className={`lang-card ${isSelected ? "is-selected" : ""}`}
                    >
                      <div className="lang-card__flag">{item.flag}</div>
                      <div className="lang-card__info">
                        <div className="lang-card__name">{item.native}</div>
                        <div className="lang-card__desc">{item.desc}</div>
                      </div>
                      <div className="lang-card__check">
                        {isSelected && <CheckCircle2 size={18} className="text-emerald" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: CỠ CHỮ ================= */}
          {activeTab === "font" && (
            <div className="settings-section animate-fade-in">
              {/* Chọn kích thước chữ */}
              <div className="settings-subgroup">
                <label className="settings-label">
                  <span>{t("fontSizeLabel")}</span>
                  <span className="settings-label__hint">
                    Điều chỉnh kích thước hiển thị chữ trên toàn bộ giao diện
                  </span>
                </label>

                <div className="fontsize-segmented">
                  {FONT_SIZES.map((size) => {
                    const isSelected = fontSize === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setFontSize(size.id)}
                        className={`fontsize-btn ${isSelected ? "is-selected" : ""}`}
                      >
                        <span className="fontsize-btn__label">{size.label}</span>
                        <span className="fontsize-btn__desc">{size.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Xem trước trực tiếp */}
              <div className="font-preview-box">
                <div className="font-preview-box__head">
                  <Sparkles size={14} className="text-amber" />
                  <span>{t("previewTitle")}</span>
                </div>
                <p
                  className="font-preview-box__text"
                  style={{
                    fontSize:
                      fontSize === "small"
                        ? "13px"
                        : fontSize === "large"
                        ? "16.5px"
                        : "14.5px",
                  }}
                >
                  {t("previewText")}
                </p>
                <div className="font-preview-box__foot">
                  <span>
                    Kích thước:{" "}
                    <strong>
                      {fontSize === "small"
                        ? "Nhỏ (92%)"
                        : fontSize === "large"
                        ? "Lớn (112%)"
                        : "Tiêu chuẩn (100%)"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: GIAO DIỆN & HIỂN THỊ ================= */}
          {activeTab === "display" && (
            <div className="settings-section animate-fade-in">
              <label className="settings-label">
                <span>{t("themeLabel")}</span>
              </label>

              <div className="theme-grid">
                <button
                  onClick={() => setTheme("light")}
                  className={`theme-card ${theme === "light" ? "is-selected" : ""}`}
                >
                  <div className="theme-card__icon theme-card__icon--light">
                    <Sun size={24} />
                  </div>
                  <div className="theme-card__title">{t("themeLight")}</div>
                  <div className="theme-card__desc">Tươi sáng, dịu mát với màu xanh thảo mộc</div>
                  {theme === "light" && <div className="theme-card__badge">Đang dùng</div>}
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`theme-card ${theme === "dark" ? "is-selected" : ""}`}
                >
                  <div className="theme-card__icon theme-card__icon--dark">
                    <Moon size={24} />
                  </div>
                  <div className="theme-card__title">{t("themeDark")}</div>
                  <div className="theme-card__desc">Giảm chói sáng, tiết kiệm năng lượng pin</div>
                  {theme === "dark" && <div className="theme-card__badge">Đang dùng</div>}
                </button>
              </div>

              {/* Công tắc chuyển động mượt */}
              <div className="toggle-row">
                <div className="toggle-row__info">
                  <div className="toggle-row__title">{t("motionLabel")}</div>
                  <div className="toggle-row__desc">{t("motionDesc")}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMotionEnabled(!motionEnabled)}
                  className={`toggle-switch ${motionEnabled ? "is-on" : ""}`}
                >
                  <span className="toggle-switch__thumb" />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 4: ÂM THANH & BẢN ĐỒ ================= */}
          {activeTab === "audio" && (
            <div className="settings-section animate-fade-in">
              {/* Tự động phát thuyết minh */}
              <div className="toggle-row">
                <div className="toggle-row__info">
                  <div className="toggle-row__title">{t("autoAudioLabel")}</div>
                  <div className="toggle-row__desc">{t("autoAudioDesc")}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoAudio(!autoAudio)}
                  className={`toggle-switch ${autoAudio ? "is-on" : ""}`}
                >
                  <span className="toggle-switch__thumb" />
                </button>
              </div>

              {/* Hiển thị nhãn tên bản đồ */}
              <div className="toggle-row" style={{ marginTop: "14px" }}>
                <div className="toggle-row__info">
                  <div className="toggle-row__title">{t("showLabelsLabel")}</div>
                  <div className="toggle-row__desc">{t("showLabelsDesc")}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLabels(!showLabels)}
                  className={`toggle-switch ${showLabels ? "is-on" : ""}`}
                >
                  <span className="toggle-switch__thumb" />
                </button>
              </div>

              {/* Ghi chú mẹo sử dụng */}
              <div className="settings-tip">
                <MapPin size={16} className="text-emerald" />
                <div>
                  <strong>Mẹo tham quan:</strong> Bấm vào bất kỳ loài động vật hoặc khu vực nào trên bản đồ để mở thẻ chi tiết và nghe thuyết minh giọng đọc tự động.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="settings-footer">
          <button
            type="button"
            onClick={resetDefaults}
            className="settings-btn-reset"
            title="Khôi phục ngôn ngữ, font và giao diện về trạng thái ban đầu"
          >
            <RotateCcw size={14} />
            <span>{t("resetBtn")}</span>
          </button>

          <button
            type="button"
            onClick={closeSettings}
            className="settings-btn-save"
          >
            <Check size={16} />
            <span>{t("closeBtn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
