// components/settings/SettingsModal.jsx
// Hộp thoại cài đặt hệ thống: Ngôn ngữ, bản đồ và âm thanh

import { useState, useEffect } from "react";
import {
  Globe,
  Volume2,
  Download,
  X,
  RotateCcw,
  Check,
  MapPin,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { useSettings, LANGUAGES } from "../../context/SettingsContext";
import { offlineDownloadUrl } from "../../api/client";
import "./settings.css";

export default function SettingsModal() {
  const {
    language,
    setLanguage,
    autoAudio,
    setAutoAudio,
    showLabels,
    setShowLabels,
    isSettingsOpen,
    closeSettings,
    resetDefaults,
    t,
  } = useSettings();

  const [activeTab, setActiveTab] = useState("lang");
  const [downloadState, setDownloadState] = useState({
      busy: false,
      progress: 0,
      error: "",
      done: false,
  });

  const downloadPackage = async () => {
      if (downloadState.busy) return;
        setDownloadState({
            busy: true,
            progress: 0,
            error: "",
            done: false,
        });

        try {
            const response = await fetch(offlineDownloadUrl(language));

            if (!response.ok) {
                throw new Error("Không thể tải package offline.");
            }

            const total = Number(response.headers.get("content-length"));
            const reader = response.body?.getReader();

            let blob;

            if (reader) {
                const chunks = [];
                let received = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    received += value.length;

                    if (total > 0) {
                        setDownloadState((prev) => ({
                            ...prev,
                            progress: Math.min(
                                99,
                                Math.round((received / total) * 100)
                            ),
                        }));
                    }
                }

                blob = new Blob(chunks, {
                    type: "application/zip",
                });
            } else {
                blob = await response.blob();
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `zoo-offline-${language}.zip`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);

            setDownloadState({
                busy: false,
                progress: 100,
                error: "",
                done: true,
            });
        } catch (error) {
            setDownloadState({
                busy: false,
                progress: 0,
                error: error.message || "Tải package thất bại.",
                done: false,
            });
        }
    };


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
            onClick={() => setActiveTab("audio")}
            className={`settings-tab-btn ${activeTab === "audio" ? "is-active" : ""}`}
          >
            <Volume2 size={15} />
            <span>{t("tabAudio")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("download")}
            className={`settings-tab-btn ${activeTab === "download" ? "is-active" : ""
            }`}
            >
            <Download size={15} />
            <span>Gói Offline</span>
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

          {/* ================= TAB 2: ÂM THANH & BẢN ĐỒ ================= */}
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

                  {/* ================= TAB 3: GÓI OFFLINE ================= */}
                  {activeTab === "download" && (
                      <div className="settings-section animate-fade-in">
                          <h3>Gói dữ liệu ngoại tuyến</h3>

                          <p>
                              Tải bản đồ, thông tin POI, hình ảnh và
                              audio để lưu về thiết bị.
                          </p>

                          <p>
                              Ngôn ngữ: {language.toUpperCase()}
                          </p>

                          <button
                              type="button"
                              className="settings-btn-save"
                              onClick={downloadPackage}
                              disabled={downloadState.busy}
                          >
                              <Download size={16} />
                              <span>
                                  {downloadState.busy
                                      ? "Đang tải..."
                                      : "Tải package ZIP"}
                              </span>
                          </button>

                          {downloadState.busy && (
                              <div style={{ marginTop: "16px" }}>
                                  <progress
                                      value={downloadState.progress}
                                      max="100"
                                      style={{ width: "100%" }}
                                  />
                                  <p>
                                      {downloadState.progress > 0
                                          ? `${downloadState.progress}%`
                                          : "Đang tải dữ liệu..."}
                                  </p>
                              </div>
                          )}

                          {downloadState.done && (
                              <p style={{ color: "#16a34a" }} role="status">
                                  Đã tạo yêu cầu lưu package thành công!
                              </p>
                          )}

                          {downloadState.error && (
                              <p style={{ color: "#dc2626" }} role="alert">
                                  {downloadState.error}
                              </p>
                          )}
                      </div>
                  )}

        </div>

        {/* Footer Modal */}
        <div className="settings-footer">
          <button
            type="button"
            onClick={resetDefaults}
            className="settings-btn-reset"
            title="Khôi phục ngôn ngữ và tùy chọn bản đồ/âm thanh về mặc định"
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
