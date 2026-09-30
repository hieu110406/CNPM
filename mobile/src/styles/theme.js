// src/styles/theme.js
// Hệ thống màu sắc & typography cho mobile Thảo Cầm Viên
// Sử dụng bảng màu emerald/green nhất quán với web

export const COLORS = {
  // Emerald palette — chủ đạo
  emerald950: "#022c22",
  emerald900: "#064e3b",
  emerald800: "#065f46",
  emerald700: "#047857",
  emerald600: "#059669",
  emerald500: "#10b981",
  emerald400: "#34d399",
  emerald300: "#6ee7b7",
  emerald200: "#a7f3d0",
  emerald100: "#d1fae5",
  emerald50: "#ecfdf5",

  // Amber — accent
  amber500: "#f59e0b",
  amber400: "#fbbf24",
  amber300: "#fcd34d",

  // Slate — neutral
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",

  // Semantic
  white: "#ffffff",
  black: "#000000",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  success: "#10b981",

  // Type-specific (match web mapData TYPE_META)
  typeAnimal: "#059669",
  typePlant: "#16a34a",
  typeBuilding: "#e11d48",
  typeEntertainment: "#8b5cf6",
  typeRestaurant: "#d97706",
  typeRestroom: "#2563eb",
  typeService: "#0284c7",
  typeMedical: "#dc2626",
  typePhoto: "#ec4899",

  // Backgrounds
  bgCard: "#ffffff",
  bgScreen: "#f0fdf4",
  bgDark: "#022c22",
  bgOverlay: "rgba(15, 23, 42, 0.5)",
};

export const TYPE_COLORS = {
  animal: { color: COLORS.typeAnimal, bg: COLORS.emerald50, border: COLORS.emerald200 },
  plant: { color: COLORS.typePlant, bg: "#f0fdf4", border: "#bbf7d0" },
  building: { color: COLORS.typeBuilding, bg: "#fff1f2", border: "#fecdd3" },
  entertainment: { color: COLORS.typeEntertainment, bg: "#f5f3ff", border: "#ddd6fe" },
  restaurant: { color: COLORS.typeRestaurant, bg: "#fffbeb", border: "#fde68a" },
  restroom: { color: COLORS.typeRestroom, bg: "#eff6ff", border: "#bfdbfe" },
  service: { color: COLORS.typeService, bg: "#f0f9ff", border: "#bae6fd" },
  medical: { color: COLORS.typeMedical, bg: "#fef2f2", border: "#fecaca" },
  photo: { color: COLORS.typePhoto, bg: "#fdf2f8", border: "#fbcfe8" },
};

export const FONTS = {
  regular: "System",
  medium: "System",
  semibold: "System",
  bold: "System",
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 9999,

  // Font sizes
  caption: 11,
  small: 12,
  body: 14,
  subtitle: 15,
  title: 17,
  heading: 20,
  display: 28,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
};
