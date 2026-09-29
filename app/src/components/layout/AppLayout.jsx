// components/layout/AppLayout.jsx
// Bố cục toàn màn hình ứng dụng: Header trên cùng, Sidebar bên trái, nội dung bản đồ ở giữa

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./layout.css";

export default function AppLayout({
  headerSlot,
  activeNavKey,
  onNavigate,
  onMenuClick,
  isPanelOpen,
  children,
}) {
  return (
    <div className="app-layout">
      <Header onMenuClick={onMenuClick} isPanelOpen={isPanelOpen}>
        {headerSlot}
      </Header>
      <div className="app-body">
        <Sidebar activeKey={activeNavKey} onNavigate={onNavigate} />
        {children}
      </div>
    </div>
  );
}