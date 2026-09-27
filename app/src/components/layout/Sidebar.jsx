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
      className={`flex w-full flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs transition-colors ${
        active ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
      {label}
    </button>
  );
}

export default function Sidebar({ activeKey = "map", onNavigate }) {
  return (
    <aside className="flex w-20 flex-col items-center gap-1 border-r border-slate-100 bg-white py-4">
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
