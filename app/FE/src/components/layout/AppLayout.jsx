// components/layout/AppLayout.jsx
// Bố cục toàn màn hình ứng dụng: Header trên cùng, nội dung bản đồ ở giữa

import React from "react";
import Header from "./Header";
import "./layout.css";

export default function AppLayout({
  headerSlot,
  onMenuClick,
  isPanelOpen,
  children,
}) {
  return (
    <div className="app-layout">
      <Header
        onMenuClick={onMenuClick}
        isPanelOpen={isPanelOpen}
      >
        {headerSlot}
      </Header>
      <div className="app-body">
        {children}
      </div>
    </div>
  );
}