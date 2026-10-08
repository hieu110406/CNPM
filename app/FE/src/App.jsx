// App.jsx
// Điều hướng giao diện không dùng react-router (Dùng hash / state switcher)

import React, { useState, useEffect } from "react";
import ZooMap from "./components/map";
import AdminLogin, { AdminDashboard } from "./components/admin";
import { SettingsProvider } from "./context/SettingsContext";
import OfflineNotice from "./components/ui/OfflineNotice";

function AppContent() {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("tcv_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Trạng thái màn hình hiện tại: "map" | "admin" | "dashboard"
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    if (
      hash === "#dashboard" ||
      hash === "#admin/dashboard" ||
      params.get("page") === "dashboard" ||
      params.get("view") === "dashboard"
    ) {
      return "dashboard";
    }
    if (hash === "#admin" || params.get("page") === "admin" || params.get("view") === "admin") {
      return "admin";
    }
    return "map";
  });

  // Lắng nghe sự thay đổi hash trên thanh địa chỉ trình duyệt
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#dashboard" || hash === "#admin/dashboard") {
        setCurrentView("dashboard");
      } else if (hash === "#admin") {
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
    if (viewName === "dashboard") {
      window.location.hash = "dashboard";
    } else if (viewName === "admin") {
      window.location.hash = "admin";
    } else {
      window.location.hash = "";
    }
  };

  const handleLoginSuccess = (userData) => {
    setAdminUser(userData);
    try {
      localStorage.setItem("tcv_admin_user", JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
    navigateTo("dashboard");
  };

  const handleLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem("tcv_admin_user");
    } catch (e) {
      console.error(e);
    }
    navigateTo("admin");
  };

  // Màn hình Dashboard Quản trị viên
  if (currentView === "dashboard") {
    // Nếu chưa đăng nhập, chuyển về trang login
    if (!adminUser) {
      return (
        <AdminLogin
          onBack={() => navigateTo("map")}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }
    return (
      <AdminDashboard
        user={adminUser}
        onLogout={handleLogout}
        onGoToMap={() => navigateTo("map")}
      />
    );
  }

  // Màn hình Đăng nhập Quản trị viên
  if (currentView === "admin") {
    // Nếu đã đăng nhập trước đó, chuyển tiếp vào dashboard
    if (adminUser) {
      return (
        <AdminDashboard
          user={adminUser}
          onLogout={handleLogout}
          onGoToMap={() => navigateTo("map")}
        />
      );
    }
    return (
      <AdminLogin
        onBack={() => navigateTo("map")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Màn hình Bản đồ Thảo Cầm Viên mặc định
  return (
    <ZooMap
      onNavigateAdmin={() => navigateTo(adminUser ? "dashboard" : "admin")}
    />
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <OfflineNotice />
      <AppContent />
    </SettingsProvider>
  );
}