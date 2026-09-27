// MapMarkerPin.jsx
// 1 pin hình giọt nước, tái sử dụng cho mọi marker trên bản đồ.

import React from "react";

export default function MapMarkerPin({ color, active, dimmed, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="group absolute -translate-x-1/2 -translate-y-full focus:outline-none"
      style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity .2s, transform .2s" }}
    >
      {active && (
        <span
          className="absolute left-1/2 top-1/2 -z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
          style={{ backgroundColor: color, opacity: 0.35 }}
        />
      )}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full rounded-bl-none shadow-md ring-2 ring-white transition-transform group-hover:scale-110"
        style={{ backgroundColor: color, transform: "rotate(-45deg)" }}
      >
        <span style={{ transform: "rotate(45deg)" }} className="text-base leading-none">
          {children}
        </span>
      </div>
    </button>
  );
}
