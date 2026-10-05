// components/layout/Sidebar.jsx
// Sidebar điều hướng chung — danh sách trang khai báo sẵn, không chứa logic bản đồ.

import React from "react";
import {
  MapPin,
  PawPrint,
  Leaf,
  Home as HomeIcon,
  UtensilsCrossed,
  Info as InfoIcon,
  ShieldCheck,
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
    <button onClick={onClick} className={`nav-item ${active ? "is-active" : ""}`}>
      <div className="nav-item__icon">
        <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
      </div>
      {label}
    </button>
  );
}

export default function Sidebar({ activeKey = "map", onNavigate }) {
  return (
    <aside className="sidebar">
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          active={item.key === activeKey}
          onClick={() => onNavigate?.(item.key)}
        />
      ))}
      <div style={{ marginTop: "auto", width: "100%", paddingTop: "8px" }}>
        <NavItem
          icon={ShieldCheck}
          label="Admin"
          active={activeKey === "admin"}
          onClick={() => onNavigate?.("admin")}
        />
      </div>
    </aside>
  );
}