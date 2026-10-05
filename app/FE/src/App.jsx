// App.jsx
// Điều hướng giao diện không dùng react-router (Dùng hash / state switcher)

import React, { useState, useEffect } from "react";
import ZooMap from "./components/map";
import AdminLogin from "./components/admin";
import { SettingsProvider } from "./context/SettingsContext";
import OfflineNotice from "./components/ui/OfflineNotice";

function AppContent() {
  // Trạng thái màn hình hiện tại: "map" | "admin"
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    if (hash === "#admin" || params.get("page") === "admin" || params.get("view") === "admin") {
      return "admin";
    }
    return "map";
  });

  // Lắng nghe sự thay đổi hash trên thanh địa chỉ trình duyệt
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#admin") {
        setCurrentView("admin");
      } else if (hash === "#map" || hash === "") {
        setCurrentView("map");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Chuyển view và đồng bộ hash trình duyệt
  const navigateTo = (viewName) => {
    setCurrentView(viewName);
    if (viewName === "admin") {
      window.location.hash = "admin";
    } else {
      window.location.hash = "";
    }
  };

  // Màn hình Đăng nhập Quản trị viên
  if (currentView === "admin") {
    return (
      <AdminLogin
        onBack={() => navigateTo("map")}
        onLoginSuccess={(userData) => {
          alert(`Đăng nhập thành công! Xin chào ${userData.name || userData.username}`);
        }}
      />
    );
  }

  // Màn hình Bản đồ Thảo Cầm Viên mặc định
  return <ZooMap onNavigateAdmin={() => navigateTo("admin")} />;
}

export default function App() {
  return (
    <SettingsProvider>
      <OfflineNotice />
      <AppContent />
    </SettingsProvider>
  );
}