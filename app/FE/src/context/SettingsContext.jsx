
/* eslint-disable react-refresh/only-export-components */
// Quản lý trạng thái cài đặt toàn cục: Ngôn ngữ, Font chữ, Cỡ chữ, Giao diện và Tiện ích

import { createContext, useContext, useState, useEffect } from "react";
import i18n from "i18next";

import VI from "@i18n/vi.js";
import EN from "@i18n/en.js";
import FR from "@i18n/fr.js";
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
  filterService: "filters.service",
  filterWc: "filters.wc",
  filterFun: "filters.fun",
  settingsTitle: "settings.title",
  settingsDesc: "settings.description",
  tabLang: "settings.tabs.language",
  tabFont: "settings.tabs.font",
  tabDisplay: "settings.tabs.display",
  tabAudio: "settings.tabs.audio",
  fontSelectLabel: "settings.font.selectLabel",
  fontSizeLabel: "settings.font.sizeLabel",
  previewTitle: "settings.font.previewTitle",
  previewText: "settings.font.previewText",
  themeLabel: "settings.theme.label",
  themeLight: "settings.theme.light",
  themeDark: "settings.theme.dark",
  motionLabel: "settings.motion.label",
  motionDesc: "settings.motion.description",
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
  { code: "vi", label: "Tiếng Việt", native: "Tiếng Việt", flag: "🇻🇳", desc: "Mặc định hệ thống" },
  { code: "en", label: "English", native: "English (US)", flag: "🇬🇧", desc: "International standard" },
  { code: "fr", label: "Français", native: "Français", flag: "🇫🇷", desc: "Langue française" },
  { code: "zh", label: "中文", native: "简体中文", flag: "🇨🇳", desc: "中文简体指南" },
];

// Danh mục font chữ hỗ trợ
export const FONTS = [
  {
    id: "Plus Jakarta Sans",
    name: "Plus Jakarta Sans",
    badge: "Mặc định",
    desc: "Hiện đại, bo tròn thân thiện, tối ưu cho giao diện bản đồ",
    family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  {
    id: "Inter",
    name: "Inter",
    badge: "Công nghệ",
    desc: "Tối giản, rõ ràng từng chi tiết số và ký tự",
    family: "'Inter', system-ui, -apple-system, sans-serif",
  },
  {
    id: "Roboto",
    name: "Roboto",
    badge: "Tiêu chuẩn",
    desc: "Cân đối, dễ đọc trên mọi độ phân giải màn hình",
    family: "'Roboto', system-ui, -apple-system, sans-serif",
  },
  {
    id: "Merriweather",
    name: "Merriweather",
    badge: "Cổ điển",
    desc: "Thanh lịch, có chân chữ gợi nét lịch sử 160 năm của Thảo Cầm Viên",
    family: "'Merriweather', Georgia, serif",
  },
];

// Danh mục cỡ chữ
export const FONT_SIZES = [
  { id: "small", label: "Nhỏ (92%)", scale: "92%", desc: "Hiển thị nhiều nội dung hơn" },
  { id: "normal", label: "Vừa (100%)", scale: "100%", desc: "Cân đối tiêu chuẩn cho mọi mắt nhìn" },
  { id: "large", label: "Lớn (112%)", scale: "112%", desc: "Chữ to rõ, dễ đọc cho người lớn tuổi" },
];

// Khởi tạo engine đa ngôn ngữ i18n
const savedLang = typeof window !== "undefined" ? localStorage.getItem("zoo_lang") || "vi" : "vi";

if (!i18n.isInitialized) {
  i18n.init({
    lng: savedLang,
    fallbackLng: "vi",
    resources: {
      vi: { translation: prepareResource(VI) },
      en: { translation: prepareResource(EN) },
      fr: { translation: prepareResource(FR) },
      zh: { translation: prepareResource(ZH) },
    },
    interpolation: {
      escapeValue: false,
    },
  });
}

export function SettingsProvider({ children }) {
  // 1. Trạng thái Ngôn ngữ đồng bộ với i18n
  const [language, setLanguageState] = useState(() => {
    return i18n.language || savedLang;
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

  // 2. Trạng thái Font chữ
  const [fontId, setFontIdState] = useState(() => {
    return localStorage.getItem("zoo_font") || "Plus Jakarta Sans";
  });

  // 3. Trạng thái Cỡ chữ
  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem("zoo_fontSize") || "normal";
  });

  // 4. Trạng thái Giao diện (Sáng / Tối)
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("zoo_theme") || "light";
  });

  // 5. Hiệu ứng chuyển động
  const [motionEnabled, setMotionEnabledState] = useState(() => {
    return localStorage.getItem("zoo_motion") !== "false";
  });

  // 6. Tự động phát âm thanh
  const [autoAudio, setAutoAudioState] = useState(() => {
    return localStorage.getItem("zoo_autoAudio") === "true";
  });

  // 7. Hiện nhãn tên bản đồ
  const [showLabels, setShowLabelsState] = useState(() => {
    return localStorage.getItem("zoo_showLabels") !== "false";
  });

  // 8. Trạng thái mở modal Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Áp dụng Font chữ lên document
  useEffect(() => {
    const fontObj = FONTS.find((f) => f.id === fontId) || FONTS[0];
    document.documentElement.style.setProperty("--font-body", fontObj.family);
    localStorage.setItem("zoo_font", fontId);
  }, [fontId]);

  // Áp dụng Cỡ chữ lên document
  useEffect(() => {
    const sizeObj = FONT_SIZES.find((s) => s.id === fontSize) || FONT_SIZES[1];
    document.documentElement.style.setProperty("--font-scale", sizeObj.scale);
    document.documentElement.style.fontSize = sizeObj.scale;
    localStorage.setItem("zoo_fontSize", fontSize);
  }, [fontSize]);

  // Áp dụng Theme (Sáng / Tối)
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
    localStorage.setItem("zoo_theme", theme);
  }, [theme]);

  // Lưu ngôn ngữ & đồng bộ với engine i18n
  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem("zoo_lang", langCode);
  };

  // Lưu font
  const setFontId = (id) => {
    setFontIdState(id);
  };

  // Lưu cỡ chữ
  const setFontSize = (size) => {
    setFontSizeState(size);
  };

  // Lưu theme
  const setTheme = (t) => {
    setThemeState(t);
  };

  // Lưu motion
  const setMotionEnabled = (enabled) => {
    setMotionEnabledState(enabled);
    localStorage.setItem("zoo_motion", enabled ? "true" : "false");
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
    setFontId("Plus Jakarta Sans");
    setFontSize("normal");
    setTheme("light");
    setMotionEnabled(true);
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
    fontId,
    setFontId,
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
