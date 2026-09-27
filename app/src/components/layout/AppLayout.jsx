// components/layout/AppLayout.jsx
// Bố cục toàn màn hình ứng dụng: Header trên cùng, Sidebar bên trái, nội dung bản đồ ở giữa

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout({
  headerSlot,
  activeNavKey,
  onNavigate,
  onMenuClick,
  isPanelOpen,
  children,
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-900 font-sans antialiased select-none">
      <Header onMenuClick={onMenuClick} isPanelOpen={isPanelOpen}>
        {headerSlot}
      </Header>
      <div className="relative flex flex-1 overflow-hidden bg-[#eaf4ec]">
        <Sidebar activeKey={activeNavKey} onNavigate={onNavigate} />
        {children}
      </div>
    </div>
  );
}
