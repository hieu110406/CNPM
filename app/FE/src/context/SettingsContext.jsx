
/* eslint-disable react-refresh/only-export-components */
// Quản lý trạng thái cài đặt toàn cục: Ngôn ngữ và tiện ích bản đồ/âm thanh

import { createContext, useContext, useState, useEffect } from "react";
import i18n from "i18next";

import VI from "@i18n/vi.js";
import EN from "@i18n/en.js";
import ZH from "@i18n/zh.js";

const SettingsContext = createContext(null);

// Ánh xạ các key dịch phẳng (legacy flat keys) sang key phân cấp (nested keys)
export const LEGACY_KEY_MAP = {
  appTitle: "app.title",
  brandSubtitle: "app.subtitle",
  hoursLabel: "app.hours",
  weatherCity: "app.weather",
  adminBtn: "navigation.admin",
  guideBtn: "navigation.guide",
  exploreBtn: "navigation.explore",
  searchPlaceholder: "search.placeholder",
  filterAll: "filters.all",
  filterAnimal: "filters.animal",
  filterPlant: "filters.plant",
  filterGate: "filters.gate",
  filterBuilding: "filters.building",
  filterEntertainment: "filters.entertainment",
  filterRestaurant: "filters.restaurant",
  filterRestroom: "filters.restroom",
  filterMedical: "filters.medical",
  filterPhoto: "filters.photo",
  filterService: "filters.service",
  filterWc: "filters.wc",
  filterFun: "filters.fun",
  settingsTitle: "settings.title",
  settingsDesc: "settings.description",
  tabLang: "settings.tabs.language",
  tabAudio: "settings.tabs.audio",
  autoAudioLabel: "settings.audio.autoPlayLabel",
  autoAudioDesc: "settings.audio.autoPlayDescription",
  showLabelsLabel: "settings.map.showLabelsLabel",
  showLabelsDesc: "settings.map.showLabelsDescription",
  resetBtn: "settings.actions.reset",
  closeBtn: "settings.actions.close",
  rightPanelTitle: "guide.title",
  tabZones: "guide.tabs.zones",
  tabLegend: "guide.tabs.legend",
  offlineNotice: "system.offline",
};

// Hàm chuẩn bị tài nguyên ngôn ngữ: hỗ trợ cả truy vấn phân cấp (app.title) và phẳng (appTitle)
function prepareResource(nestedObj) {
  if (!nestedObj || typeof nestedObj !== "object") return {};
  const flat = {};
  for (const [flatKey, path] of Object.entries(LEGACY_KEY_MAP)) {
    const parts = path.split(".");
    let val = nestedObj;
    for (const part of parts) {
      if (val && typeof val === "object") {
        val = val[part];
      } else {
        val = undefined;
        break;
      }
    }
    if (val !== undefined) {
      flat[flatKey] = val;
    }
  }
  return { ...nestedObj, ...flat };
}

// Danh mục ngôn ngữ hỗ trợ
export const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", native: "Tiếng Việt", flag: "VN", desc: "Mặc định hệ thống" },
  { code: "en", label: "English", native: "English (US)", flag: "EN", desc: "International standard" },
  { code: "zh", label: "中文", native: "简体中文", flag: "CN", desc: "中文简体指南" },
];

// Khởi tạo engine đa ngôn ngữ i18n
const storedLang = typeof window !== "undefined" ? localStorage.getItem("zoo_lang") : null;
const savedLang = LANGUAGES.some(({ code }) => code === storedLang) ? storedLang : "vi";

if (!i18n.isInitialized) {
  i18n.init({
    lng: savedLang,
    fallbackLng: "vi",
    resources: {
      vi: { translation: prepareResource(VI) },
      en: { translation: prepareResource(EN) },
      zh: { translation: prepareResource(ZH) },
    },
    interpolation: {
      escapeValue: false,
    },
  });
} else if (!LANGUAGES.some(({ code }) => code === i18n.language)) {
  i18n.changeLanguage(savedLang);
}

export function SettingsProvider({ children }) {
  // 1. Trạng thái Ngôn ngữ đồng bộ với i18n
  const [language, setLanguageState] = useState(() => {
    return LANGUAGES.some(({ code }) => code === i18n.language)
      ? i18n.language
      : savedLang;
  });

  // Lắng nghe sự thay đổi ngôn ngữ từ engine i18n
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setLanguageState(lng);
    };
    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  // 2. Tự động phát âm thanh
  const [autoAudio, setAutoAudioState] = useState(() => {
    return localStorage.getItem("zoo_autoAudio") === "true";
  });

  // 3. Hiện nhãn tên bản đồ
  const [showLabels, setShowLabelsState] = useState(() => {
    return localStorage.getItem("zoo_showLabels") !== "false";
  });

  // 4. Trạng thái mở modal Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Lưu ngôn ngữ & đồng bộ với engine i18n
  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem("zoo_lang", langCode);
  };

  // Lưu auto audio
  const setAutoAudio = (enabled) => {
    setAutoAudioState(enabled);
    localStorage.setItem("zoo_autoAudio", enabled ? "true" : "false");
  };

  // Lưu show labels
  const setShowLabels = (enabled) => {
    setShowLabelsState(enabled);
    localStorage.setItem("zoo_showLabels", enabled ? "true" : "false");
  };

  // Khôi phục cài đặt mặc định
  const resetDefaults = () => {
    setLanguage("vi");
    setAutoAudio(false);
    setShowLabels(true);
  };

  // Hàm dịch chuẩn i18n hỗ trợ cả key cũ lẫn key cấu trúc mới
  const t = (key, fallback = "") => {
    const mappedKey = LEGACY_KEY_MAP[key];
    if (i18n.exists(key)) {
      return i18n.t(key, { defaultValue: fallback || key });
    }
    if (mappedKey && i18n.exists(mappedKey)) {
      return i18n.t(mappedKey, { defaultValue: fallback || key });
    }
    return i18n.t(key, { defaultValue: fallback || key });
  };

  const value = {
    i18n,
    language,
    setLanguage,
    autoAudio,
    setAutoAudio,
    showLabels,
    setShowLabels,
    isSettingsOpen,
    setIsSettingsOpen,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    resetDefaults,
    t,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
