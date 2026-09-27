// components/layout/AppLayout.jsx
// Thêm "relative" cho hàng Sidebar+content để MapSidePanel (drawer) có thể
// định vị "absolute" đúng trong phạm vi này. Forward onMenuClick xuống Header.

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout({ headerSlot, activeNavKey, onNavigate, onMenuClick, children }) {
  return (
    <div className="flex h-[720px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white font-sans shadow-sm">
      <Header onMenuClick={onMenuClick}>{headerSlot}</Header>
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar activeKey={activeNavKey} onNavigate={onNavigate} />
        {children}
      </div>
    </div>
  );
}
