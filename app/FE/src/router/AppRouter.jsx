// src/router/AppRouter.jsx
// Router chính - điều hướng giữa giao diện User và Admin bằng react-router-dom v6

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "../context/SettingsContext";
import OfflineNotice from "../components/ui/OfflineNotice";
import { AdminAuthProvider } from "./AdminAuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Lazy load các page để tối ưu bundle size
const ZooMap     = React.lazy(() => import("../components/map"));
const AdminLogin = React.lazy(() => import("../components/admin/AdminLogin"));
const AdminDashboard = React.lazy(() => import("../components/admin/AdminDashboard"));

function Fallback() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0a0f1a",
      color: "#64ffda",
      fontSize: "1.1rem",
      gap: "12px",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        border: "2px solid #64ffda",
        borderTopColor: "transparent",
        animation: "spin 0.8s linear infinite",
      }} />
      Đang tải...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AdminAuthProvider>
          <OfflineNotice />
          <React.Suspense fallback={<Fallback />}>
            <Routes>
              {/* ───── Giao diện User ───── */}
              <Route path="/" element={<ZooMap />} />

              {/* ───── Admin: Trang đăng nhập ───── */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* ───── Admin: Dashboard (yêu cầu đăng nhập) ───── */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* ───── Fallback 404 ───── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </AdminAuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
