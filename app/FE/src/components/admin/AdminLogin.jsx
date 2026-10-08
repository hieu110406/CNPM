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
    KeyRound,
    Mail,
} from "lucide-react";
import { api } from "../../api/client";
import "./admin.css";

export default function AdminLogin({ onBack, onLoginSuccess }) {
    const [step, setStep] = useState("credentials"); // "credentials" | "mfa"
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mfaCode, setMfaCode] = useState("");
    const [pendingAdminId, setPendingAdminId] = useState(null);
    const [pendingEmail, setPendingEmail] = useState("");
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

            // Ẩn mã MFA khỏi UI — chỉ log ra Console để dev test
            console.log("%c🔐 MFA CODE (demo):", "color:#10b981;font-weight:bold;font-size:14px;", res.mfaCode);
            console.log("%c📧 Đã gửi tới:", "color:#64748b;", res.email);

            setPendingAdminId(res.adminId);
            setPendingEmail(res.email);
            setSuccess("Mã MFA đã được gửi. Vui lòng kiểm tra email quản trị.");
            setStep("mfa");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    /* ============ BƯỚC 2: Verify MFA ============ */
    const handleSubmitMfa = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!/^\d{6}$/.test(mfaCode.trim())) {
            return setError("Mã MFA phải gồm 6 chữ số.");
        }

        setIsLoading(true);
        try {
            const res = await api.verifyMfa(pendingAdminId, mfaCode.trim());
            localStorage.setItem("admin_token", res.accessToken);
            localStorage.setItem("admin_refresh", res.refreshToken);
            setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
            setTimeout(() => {
                if (onLoginSuccess) onLoginSuccess(res.admin);
            }, 700);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToCredentials = () => {
        setStep("credentials");
        setMfaCode("");
        setPendingAdminId(null);
        setPendingEmail("");
        setError("");
        setSuccess("");
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
                            <span>🐅</span>
                        </div>
                        <div>
                            <span className="admin-login__badge">Est. 1864 • Cổng Quản Trị</span>
                            <h1 className="admin-login__title">Thảo Cầm Viên Sài Gòn</h1>
                            <p className="admin-login__subtitle">
                                {step === "credentials"
                                    ? "Hệ thống Quản trị & Điều hành dữ liệu số"
                                    : "Bước 2: Xác thực đa yếu tố (MFA)"}
                            </p>
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

                    {/* ============ BƯỚC 1 ============ */}
                    {step === "credentials" && (
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
                    )}

                    {/* ============ BƯỚC 2: MFA ============ */}
                    {step === "mfa" && (
                        <form onSubmit={handleSubmitMfa} className="admin-login__form">
                            {/* Hướng dẫn kiểm tra email */}
                            <div className="admin-login__alert admin-login__alert--success">
                                <Mail size={18} className="flex-shrink-0" />
                                <span>
                                    Mã xác thực đã được gửi tới <strong>{pendingEmail}</strong>. Vui lòng kiểm tra hộp thư.
                                </span>
                            </div>

                            <div className="admin-login__field">
                                <label className="admin-login__label">Mã xác thực MFA (6 chữ số)</label>
                                <div className="admin-login__input-wrapper">
                                    <span className="admin-login__input-icon">
                                        <KeyRound size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="••••••"
                                        className="admin-login__input"
                                        maxLength={6}
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        autoFocus
                                        disabled={isLoading}
                                    />
                                </div>
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
                                        <ShieldCheck size={16} />
                                        <span>Xác thực MFA</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleBackToCredentials}
                                className="admin-login__btn-back"
                                style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                            >
                                <ArrowLeft size={14} />
                                <span>Quay lại bước 1</span>
                            </button>
                        </form>
                    )}

                    {/* Footer bảo mật */}
                    <div className="admin-login__footer">
                        <div className="admin-login__security-info">
                            <ShieldCheck size={14} />
                            <span>Bảo mật SSL 256-bit • JWT + MFA</span>
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