// components/map/MapSidePanel.jsx
// Panel "Chú thích" + "Các khu nổi bật" giờ là 1 drawer trượt ra từ mép phải,
// có lớp nền mờ phía sau — bấm ra ngoài hoặc nút X để đóng lại.
// Thay cho <aside> cố định chiếm chỗ trước đây.

import React from "react";
import { X } from "lucide-react";

export default function MapSidePanel({ isOpen, onClose, children }) {
  return (
    <>
      {/* lớp nền mờ phía sau drawer */}
      <div
        onClick={onClose}
        className={`absolute inset-0 z-20 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* drawer */}
      <aside
        className={`absolute inset-y-0 right-0 z-30 flex w-72 flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          className="self-end rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>
        {children}
      </aside>
    </>
  );
}
