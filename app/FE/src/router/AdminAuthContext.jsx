// src/router/AdminAuthContext.jsx
// Context quản lý trạng thái đăng nhập Admin toàn cục

import React, { createContext, useContext, useState, useCallback } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  // Khởi tạo từ sessionStorage để giữ login khi reload trang
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem("admin_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Đăng nhập: lưu thông tin vào state và sessionStorage
  const login = useCallback((userData) => {
    setAdminUser(userData);
    sessionStorage.setItem("admin_user", JSON.stringify(userData));
  }, []);

  // Đăng xuất: xóa state và sessionStorage
  const logout = useCallback(() => {
    setAdminUser(null);
    sessionStorage.removeItem("admin_user");
  }, []);

  const isAuthenticated = Boolean(adminUser);

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Hook tiện ích
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
