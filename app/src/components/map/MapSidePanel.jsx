// components/map/MapSidePanel.jsx
// Drawer trượt ra từ mép phải, có lớp nền mờ phía sau — bấm ra ngoài hoặc nút X để đóng.

import React from "react";
import { X } from "lucide-react";

export default function MapSidePanel({ isOpen, onClose, children }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`drawer-backdrop ${isOpen ? "is-open" : ""}`}
      />

      <aside className={`drawer ${isOpen ? "is-open" : ""}`}>
        <button onClick={onClose} className="drawer__close">
          <X size={18} />
        </button>
        {children}
      </aside>
    </>
  );
}