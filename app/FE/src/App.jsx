// App.jsx
// Điều hướng giao diện không dùng react-router (Dùng hash / state switcher)

import { useState, useEffect, useRef } from "react";
import { api } from "./api/client";
import ZooMap from "./components/map";
import AdminLogin, { AdminDashboard } from "./components/admin";
import { SettingsProvider } from "./context/SettingsContext";
import OfflineNotice from "./components/ui/OfflineNotice";

function createSessionId() {
  try {
    let id = sessionStorage.getItem("tcv_session_id");
    if (!id) {
      id = "s_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
      sessionStorage.setItem("tcv_session_id", id);
    }
    return id;
  } catch {
    return "s_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
  }
}

function AppContent() {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("tcv_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Session ID duy nhất cho tab này (dùng sessionStorage để mỗi tab/cửa sổ là 1 session độc lập)
  const sessionId = useRef(null);

  const getSessionId = () => {
    if (sessionId.current) return sessionId.current;
    sessionId.current = createSessionId();
    return sessionId.current;
  };

  // Heartbeat ping mỗi 30s — báo hiệu đang online
  const currentViewRef = useRef(null);
  const pingIntervalRef = useRef(null);

  const sendPing = () => {
    if (currentViewRef.current !== "map") return;
    const lang = localStorage.getItem("tcv_lang") || "vi";
    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    api.pingSession(getSessionId(), lang, null, isMobile ? "mobile" : "web").catch(() => {});
  };

  useEffect(() => {
    // Ping định kỳ mỗi 30s
    pingIntervalRef.current = setInterval(() => sendPing(), 30_000);
    // Xóa session khi đóng tab
    const onUnload = () => {
      if (sessionId.current) api.removeSession(sessionId.current).catch(() => {});
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(pingIntervalRef.current);
      window.removeEventListener("beforeunload", onUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    currentViewRef.current = currentView;
    if (currentView === "map") {
      sendPing();
    } else {
      if (sessionId.current) api.removeSession(sessionId.current).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

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