// src/router/ProtectedRoute.jsx
// Guard route: chỉ cho vào nếu đã đăng nhập admin, không thì redirect về /admin

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Lưu lại trang muốn vào để sau khi đăng nhập redirect đúng chỗ
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
}
