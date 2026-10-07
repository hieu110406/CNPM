// components/ui/OfflineNotice.jsx
// Thông báo nổi khi mất kết nối mạng — dùng t() từ SettingsContext (không cần react-i18next)

import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine !== false : true
  );
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online",  on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return isOnline;
}

export default function OfflineNotice() {
  const isOnline = useNetworkStatus();
  const { t } = useSettings();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#ef4444",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "9999px",
        fontSize: "13px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 10px 28px -4px rgba(239,68,68,.45)",
        zIndex: 9999,
        animation: "pulse 2s infinite ease-in-out",
        whiteSpace: "nowrap",
      }}
    >
      <WifiOff size={16} />
      <span>
        {t("offlineNotice", "Bạn đang ở chế độ ngoại tuyến.")}
      </span>
    </div>
  );
}
