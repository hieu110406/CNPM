import React, { useState } from "react";
import {
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    LogIn,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { api } from "../../api/client";
import logo from "../../assets/marker/logo.png";
import "./admin.css";

export default function AdminLogin({ onBack, onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);

    const handleBackToMap = () => {
        if (onBack) onBack();
        else window.location.hash = "";
    };

    /* ============ BƯỚC 1: Login email/password ============ */
    const handleSubmitCredentials = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username.trim()) return setError("Vui lòng nhập email quản trị.");
        if (!password) return setError("Vui lòng nhập mật khẩu.");

        setIsLoading(true);
        try {
            const res = await api.login(username.trim(), password);

            localStorage.setItem("admin_token", res.accessToken);
            localStorage.setItem("admin_refresh", res.refreshToken);
            setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
            setTimeout(() => onLoginSuccess?.(res.admin), 500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login__glow admin-login__glow--1" />
            <div className="admin-login__glow--2 admin-login__glow" />
            <div className="admin-login__glow--3 admin-login__glow" />
            <div className="admin-login__grid-pattern" />

            <div className="admin-login__container">
                {/* Thanh điều hướng trên cùng */}
                <div className="admin-login__top-bar">
                    <button
                        type="button"
                        onClick={handleBackToMap}
                        className="admin-login__btn-back"
                        title="Quay lại giao diện bản đồ tham quan"
                    >
                        <ArrowLeft size={16} />
                        <span>Quay lại bản đồ</span>
                    </button>

                    <div className="admin-login__status-tag">
                        <span className="admin-login__status-dot" />
                        <span>Hệ thống trực tuyến</span>
                    </div>
                </div>

                {/* Card chính */}
                <div className="admin-login__card">
                    <div className="admin-login__card-highlight" />

                    {/* Header thương hiệu */}
                    <div className="admin-login__header">
                        <div className="admin-login__brand-icon">
                            <img src={logo} alt="Thảo Cầm Viên Sài Gòn" />
                        </div>
                        <div>
                            <span className="admin-login__badge">Est. 1864 • Cổng Quản Trị</span>
                            <h1 className="admin-login__title">Thảo Cầm Viên Sài Gòn</h1>
                            <p className="admin-login__subtitle">Hệ thống Quản trị &amp; Điều hành dữ liệu số</p>
                        </div>
                    </div>

                    {/* Thông báo lỗi */}
                    {error && (
                        <div className="admin-login__alert admin-login__alert--error">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Thông báo thành công */}
                    {success && (
                        <div className="admin-login__alert admin-login__alert--success">
                            <CheckCircle2 size={18} className="flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmitCredentials} className="admin-login__form">
                            <div className="admin-login__field">
                                <label className="admin-login__label">Email quản trị</label>
                                <div className="admin-login__input-wrapper">
                                    <span className="admin-login__input-icon">
                                        <User size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="ly.huynh@saigonzoo.net"
                                        className="admin-login__input"
                                        autoComplete="username"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="admin-login__field">
                                <label className="admin-login__label">Mật khẩu</label>
                                <div className="admin-login__input-wrapper">
                                    <span className="admin-login__input-icon">
                                        <Lock size={16} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="admin-login__input"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="admin-login__toggle-pw"
                                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="admin-login__options">
                                <label className="admin-login__remember">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="admin-login__checkbox"
                                    />
                                    <span>Ghi nhớ đăng nhập</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="admin-login__forgot-link"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="admin-login__btn-submit"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="admin-login__spinner" />
                                        <span>Đang xác thực...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={16} />
                                        <span>Đăng nhập hệ thống</span>
                                    </>
                                )}
                            </button>
                        </form>
                    {/* Footer bảo mật */}
                    <div className="admin-login__footer">
                        <div className="admin-login__security-info">
                            <ShieldCheck size={14} />
                            <span>Bảo mật SSL 256-bit • JWT</span>
                        </div>
                        <span>© {new Date().getFullYear()} Thảo Cầm Viên Sài Gòn</span>
                    </div>
                </div>
            </div>

            {/* Modal Quên mật khẩu */}
            {showForgotModal && (
                <div
                    className="admin-login__modal-backdrop"
                    onClick={() => setShowForgotModal(false)}
                >
                    <div
                        className="admin-login__modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="admin-login__modal-title">Khôi phục mật khẩu Quản trị</h3>
                        <p className="admin-login__modal-desc">
                            Hệ thống này chỉ dành riêng cho Ban điều hành Thảo Cầm Viên Sài Gòn.
                            Nếu quên thông tin đăng nhập, vui lòng liên hệ bộ phận IT qua email nội bộ:{" "}
                            <strong>admin@saigonzoo.net</strong>.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowForgotModal(false)}
                            className="admin-login__modal-btn"
                        >
                            Đã hiểu &amp; Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}