// components/layout/Sidebar.jsx
// Sidebar điều hướng chung — danh sách trang khai báo sẵn, không chứa logic bản đồ.
// Sau này thêm trang "Động vật", "Thực vật"... chỉ cần map key -> route/component ở nơi dùng nó.

import React from "react";
import {
  MapPin,
  PawPrint,
  Leaf,
  Home as HomeIcon,
  UtensilsCrossed,
  Info as InfoIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "map", icon: MapPin, label: "Bản đồ" },
  { key: "animals", icon: PawPrint, label: "Động vật" },
  { key: "plants", icon: Leaf, label: "Thực vật" },
  { key: "zones", icon: HomeIcon, label: "Khu vực" },
  { key: "services", icon: UtensilsCrossed, label: "Dịch vụ" },
  { key: "info", icon: InfoIcon, label: "Thông tin" },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[11px] font-medium transition-all duration-200 ${
        active
          ? "bg-emerald-50 text-emerald-700 shadow-sm"
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
          active
            ? "bg-emerald-100 text-emerald-700 shadow-inner"
            : "bg-transparent group-hover:bg-slate-100"
        }`}
      >
        <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
      </div>
      {label}
    </button>
  );
}

export default function Sidebar({ activeKey = "map", onNavigate }) {
  return (
    <aside className="flex w-[76px] shrink-0 flex-col items-center gap-0.5 border-r border-slate-100 bg-white/80 py-3 backdrop-blur-sm">
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          active={item.key === activeKey}
          onClick={() => onNavigate?.(item.key)}
        />
      ))}
    </aside>
  );
}
