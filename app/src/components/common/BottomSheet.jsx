// components/common/BottomSheet.jsx
// Thành phần BottomSheet trượt từ dưới lên tối ưu cho trải nghiệm người dùng di động (Mobile UI)

import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = "85vh",
  headerRight,
}) {
  // Khoá cuộn body nền khi mở BottomSheet
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mobile-sheet-backdrop" onClick={onClose}>
      <div
        className="mobile-sheet-container"
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thanh gạt tay kéo (Handle bar) */}
        <div className="mobile-sheet-drag-handle-wrapper" onClick={onClose}>
          <div className="mobile-sheet-drag-handle" />
        </div>

        {/* Tiêu đề BottomSheet */}
        {(title || headerRight) && (
          <div className="mobile-sheet-header">
            <div className="mobile-sheet-header-text">
              {title && <h3 className="mobile-sheet-title">{title}</h3>}
              {subtitle && <p className="mobile-sheet-subtitle">{subtitle}</p>}
            </div>
            <div className="mobile-sheet-header-actions">
              {headerRight}
              <button
                type="button"
                onClick={onClose}
                className="mobile-sheet-close-btn"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Nội dung bên trong */}
        <div className="mobile-sheet-content custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}
