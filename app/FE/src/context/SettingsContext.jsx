// context/SettingsContext.jsx
// Quản lý trạng thái cài đặt toàn cục: Ngôn ngữ, Font chữ, Cỡ chữ, Giao diện và Tiện ích

import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext(null);

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

// Từ điển đa ngôn ngữ cơ bản
export const TRANSLATIONS = {
  vi: {
    appTitle: "Thảo Cầm Viên",
    brandSubtitle: "Saigon Zoo & Botanical Gardens",
    hoursLabel: "Mở cửa: 07:00 - 18:30",
    weatherCity: "TP.HCM 31°C",
    adminBtn: "Admin",
    settingsTitle: "Cài Đặt Hệ Thống",
    settingsDesc: "Tùy chỉnh ngôn ngữ, kích cỡ chữ và giao diện tham quan",
    tabLang: "Ngôn ngữ",
    tabFont: "Cỡ chữ",
    tabDisplay: "Giao diện",
    tabAudio: "Bản đồ & Âm thanh",
    fontSelectLabel: "Chọn kiểu phông chữ",
    fontSizeLabel: "Kích thước chữ",
    previewTitle: "Bản xem trước kích thước chữ trực tiếp:",
    previewText: "Thảo Cầm Viên Sài Gòn (Est. 1864) — Không gian xanh lịch sử với hàng trăm loài động thực vật quý hiếm giữa lòng thành phố.",
    themeLabel: "Chế độ giao diện",
    themeLight: "Sáng tự nhiên",
    themeDark: "Tối dịu mắt (Ban đêm)",
    motionLabel: "Hiệu ứng chuyển động mượt",
    motionDesc: "Bật hoạt ảnh lướt, xoay và phóng to bản đồ mượt mà",
    autoAudioLabel: "Tự động phát thuyết minh",
    autoAudioDesc: "Tự động phát lời thuyết minh âm thanh khi bấm vào loài thú",
    showLabelsLabel: "Hiện nhãn tên chuồng thú trên bản đồ",
    showLabelsDesc: "Hiển thị tên các địa điểm trực tiếp trên từng icon",
    resetBtn: "Khôi phục mặc định",
    closeBtn: "Áp dụng & Đóng",
    guideBtn: "Hướng dẫn",
    searchPlaceholder: "Tìm loài thú, cây xanh, dịch vụ...",
    filterAll: "Tất cả",
    filterAnimal: "Động vật",
    filterPlant: "Thực vật",
    filterGate: "Cổng vào",
    filterService: "Dịch vụ",
    filterWc: "Vệ sinh",
    filterFun: "Giải trí",
    exploreBtn: "Khám phá khu vực",
    rightPanelTitle: "Hướng Dẫn Tham Quan",
    tabZones: "Khu nổi bật",
    tabLegend: "Chú thích",
  },
  en: {
    appTitle: "Saigon Zoo",
    brandSubtitle: "Saigon Zoo & Botanical Gardens",
    hoursLabel: "Open: 07:00 - 18:30",
    weatherCity: "HCMC 31°C",
    adminBtn: "Admin",
    settingsTitle: "System Settings",
    settingsDesc: "Customize language, text size, and display preferences",
    tabLang: "Language",
    tabFont: "Text Size",
    tabDisplay: "Display",
    tabAudio: "Map & Audio",
    fontSelectLabel: "Select Font Family",
    fontSizeLabel: "Text Size",
    previewTitle: "Live Text Size Preview:",
    previewText: "Saigon Zoo & Botanical Gardens (Est. 1864) — One of Asia's oldest botanical gardens, sanctuary to rare wildlife.",
    themeLabel: "Theme Mode",
    themeLight: "Natural Light",
    themeDark: "Eye-comfort Dark",
    motionLabel: "Smooth Animations",
    motionDesc: "Enable fluid panning, zooming, and transitions",
    autoAudioLabel: "Auto-play Audio Guide",
    autoAudioDesc: "Automatically play spoken audio narration when a marker is clicked",
    showLabelsLabel: "Display Pin Labels on Map",
    showLabelsDesc: "Render location names directly beside map markers",
    resetBtn: "Reset to Default",
    closeBtn: "Save & Close",
    guideBtn: "Guide",
    searchPlaceholder: "Search animals, plants, facilities...",
    filterAll: "All",
    filterAnimal: "Animals",
    filterPlant: "Plants",
    filterGate: "Gates",
    filterService: "Services",
    filterWc: "Restrooms",
    filterFun: "Activities",
    exploreBtn: "Explore Zones",
    rightPanelTitle: "Visitor Guide",
    tabZones: "Highlights",
    tabLegend: "Legend",
  },
  fr: {
    appTitle: "Jardin Botanique",
    brandSubtitle: "Jardin Botanique & Zoologique de Saigon",
    hoursLabel: "Ouvert: 07:00 - 18:30",
    weatherCity: "Hô Chi Minh-Ville 31°C",
    adminBtn: "Admin",
    settingsTitle: "Paramètres Système",
    settingsDesc: "Personnalisez la langue, la taille du texte et l'affichage",
    tabLang: "Langue",
    tabFont: "Taille du texte",
    tabDisplay: "Affichage",
    tabAudio: "Carte & Audio",
    fontSelectLabel: "Choisir la police",
    fontSizeLabel: "Taille de police",
    previewTitle: "Aperçu en direct:",
    previewText: "Jardin Zoologique et Botanique de Saigon (Fondé en 1864) — Havre de paix historique au cœur de la ville.",
    themeLabel: "Mode d'affichage",
    themeLight: "Clair Naturel",
    themeDark: "Sombre Reposant",
    motionLabel: "Animations fluides",
    motionDesc: "Activer les transitions douces et zoom fluide",
    autoAudioLabel: "Audio-guide automatique",
    autoAudioDesc: "Lire automatiquement la narration audio lors de la sélection",
    showLabelsLabel: "Afficher les étiquettes",
    showLabelsDesc: "Afficher le nom des enclos directement sur la carte",
    resetBtn: "Rétablir",
    closeBtn: "Appliquer",
    guideBtn: "Guide",
    searchPlaceholder: "Rechercher animaux, plantes...",
    filterAll: "Tout",
    filterAnimal: "Animaux",
    filterPlant: "Plantes",
    filterGate: "Entrées",
    filterService: "Services",
    filterWc: "Toilettes",
    filterFun: "Loisirs",
    exploreBtn: "Explorer",
    rightPanelTitle: "Guide de Visite",
    tabZones: "Points forts",
    tabLegend: "Légende",
  },
  zh: {
    appTitle: "西贡动植物园",
    brandSubtitle: "Saigon Zoo & Botanical Gardens",
    hoursLabel: "开放时间: 07:00 - 18:30",
    weatherCity: "胡志明市 31°C",
    adminBtn: "管理",
    settingsTitle: "系统设置",
    settingsDesc: "自定义语言、字号与浏览偏好",
    tabLang: "语言设置",
    tabFont: "字号大小",
    tabDisplay: "界面外观",
    tabAudio: "地图与导览",
    fontSelectLabel: "选择字体族",
    fontSizeLabel: "字号大小",
    previewTitle: "实时预览效果:",
    previewText: "西贡动植物园（建于1864年）— 亚洲历史悠久的动植物保护绿洲，城市心脏地带的自然生态园。",
    themeLabel: "外观模式",
    themeLight: "自然明亮",
    themeDark: "护眼暗色",
    motionLabel: "流畅动效",
    motionDesc: "启用平滑缩放与地图过渡动画",
    autoAudioLabel: "自动语音讲解",
    autoAudioDesc: "点击场馆时自动播报语音导览",
    showLabelsLabel: "显示地图点位标签",
    showLabelsDesc: "在地图图钉旁直接显示名称",
    resetBtn: "恢复默认",
    closeBtn: "保存并关闭",
    guideBtn: "导览",
    searchPlaceholder: "搜索动物、植物、服务设施...",
    filterAll: "全部",
    filterAnimal: "动物区",
    filterPlant: "植物区",
    filterGate: "出入口",
    filterService: "便利服务",
    filterWc: "洗手间",
    filterFun: "娱乐游乐",
    exploreBtn: "探索园区",
    rightPanelTitle: "游园指南",
    tabZones: "核心亮点",
    tabLegend: "图例说明",
  },
};

export function SettingsProvider({ children }) {
  // 1. Trạng thái Ngôn ngữ
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("zoo_lang") || "vi";
  });

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

  // Lưu ngôn ngữ
  const setLanguage = (langCode) => {
    setLanguageState(langCode);
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

  // Hàm dịch nhanh
  const t = (key, fallback = "") => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.vi;
    return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.vi[key] || fallback || key);
  };

  const value = {
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
