import React, { useState, useMemo, useEffect } from "react";
import {
    LayoutDashboard, MapPin, Headphones, BarChart3, Users, ShieldCheck,
    Search, Plus, Trash2, LogOut, Compass, Check, X, AlertCircle,
    CheckCircle2, Clock, Download, Upload, Sparkles, Play, Pause,
    Languages, FileAudio, History, Activity, TrendingUp, ArrowUpRight,
    Edit3, Globe, ExternalLink, KeyRound, UserCog, Info, Server, Zap,
    FileText, Mic, RefreshCw, Save, Lock, Unlock,
} from "lucide-react";
import { api } from "../../api/client";
import "./dashboard.css";


const LANGUAGES = [
    { code: "vi", label: "Tiếng Việt", short: "VI" },
    { code: "en", label: "English", short: "EN" },
    { code: "zh", label: "中文", short: "ZH" },
];

const CATEGORY_OPTIONS = [
    { value: "animal", label: "Động vật" },
    { value: "plant", label: "Thực vật" },
    { value: "facility", label: "Cơ sở hạ tầng" },
    { value: "service", label: "Dịch vụ" },
    { value: "entrance", label: "Cổng vào" },
];

const ROLE_OPTIONS = [
    { value: "admin", label: "Admin", cls: "role-badge--super" },
];

const OFFLINE_PACKAGE = {
    version: "v2026.09.21",
    totalMb: 148.6,
    limitMb: 150,
    publishedAt: "21-09-2026",
    downloads: { android: 1284, ios: 972, web: 305 },
};

export default function AdminDashboard({ user, onLogout, onGoToMap }) {
    /* ---- Điều hướng ---- */
    const [currentTab, setCurrentTab] = useState("overview");
    const [toast, setToast] = useState(null);

    /* ---- UC5: POI ---- */
    const [poiList, setPoiList] = useState([]);
    const [poiLoading, setPoiLoading] = useState(false);
    const [savingPoi, setSavingPoi] = useState(false);
    const [poiSearch, setPoiSearch] = useState("");
    const [poiCategory, setPoiCategory] = useState("all");
    const [editingPoi, setEditingPoi] = useState(null);
    const [poiLangTab, setPoiLangTab] = useState("vi");
    const [poiForm, setPoiForm] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);

    /* ---- UC6: Audio (nối BE) ---- */
    const [audioList, setAudioList] = useState([]);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioPoiId, setAudioPoiId] = useState(null); // ← dbId (number)
    const [aiScript, setAiScript] = useState("");
    const [aiLang, setAiLang] = useState("vi");
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewTrackId, setPreviewTrackId] = useState(null);
    const [audioSavingId, setAudioSavingId] = useState(null);

    /* ---- UC7: Analytics (nối BE) ---- */
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [range, setRange] = useState("7d");
    const [exporting, setExporting] = useState(false);

    /* ---- UC7: Admin accounts ---- */
    const [adminList, setAdminList] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdminForm, setNewAdminForm] = useState({ name: "", email: "", password: "", mfa: true });
    const [savingAdmin, setSavingAdmin] = useState(false);
    const [showEditAdminModal, setShowEditAdminModal] = useState(false);
    const [editAdminForm, setEditAdminForm] = useState(null);
    const [savingEditAdmin, setSavingEditAdmin] = useState(false);

    /* ---- UC4: Audit log (nối BE) ---- */
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);

    /* ---- Helper ---- */
    const showToast = (msg, tone = "ok") => {
        setToast({ msg, tone });
        setTimeout(() => setToast(null), 2600);
    };

    /* =========================================================
       LOAD DỮ LIỆU — 4 useEffect
       ========================================================= */

    // 1. Admins
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setAdminLoading(true);
            try {
                const data = await api.getAdmins();
                if (!cancelled) setAdminList(data);
            } catch (err) {
                if (!cancelled) showToast(err.message, "error");
            } finally {
                if (!cancelled) setAdminLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // 2. POIs + auto chọn POI đầu cho tab Audio
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setPoiLoading(true);
            try {
                const data = await api.getPois();
                if (!cancelled) {
                    setPoiList(data);
                    if (data.length > 0) {
                        setAudioPoiId((prev) => prev || data[0].dbId);
                    }
                }
            } catch (err) {
                if (!cancelled) showToast(err.message, "error");
            } finally {
                if (!cancelled) setPoiLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // 3. Analytics
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setAnalyticsLoading(true);
            try {
                const data = await api.getAnalytics();
                if (!cancelled) setAnalytics(data);
            } catch (err) {
                if (!cancelled) console.error("Analytics:", err.message);
            } finally {
                if (!cancelled) setAnalyticsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // 4. Audit logs
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setAuditLoading(true);
            try {
                const data = await api.getAuditLogs();
                if (!cancelled) setAuditLogs(data);
            } catch (err) {
                if (!cancelled) console.error("Audit:", err.message);
            } finally {
                if (!cancelled) setAuditLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // 5. Audio — reload khi audioPoiId thay đổi
    useEffect(() => {
        if (!audioPoiId) {
            setAudioList([]);
            return;
        }
        let cancelled = false;
        (async () => {
            setAudioLoading(true);
            try {
                const data = await api.getAudio(audioPoiId);
                if (!cancelled) setAudioList(data);
            } catch (err) {
                if (!cancelled) showToast(err.message, "error");
            } finally {
                if (!cancelled) setAudioLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [audioPoiId]);

    /* =========================================================
       UC7 — ADMIN
       ========================================================= */
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        if (!newAdminForm.name.trim()) return showToast("Vui lòng nhập họ tên", "error");
        if (!newAdminForm.email.trim()) return showToast("Vui lòng nhập email", "error");
        if (newAdminForm.password.length < 6) return showToast("Mật khẩu tối thiểu 6 ký tự", "error");

        setSavingAdmin(true);
        try {
            const created = await api.createAdmin(newAdminForm);
            setAdminList((prev) => [...prev, created]);
            setShowAddAdminModal(false);
            setNewAdminForm({ name: "", email: "", password: "", mfa: true });
            showToast("Đã tạo tài khoản mới");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSavingAdmin(false);
        }
    };

    const handleOpenEditAdmin = (a) => {
        setEditAdminForm({
            dbId: a.dbId, id: a.id, name: a.name,
            email: a.email, mfa: a.mfa, status: a.status,
        });
        setShowEditAdminModal(true);
    };

    const handleSaveEditAdmin = async (e) => {
        e.preventDefault();
        if (!editAdminForm.name.trim()) return showToast("Vui lòng nhập họ tên", "error");
        if (!editAdminForm.email.trim()) return showToast("Vui lòng nhập email", "error");

        setSavingEditAdmin(true);
        try {
            const updated = await api.updateAdmin(editAdminForm.dbId, {
                name: editAdminForm.name,
                email: editAdminForm.email,
                mfa: editAdminForm.mfa,
                status: editAdminForm.status,
            });
            setAdminList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            setShowEditAdminModal(false);
            setEditAdminForm(null);
            showToast("Đã cập nhật tài khoản");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSavingEditAdmin(false);
        }
    };

    const handleDeactivateAdmin = async (a) => {
        if (!window.confirm(`Vô hiệu hoá tài khoản ${a.email}?`)) return;
        try {
            await api.deactivateAdmin(a.dbId);
            setAdminList((prev) =>
                prev.map((x) => (x.id === a.id ? { ...x, status: "deactivated" } : x))
            );
            showToast("Đã vô hiệu hoá tài khoản");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    /* =========================================================
       UC5 — POI
       ========================================================= */
    const startCreatePoi = () => {
        const maxNum = poiList.reduce((max, p) => {
            const num = parseInt(p.id?.replace("POI-", "") || "0", 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        const nextId = `POI-${String(maxNum + 1).padStart(3, "0")}`;

        setPoiForm({
            id: nextId, name: "", category: "animal", zone: "",
            latitude: "10.787500", longitude: "106.705000",
            geofenceRadius: 20, isActive: true,
            translations: { vi: "", en: "", zh: "" },
        });
        setEditingPoi("new");
        setPoiLangTab("vi");
    };

    const startEditPoi = (poi) => {
        setPoiForm({ ...JSON.parse(JSON.stringify(poi)), dbId: poi.dbId });
        setEditingPoi(poi.id);
        setPoiLangTab("vi");
    };

    const validatePoiForm = (f) => {
        if (!f.name.trim()) return "Thiếu tên POI";
        if (!f.zone.trim()) return "Thiếu phân khu";
        if (!f.translations.vi.trim()) return "Thiếu mô tả tiếng Việt";
        if (f.geofenceRadius < 5 || f.geofenceRadius > 200) return "Bán kính geofence phải trong khoảng 5–200m";
        return null;
    };

    const savePoi = async () => {
        const err = validatePoiForm(poiForm);
        if (err) return showToast(err, "error");

        setSavingPoi(true);
        try {
            if (editingPoi === "new") {
                await api.createPoi(poiForm);
                showToast("Đã tạo POI mới");
            } else {
                await api.updatePoi(poiForm.dbId, poiForm);
                showToast("Đã cập nhật POI");
            }
            const list = await api.getPois();
            setPoiList(list);
            setEditingPoi(null);
            setPoiForm(null);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSavingPoi(false);
        }
    };

    const deletePoi = async (poi) => {
        if (!window.confirm(`Xoá POI "${poi.name}"? Audio liên quan cũng sẽ bị gỡ.`)) return;
        try {
            await api.deletePoi(poi.dbId);
            const list = await api.getPois();
            setPoiList(list);
            // Nếu đang chọn POI bị xoá → chuyển sang POI đầu tiên
            if (audioPoiId === poi.dbId) {
                setAudioPoiId(list[0]?.dbId || null);
            }
            showToast("Đã xoá POI");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleAiTranslate = () => {
        const src = poiForm.translations.vi.trim();
        if (!src) return showToast("Cần nhập mô tả tiếng Việt trước khi dịch", "error");
        setIsTranslating(true);
        setTimeout(() => {
            setPoiForm((f) => ({
                ...f,
                translations: {
                    ...f.translations,
                    en: f.translations.en || `[AI draft EN] ${src}`,
                    zh: f.translations.zh || `[AI 草稿 ZH] ${src}`,
                },
            }));
            setIsTranslating(false);
            showToast("AI đã sinh bản nháp EN/ZH — vui lòng rà soát lại");
        }, 900);
    };

    /* =========================================================
       UC6 — AUDIO (nối BE)
       ========================================================= */
    const reloadAudio = async () => {
        if (!audioPoiId) return;
        const data = await api.getAudio(audioPoiId);
        setAudioList(data);
    };

    const uploadAudio = async (lang) => {
        if (!audioPoiId) return showToast("Chọn POI trước", "error");
        const dur = 60 + Math.floor(Math.random() * 60);
        try {
            await api.createAudio({
                poiDbId: audioPoiId,
                language: lang,
                source: "upload",
                duration: dur,
                sizeMb: +(dur * 0.015).toFixed(2),
            });
            await reloadAudio();
            showToast(`Đã tải audio ${lang.toUpperCase()} (chờ publish)`);
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const generateAiAudio = async () => {
        if (!aiScript.trim()) return showToast("Nhập kịch bản trước khi sinh audio AI", "error");
        if (!audioPoiId) return showToast("Chọn POI trước", "error");

        setIsGenerating(true);
        try {
            const dur = 45 + Math.floor(aiScript.length / 6);
            await api.createAudio({
                poiDbId: audioPoiId,
                language: aiLang,
                source: "ai",
                duration: dur,
                sizeMb: +(dur * 0.015).toFixed(2),
            });
            await reloadAudio();
            setAiScript("");
            showToast(`AI TTS đã sinh audio ${aiLang.toUpperCase()} — chờ publish`);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const publishTrack = async (track) => {
        setAudioSavingId(track.dbId);
        try {
            await api.publishAudio(track.dbId);
            await reloadAudio();
            showToast("Đã publish — audio vào gói offline");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setAudioSavingId(null);
        }
    };

    const removeTrack = async (track) => {
        if (!window.confirm(`Gỡ audio ${track.language.toUpperCase()}?`)) return;
        try {
            await api.deleteAudio(track.dbId);
            await reloadAudio();
            showToast("Đã gỡ audio track");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    /* =========================================================
       UC7 — EXPORT (fake)
       ========================================================= */
    const handleExport = (fmt) => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            showToast(`Đã xuất báo cáo ${fmt} (UC7)`);
        }, 700);
    };

    /* =========================================================
       DERIVED
       ========================================================= */
    const filteredPois = useMemo(() => {
        return poiList.filter((p) => {
            const okCat = poiCategory === "all" || p.category === poiCategory;
            const kw = poiSearch.trim().toLowerCase();
            const okKw =
                !kw ||
                p.name.toLowerCase().includes(kw) ||
                p.id.toLowerCase().includes(kw) ||
                (p.zone || "").toLowerCase().includes(kw);
            return okCat && okKw;
        });
    }, [poiList, poiSearch, poiCategory]);

    const audioByPoi = audioList;

    const currentAudioPoi = useMemo(
        () => poiList.find((p) => p.dbId === audioPoiId),
        [poiList, audioPoiId]
    );

    /* =========================================================
       RENDER
       ========================================================= */
    return (
        <div className="admin-dash">
            <div className="admin-dash__glow admin-dash__glow--1" />
            <div className="admin-dash__glow admin-dash__glow--2" />

            {/* ============ HEADER ============ */}
            <header className="admin-dash__header">
                <div className="admin-dash__brand">
                    <div className="admin-dash__logo"><span>🐅</span></div>
                    <div>
                        <div className="admin-dash__brand-title">
                            Thảo Cầm Viên Sài Gòn
                            <span className="admin-dash__brand-badge">CMS • Audio Guide</span>
                        </div>
                        <p className="admin-dash__brand-sub">
                            Hệ thống Thuyết minh Tự động Đa ngôn ngữ — Cổng Quản trị
                        </p>
                    </div>
                </div>

                <div className="admin-dash__actions">
                    <button onClick={onGoToMap} className="admin-dash__btn-map" title="Mở giao diện bản đồ du khách">
                        <Compass size={15} />
                        <span>Xem Bản Đồ Khách</span>
                        <ExternalLink size={12} className="opacity-70" />
                    </button>
                    <div className="admin-dash__divider" />
                    <div className="admin-dash__user">
                        <div className="admin-dash__avatar"><ShieldCheck size={18} /></div>
                        <div className="admin-dash__user-info">
                            <div className="admin-dash__user-name">{user?.name || "Admin"}</div>
                            <div className="admin-dash__user-role">{user?.role || "Admin"}</div>
                        </div>
                    </div>
                    <button onClick={onLogout} className="admin-dash__btn-logout" title="Đăng xuất">
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </header>

            {/* ============ BODY ============ */}
            <div className="admin-dash__body">
                {/* ---------- SIDEBAR ---------- */}
                <aside className="admin-dash__sidebar">
                    <div className="admin-nav-group">
                        <div className="admin-nav-title">QUẢN TRỊ NỘI DUNG</div>

                        <button onClick={() => setCurrentTab("overview")}
                            className={`admin-nav-item ${currentTab === "overview" ? "is-active" : ""}`}>
                            <LayoutDashboard size={18} /><span>Tổng quan</span>
                        </button>

                        <button onClick={() => setCurrentTab("poi")}
                            className={`admin-nav-item ${currentTab === "poi" ? "is-active" : ""}`}>
                            <MapPin size={18} /><span>POI &amp; Hạ tầng</span>
                            <span className="admin-nav-badge">{poiList.length}</span>
                        </button>

                        <button onClick={() => setCurrentTab("audio")}
                            className={`admin-nav-item ${currentTab === "audio" ? "is-active" : ""}`}>
                            <Headphones size={18} /><span>Audio &amp; AI Content</span>
                            <span className="admin-nav-badge">{audioList.length}</span>
                        </button>
                    </div>

                    <div className="admin-nav-group" style={{ marginTop: 24 }}>
                        <div className="admin-nav-title">GIÁM SÁT &amp; HỆ THỐNG</div>

                        <button onClick={() => setCurrentTab("analytics")}
                            className={`admin-nav-item ${currentTab === "analytics" ? "is-active" : ""}`}>
                            <BarChart3 size={18} /><span>Phân tích &amp; Thống kê</span>
                        </button>

                        <button onClick={() => setCurrentTab("accounts")}
                            className={`admin-nav-item ${currentTab === "accounts" ? "is-active" : ""}`}>
                            <Users size={18} /><span>Tài khoản Admin</span>
                            <span className="admin-nav-badge">{adminList.length}</span>
                        </button>

                        <button onClick={() => setCurrentTab("audit")}
                            className={`admin-nav-item ${currentTab === "audit" ? "is-active" : ""}`}>
                            <History size={18} /><span>Audit Log</span>
                        </button>

                        <div className="admin-dash__system-card">
                            <div className="admin-dash__system-head">
                                <span className="admin-dash__ping" />
                                <span>Hạ tầng API &amp; Bản đồ</span>
                            </div>
                            <div className="admin-dash__system-desc">
                                Geofence + Audio trigger đang chạy ổn định (99.8%).
                                Gói offline publish lúc 06:00 hôm nay.
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ---------- CONTENT ---------- */}
                <main className="admin-dash__content custom-scrollbar">

                    {/* ================= TAB: OVERVIEW ================= */}
                    {currentTab === "overview" && (
                        <div className="admin-tab-view animate-fade">
                            <div className="admin-tab-head">
                                <div>
                                    <h1 className="admin-tab-title">Tổng Quan Hệ Thống Audio Guide</h1>
                                    <p className="admin-tab-desc">
                                        Cập nhật {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {new Date().toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                <span className="admin-live-tag">
                                    <span className="admin-live-dot" /> Dữ liệu thời gian thực
                                </span>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card__head">
                                        <div className="stat-card__icon stat-card__icon--blue"><Activity size={20} /></div>
                                        <span className="stat-card__trend stat-card__trend--up">
                                            <ArrowUpRight size={13} /> Live
                                        </span>
                                    </div>
                                    <div className="stat-card__value">
                                        {analytics ? analytics.totalPlays.toLocaleString() : "—"}
                                    </div>
                                    <div className="stat-card__label">Lượt nghe audio (tổng)</div>
                                    <div className="stat-card__foot">
                                        Tỉ lệ hoàn thành ≥80%: {analytics ? `${analytics.completedRate}%` : "—"}
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card__head">
                                        <div className="stat-card__icon stat-card__icon--emerald"><MapPin size={20} /></div>
                                        <span className="stat-card__badge-sub">{poiList.length} POI</span>
                                    </div>
                                    <div className="stat-card__value">
                                        {poiList.filter((p) => p.isActive).length}
                                    </div>
                                    <div className="stat-card__label">POI đang hoạt động</div>
                                    <div className="stat-card__foot">
                                        {poiList.filter((p) => LANGUAGES.every((l) => p.translations?.[l.code])).length} POI đủ 3 ngôn ngữ
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card__head">
                                        <div className="stat-card__icon stat-card__icon--amber"><Headphones size={20} /></div>
                                        <span className="stat-card__badge-sub">VI/EN/ZH</span>
                                    </div>
                                    <div className="stat-card__value">
                                        {analytics ? analytics.totalAudioPublished : "—"}
                                    </div>
                                    <div className="stat-card__label">Audio track đã publish</div>
                                    <div className="stat-card__foot">
                                        Tổng số {analytics?.totalAdmins ?? "—"} quản trị viên
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card__head">
                                        <div className="stat-card__icon stat-card__icon--green"><Download size={20} /></div>
                                        <span className="stat-card__badge-sub">{OFFLINE_PACKAGE.version}</span>
                                    </div>
                                    <div className="stat-card__value">
                                        {(OFFLINE_PACKAGE.downloads.android + OFFLINE_PACKAGE.downloads.ios + OFFLINE_PACKAGE.downloads.web).toLocaleString()}
                                    </div>
                                    <div className="stat-card__label">Lượt tải gói offline</div>
                                    <div className="stat-card__foot">Android • iOS • Web</div>
                                </div>
                            </div>

                            <div className="dash-grid-2">
                                <div className="dash-card">
                                    <div className="dash-card__head">
                                        <div>
                                            <h3 className="dash-card__title"><Languages size={17} className="text-emerald" /> Phân bổ ngôn ngữ sử dụng</h3>
                                            <p className="dash-card__desc">Dựa trên USAGE_LOG — language_code</p>
                                        </div>
                                    </div>
                                    <div className="dash-card__body">
                                        {(() => {
                                            const d = analytics?.languageDist || { vi: 0, en: 0, zh: 0 };
                                            return (
                                                <>
                                                    <div className="lang-dist__bar">
                                                        <div className="lang-dist__seg lang-dist__seg--vi" style={{ "--w": `${d.vi}%` }} />
                                                        <div className="lang-dist__seg lang-dist__seg--en" style={{ "--w": `${d.en}%` }} />
                                                        <div className="lang-dist__seg lang-dist__seg--zh" style={{ "--w": `${d.zh}%` }} />
                                                    </div>
                                                    <div className="lang-dist__legend">
                                                        <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-vi)" }} /><span className="lang-dist__name">Tiếng Việt (VI)</span><span className="lang-dist__val">{d.vi}%</span></div>
                                                        <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-en)" }} /><span className="lang-dist__name">English (EN)</span><span className="lang-dist__val">{d.en}%</span></div>
                                                        <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-zh)" }} /><span className="lang-dist__name">中文 (ZH)</span><span className="lang-dist__val">{d.zh}%</span></div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="dash-card">
                                    <div className="dash-card__head">
                                        <div>
                                            <h3 className="dash-card__title"><Activity size={17} className="text-amber" /> Top POI được nghe nhiều nhất</h3>
                                            <p className="dash-card__desc">Lượt auto-play + manual play</p>
                                        </div>
                                    </div>
                                    <div className="zones-rank-list">
                                        {(analytics?.topPois?.length > 0 ? analytics.topPois : [
                                            { name: "Chưa có dữ liệu", plays: 0 },
                                        ]).map((z, i) => {
                                            const maxPlays = analytics?.topPois?.[0]?.plays || 1;
                                            const pct = Math.max(5, Math.round((z.plays / maxPlays) * 100));
                                            const colors = ["#10b981", "#34d399", "#60a5fa", "#f59e0b", "#a78bfa"];
                                            return (
                                                <div key={i} className="zone-rank-item">
                                                    <div className="zone-rank-item__row">
                                                        <span className="zone-rank-name"><strong>#{i + 1}</strong> {z.name}</span>
                                                        <span className="zone-rank-views">{z.plays} lượt</span>
                                                    </div>
                                                    <div className="zone-rank-bar">
                                                        <div className="zone-rank-bar__fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="dash-card" style={{ marginTop: 16 }}>
                                <div className="dash-card__head">
                                    <div>
                                        <h3 className="dash-card__title"><Server size={17} className="text-emerald" /> Gói Offline đang phát hành</h3>
                                        <p className="dash-card__desc">Ngưỡng PRD: ≤ 150 MB</p>
                                    </div>
                                    <button onClick={() => setCurrentTab("analytics")} className="dash-card__link">
                                        Xem chi tiết &rarr;
                                    </button>
                                </div>
                                <div className="package-card">
                                    <div className="package-card__row">
                                        <span>Phiên bản: <strong>{OFFLINE_PACKAGE.version}</strong></span>
                                        <span>Phát hành: {OFFLINE_PACKAGE.publishedAt}</span>
                                    </div>
                                    <div>
                                        <div className="package-card__row">
                                            <span>Dung lượng hiện tại</span>
                                            <span className="package-card__size">{OFFLINE_PACKAGE.totalMb} / {OFFLINE_PACKAGE.limitMb} MB</span>
                                        </div>
                                        <div className={`meter ${OFFLINE_PACKAGE.totalMb / OFFLINE_PACKAGE.limitMb > 0.95 ? "is-danger" : ""}`}>
                                            <div className="meter__fill" style={{ "--pct": `${(OFFLINE_PACKAGE.totalMb / OFFLINE_PACKAGE.limitMb) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB: POI (UC5) ================= */}
                    {currentTab === "poi" && (
                        <div className="admin-tab-view animate-fade">
                            <div className="admin-tab-head">
                                <div>
                                    <h1 className="admin-tab-title">Quản Lý POI &amp; Hạ Tầng</h1>
                                    <p className="admin-tab-desc">
                                        UC5 — Tạo, cập nhật POI với toạ độ GPS, bán kính geofence và mô tả đa ngôn ngữ (VI/EN/ZH)
                                    </p>
                                </div>
                                <div className="admin-tab-actions">
                                    <button onClick={startCreatePoi} className="btn-primary-admin">
                                        <Plus size={16} /><span>Thêm POI mới</span>
                                    </button>
                                </div>
                            </div>

                            <div className="admin-filter-bar">
                                <div className="admin-search-box">
                                    <Search size={16} className="text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên POI, mã, phân khu..."
                                        value={poiSearch}
                                        onChange={(e) => setPoiSearch(e.target.value)}
                                    />
                                    {poiSearch && (
                                        <button className="clear-btn" onClick={() => setPoiSearch("")}><X size={14} /></button>
                                    )}
                                </div>
                                <div className="admin-filter-tabs">
                                    <button className={`filter-btn ${poiCategory === "all" ? "is-active" : ""}`}
                                        onClick={() => setPoiCategory("all")}>Tất cả ({poiList.length})</button>
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <button key={c.value}
                                            className={`filter-btn ${poiCategory === c.value ? "is-active" : ""}`}
                                            onClick={() => setPoiCategory(c.value)}>
                                            {c.label} ({poiList.filter((p) => p.category === c.value).length})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="dash-card">
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Mã POI</th>
                                                <th>Tên / Phân khu</th>
                                                <th>Loại</th>
                                                <th>GPS</th>
                                                <th>Geofence</th>
                                                <th>Đa ngôn ngữ</th>
                                                <th>Trạng thái</th>
                                                <th style={{ textAlign: "right" }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {poiLoading && (
                                                <tr>
                                                    <td colSpan={8} style={{ textAlign: "center", padding: 30, color: "var(--dash-text-3)" }}>
                                                        Đang tải danh sách POI...
                                                    </td>
                                                </tr>
                                            )}
                                            {!poiLoading && filteredPois.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} style={{ textAlign: "center", padding: 30, color: "var(--dash-text-3)" }}>
                                                        Chưa có POI nào
                                                    </td>
                                                </tr>
                                            )}
                                            {!poiLoading && filteredPois.map((p) => {
                                                const tr = p.translations || { vi: "", en: "", zh: "" };
                                                const doneLangs = LANGUAGES.filter((l) => tr[l.code]);
                                                return (
                                                    <tr key={p.id}>
                                                        <td><span className="code-badge">{p.id}</span></td>
                                                        <td>
                                                            <div className="table-item-title">
                                                                <span>{p.category === "plant" ? "🌳" : p.category === "facility" ? "🏛️" : "🐾"}</span>
                                                                <div>
                                                                    <div className="font-semibold text-slate-100">{p.name}</div>
                                                                    <div className="text-xs text-slate-400">{p.zone}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="category-pill">
                                                                {CATEGORY_OPTIONS.find((c) => c.value === p.category)?.label || p.category}
                                                            </span>
                                                        </td>
                                                        <td><code>{p.latitude}, {p.longitude}</code></td>
                                                        <td><code>{p.geofenceRadius} m</code></td>
                                                        <td>
                                                            <div style={{ display: "flex", gap: 4 }}>
                                                                {LANGUAGES.map((l) => {
                                                                    const done = !!tr[l.code];
                                                                    return (
                                                                        <span key={l.code}
                                                                            className={`lang-tab__dot ${done ? "is-complete" : ""}`}
                                                                            data-lang={l.code}
                                                                            title={`${l.label}: ${done ? "Đã có" : "Thiếu"}`}
                                                                            style={{
                                                                                display: "inline-block",
                                                                                borderColor: done ? "var(--lang-vi)" : "#ef4444",
                                                                                background: done
                                                                                    ? l.code === "vi" ? "var(--lang-vi)"
                                                                                        : l.code === "en" ? "var(--lang-en)"
                                                                                            : "var(--lang-zh)"
                                                                                    : "transparent",
                                                                            }}
                                                                        />
                                                                    );
                                                                })}
                                                                <span style={{ fontSize: 11, color: "var(--dash-text-3)", marginLeft: 4 }}>
                                                                    {doneLangs.length}/3
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {p.isActive
                                                                ? <span className="status-badge status-badge--healthy"><CheckCircle2 size={12} /> Hoạt động</span>
                                                                : <span className="status-badge status-badge--treatment"><AlertCircle size={12} /> Bảo trì</span>}
                                                        </td>
                                                        <td style={{ textAlign: "right" }}>
                                                            <div className="table-actions">
                                                                <button className="btn-action-edit" title="Sửa" onClick={() => startEditPoi(p)}>
                                                                    <Edit3 size={15} />
                                                                </button>
                                                                <button className="btn-action-delete" title="Xoá" onClick={() => deletePoi(p)}>
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB: AUDIO (UC6) ================= */}
                    {currentTab === "audio" && (
                        <div className="admin-tab-view animate-fade">
                            <div className="admin-tab-head">
                                <div>
                                    <h1 className="admin-tab-title">Quản Lý Audio &amp; Nội dung AI</h1>
                                    <p className="admin-tab-desc">
                                        UC6 — Upload file ghi âm hoặc sinh audio bằng AI Text-to-Speech, rà soát rồi publish cho VI/EN/ZH
                                    </p>
                                </div>
                                <div className="admin-tab-actions">
                                    <select
                                        value={audioPoiId || ""}
                                        onChange={(e) => setAudioPoiId(+e.target.value || null)}
                                        style={{
                                            height: 40, padding: "0 12px", borderRadius: 8,
                                            border: "1px solid var(--dash-border)",
                                            background: "#fff", fontSize: 13, fontWeight: 600,
                                            color: "var(--dash-text-1)",
                                        }}
                                    >
                                        <option value="">-- Chọn POI --</option>
                                        {poiList.map((p) => (
                                            <option key={p.id} value={p.dbId}>{p.id} — {p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {currentAudioPoi && (
                                <div className="admin-banner admin-banner--ok" style={{ marginBottom: 16 }}>
                                    <Info size={16} />
                                    <div>
                                        <strong>{currentAudioPoi.name}</strong> — {currentAudioPoi.zone} • Geofence{" "}
                                        {currentAudioPoi.geofenceRadius}m • {LANGUAGES.filter((l) => currentAudioPoi.translations?.[l.code]).length}/3 ngôn ngữ đã có mô tả
                                    </div>
                                </div>
                            )}

                            {!currentAudioPoi && (
                                <div className="admin-banner admin-banner--warn" style={{ marginBottom: 16 }}>
                                    <Info size={16} />
                                    <div>Chưa có POI nào. Vui lòng tạo POI trước ở tab <strong>POI &amp; Hạ tầng</strong>.</div>
                                </div>
                            )}

                            {audioLoading && (
                                <div className="admin-banner admin-banner--ok" style={{ marginBottom: 16 }}>
                                    <Clock size={16} /> Đang tải danh sách audio...
                                </div>
                            )}

                            <div className="audio-grid">
                                {LANGUAGES.map((lang) => {
                                    const track = audioByPoi.find((a) => a.language === lang.code);
                                    const isEmpty = !track;
                                    return (
                                        <div
                                            key={lang.code}
                                            className={`audio-track ${isEmpty ? "is-empty" : ""}`}
                                            data-lang={lang.code}
                                        >
                                            <div className="audio-track__head">
                                                <div className="audio-track__lang">
                                                    <Globe size={16} />
                                                    <span>{lang.label}</span>
                                                </div>
                                                <span className="audio-track__code">{lang.short}</span>
                                            </div>

                                            {isEmpty ? (
                                                <>
                                                    <div className="text-xs text-slate-400" style={{ marginBottom: 4 }}>
                                                        Chưa có audio cho ngôn ngữ này.
                                                    </div>
                                                    <div className="audio-track__actions">
                                                        <button className="btn-secondary-admin" onClick={() => uploadAudio(lang.code)} disabled={!audioPoiId}>
                                                            <Upload size={14} /> Upload file
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="audio-track__meta">
                                                        <span><Clock size={12} /> {track.duration}s</span>
                                                        <span><FileAudio size={12} /> {track.sizeMb} MB</span>
                                                        <span><Mic size={12} /> {track.source === "ai" ? "AI TTS" : "Upload"}</span>
                                                    </div>
                                                    <div>
                                                        {track.status === "published"
                                                            ? <span className="status-badge status-badge--published"><CheckCircle2 size={12} /> Đã publish</span>
                                                            : <span className="status-badge status-badge--draft"><Clock size={12} /> Bản nháp</span>}
                                                    </div>
                                                    <div className="audio-track__source">
                                                        {track.publishedAt
                                                            ? `Publish: ${new Date(track.publishedAt).toLocaleDateString("vi-VN")}`
                                                            : "Chưa publish — chưa vào gói offline"}
                                                    </div>

                                                    <div className="audio-player">
                                                        <button
                                                            className="audio-player__btn"
                                                            onClick={() => setPreviewTrackId(previewTrackId === track.id ? null : track.id)}
                                                            title="Nghe thử"
                                                        >
                                                            {previewTrackId === track.id ? <Pause size={16} /> : <Play size={16} />}
                                                        </button>
                                                        <div className="audio-player__bar">
                                                            <div className="audio-player__fill" style={{ "--progress": previewTrackId === track.id ? "35%" : "0%" }} />
                                                        </div>
                                                        <span className="audio-player__time">0:{String(track.duration).padStart(2, "0")}</span>
                                                    </div>

                                                    <div className="audio-track__actions">
                                                        {track.status !== "published" && (
                                                            <button className="btn-primary-admin"
                                                                onClick={() => publishTrack(track)}
                                                                disabled={audioSavingId === track.dbId}>
                                                                {audioSavingId === track.dbId ? (
                                                                    <><span className="btn-spinner" /> Đang lưu...</>
                                                                ) : (
                                                                    <><Check size={14} /> Publish</>
                                                                )}
                                                            </button>
                                                        )}
                                                        <button className="btn-secondary-admin" onClick={() => uploadAudio(lang.code)} disabled={!audioPoiId}>
                                                            <RefreshCw size={14} /> Thay thế
                                                        </button>
                                                        <button className="btn-action-delete" onClick={() => removeTrack(track)} title="Gỡ">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="dash-card" style={{ marginTop: 20 }}>
                                <div className="dash-card__head">
                                    <div>
                                        <h3 className="dash-card__title"><Sparkles size={17} className="text-amber" /> Sinh audio bằng AI Text-to-Speech</h3>
                                        <p className="dash-card__desc">Áp dụng cho POI: <strong>{currentAudioPoi?.name || "—"}</strong></p>
                                    </div>
                                    <select
                                        value={aiLang}
                                        onChange={(e) => setAiLang(e.target.value)}
                                        style={{
                                            height: 34, padding: "0 10px", borderRadius: 8,
                                            border: "1px solid var(--dash-border)", background: "#fff",
                                            fontSize: 12.5, fontWeight: 600,
                                        }}
                                    >
                                        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div className="dash-card__body">
                                    <div className="ai-note" style={{ marginBottom: 12 }}>
                                        <Sparkles size={14} />
                                        <div>
                                            Nhập kịch bản thuyết minh — AI sẽ sinh audio với giọng đọc chuẩn ngôn ngữ đã chọn. Bản audio sau khi sinh sẽ ở trạng thái <strong>Bản nháp</strong>, cần rà soát trước khi publish.
                                        </div>
                                    </div>
                                    <div className="script-box">
                                        <textarea
                                            rows={5}
                                            placeholder="Ví dụ: Chào mừng bạn đến với khu Voi Châu Á của Thảo Cầm Viên Sài Gòn. Đây là nơi sinh sống của..."
                                            value={aiScript}
                                            onChange={(e) => setAiScript(e.target.value)}
                                            style={{
                                                width: "100%", padding: 12, borderRadius: 10,
                                                border: "1px solid var(--dash-border)",
                                                fontFamily: "inherit", fontSize: 13, resize: "vertical",
                                            }}
                                        />
                                        <span className="script-box__count">{aiScript.length} ký tự</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                        <button className="btn-ai" onClick={generateAiAudio} disabled={isGenerating || !currentAudioPoi}>
                                            {isGenerating ? <><span className="btn-spinner" /> Đang sinh...</> : <><Sparkles size={14} /> Sinh audio bằng AI</>}
                                        </button>
                                        <button className="btn-secondary-admin" onClick={() => setAiScript("")} disabled={isGenerating}>
                                            Xoá kịch bản
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB: ANALYTICS (UC7) ================= */}
                    {currentTab === "analytics" && (
                        <div className="admin-tab-view animate-fade">
                            <div className="admin-tab-head">
                                <div>
                                    <h1 className="admin-tab-title">Phân Tích &amp; Thống Kê</h1>
                                    <p className="admin-tab-desc">UC7 — Theo dõi lượt dùng, phân bổ ngôn ngữ, mức độ phổ biến POI và tải gói offline</p>
                                </div>
                                <div className="admin-tab-actions">
                                    <div className="admin-filter-tabs">
                                        {["1d", "7d", "30d", "custom"].map((r) => (
                                            <button key={r}
                                                className={`filter-btn ${range === r ? "is-active" : ""}`}
                                                onClick={() => setRange(r)}>
                                                {r === "1d" ? "Hôm nay" : r === "7d" ? "7 ngày" : r === "30d" ? "30 ngày" : "Tuỳ chọn"}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="btn-export" onClick={() => handleExport("PDF")} disabled={exporting}>
                                        <FileText size={14} /> PDF
                                    </button>
                                    <button className="btn-export" onClick={() => handleExport("Excel")} disabled={exporting}>
                                        <Download size={14} /> Excel
                                    </button>
                                </div>
                            </div>

                            {analyticsLoading && (
                                <div className="admin-banner admin-banner--ok" style={{ marginBottom: 16 }}>
                                    <Clock size={16} /> Đang tải dữ liệu phân tích...
                                </div>
                            )}

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card__icon stat-card__icon--blue"><TrendingUp size={20} /></div>
                                    <div className="stat-card__value" style={{ marginTop: 10 }}>
                                        {analytics?.totalPlays?.toLocaleString() ?? "—"}
                                    </div>
                                    <div className="stat-card__label">Tổng lượt nghe audio</div>
                                    <div className="stat-card__foot">Từ toàn bộ USAGE_LOG</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card__icon stat-card__icon--emerald"><Activity size={20} /></div>
                                    <div className="stat-card__value" style={{ marginTop: 10 }}>
                                        {analytics ? `${analytics.completedRate}%` : "—"}
                                    </div>
                                    <div className="stat-card__label">Tỉ lệ nghe hoàn thành ≥80%</div>
                                    <div className="stat-card__foot">Theo dõi qua cột completed</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card__icon stat-card__icon--amber"><Download size={20} /></div>
                                    <div className="stat-card__value" style={{ marginTop: 10 }}>
                                        {(OFFLINE_PACKAGE.downloads.android + OFFLINE_PACKAGE.downloads.ios + OFFLINE_PACKAGE.downloads.web).toLocaleString()}
                                    </div>
                                    <div className="stat-card__label">Lượt tải offline package</div>
                                    <div className="stat-card__foot">Android • iOS • Web</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card__icon stat-card__icon--purple"><Server size={20} /></div>
                                    <div className="stat-card__value" style={{ marginTop: 10 }}>
                                        {analytics?.totalAudioPublished ?? "—"}
                                    </div>
                                    <div className="stat-card__label">Audio đã publish</div>
                                    <div className="stat-card__foot">
                                        Trên tổng {analytics?.totalPois ?? "—"} POI
                                    </div>
                                </div>
                            </div>

                            <div className="dash-grid-2">
                                <div className="dash-card">
                                    <div className="dash-card__head">
                                        <h3 className="dash-card__title"><Languages size={17} className="text-emerald" /> Phân bổ ngôn ngữ</h3>
                                    </div>
                                    <div className="dash-card__body">
                                        {(() => {
                                            const d = analytics?.languageDist || { vi: 0, en: 0, zh: 0 };
                                            return (
                                                <>
                                                    <div className="lang-dist__bar">
                                                        <div className="lang-dist__seg lang-dist__seg--vi" style={{ "--w": `${d.vi}%` }} />
                                                        <div className="lang-dist__seg lang-dist__seg--en" style={{ "--w": `${d.en}%` }} />
                                                        <div className="lang-dist__seg lang-dist__seg--zh" style={{ "--w": `${d.zh}%` }} />
                                                    </div>
                                                    <div className="lang-dist__legend">
                                                        <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-vi)" }} /><span className="lang-dist__name">Tiếng Việt</span><span className="lang-dist__val">{d.vi}%</span></div>
                                                        <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-en)" }} /><span className="lang-dist__name">English</span><span className="lang-dist__val">{d.en}%</span></div>
                                                        <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-zh)" }} /><span className="lang-dist__name">中文</span><span className="lang-dist__val">{d.zh}%</span></div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="dash-card">
                                    <div className="dash-card__head">
                                        <h3 className="dash-card__title"><Server size={17} className="text-emerald" /> Gói Offline</h3>
                                    </div>
                                    <div className="package-card">
                                        <div className="package-card__row">
                                            <span>Phiên bản</span>
                                            <strong>{OFFLINE_PACKAGE.version}</strong>
                                        </div>
                                        <div>
                                            <div className="package-card__row">
                                                <span>Dung lượng</span>
                                                <span className="package-card__size">{OFFLINE_PACKAGE.totalMb} / {OFFLINE_PACKAGE.limitMb} MB</span>
                                            </div>
                                            <div className={`meter ${OFFLINE_PACKAGE.totalMb / OFFLINE_PACKAGE.limitMb > 0.95 ? "is-danger" : "is-warning"}`}>
                                                <div className="meter__fill" style={{ "--pct": `${(OFFLINE_PACKAGE.totalMb / OFFLINE_PACKAGE.limitMb) * 100}%` }} />
                                            </div>
                                        </div>
                                        <div className="package-card__row">
                                            <span>Android</span><strong>{OFFLINE_PACKAGE.downloads.android.toLocaleString()}</strong>
                                        </div>
                                        <div className="package-card__row">
                                            <span>iOS</span><strong>{OFFLINE_PACKAGE.downloads.ios.toLocaleString()}</strong>
                                        </div>
                                        <div className="package-card__row">
                                            <span>Web (browser)</span><strong>{OFFLINE_PACKAGE.downloads.web.toLocaleString()}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="dash-card" style={{ marginTop: 16 }}>
                                <div className="dash-card__head">
                                    <h3 className="dash-card__title"><MapPin size={17} className="text-emerald" /> Top 5 POI phổ biến nhất</h3>
                                    <p className="dash-card__desc">Xếp hạng theo lượt play audio từ USAGE_LOG</p>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>POI</th>
                                                <th>Lượt nghe</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics?.topPois?.length > 0 ? analytics.topPois.map((row, i) => (
                                                <tr key={i}>
                                                    <td><strong>#{i + 1}</strong></td>
                                                    <td>{row.name}</td>
                                                    <td><span className="price-badge">{row.plays}</span></td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={3} style={{ textAlign: "center", padding: 20, color: "var(--dash-text-3)" }}>
                                                        Chưa có dữ liệu
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB: ADMIN ACCOUNTS (UC7) ================= */}
                    {currentTab === "accounts" && (
                        <div className="admin-tab-view animate-fade">
                            <div className="admin-tab-head">
                                <div>
                                    <h1 className="admin-tab-title">Tài Khoản Admin &amp; Phân Quyền</h1>
                                    <p className="admin-tab-desc">UC7 — Thêm, sửa, vô hiệu hoá tài khoản; gán quyền và MFA</p>
                                </div>
                                <div className="admin-tab-actions">
                                    <button className="btn-primary-admin" onClick={() => setShowAddAdminModal(true)}>
                                        <Plus size={16} /> Thêm tài khoản
                                    </button>
                                </div>
                            </div>

                            <div className="admin-banner admin-banner--warn" style={{ marginBottom: 16 }}>
                                <ShieldCheck size={16} />
                                <div>
                                    Theo PRD, sau <strong>5 lần sai mật khẩu</strong> hoặc <strong>3 lần sai MFA</strong> — tài khoản sẽ bị khoá 15 phút. Access token 30 phút, refresh token 7 ngày.
                                </div>
                            </div>

                            <div className="dash-card">
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Mã</th>
                                                <th>Nhân sự</th>
                                                <th>Quyền</th>
                                                <th>MFA</th>
                                                <th>Trạng thái</th>
                                                <th>Đăng nhập gần nhất</th>
                                                <th style={{ textAlign: "right" }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminLoading && (
                                                <tr>
                                                    <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "var(--dash-text-3)" }}>
                                                        Đang tải danh sách tài khoản...
                                                    </td>
                                                </tr>
                                            )}
                                            {!adminLoading && adminList.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "var(--dash-text-3)" }}>
                                                        Chưa có tài khoản nào
                                                    </td>
                                                </tr>
                                            )}
                                            {!adminLoading && adminList.map((a) => {
                                                const role = ROLE_OPTIONS.find((r) => r.value === a.role);
                                                return (
                                                    <tr key={a.id}>
                                                        <td><span className="code-badge">{a.id}</span></td>
                                                        <td>
                                                            <div className="table-item-title">
                                                                <div className="avatar-initial">{a.name.charAt(0)}</div>
                                                                <div>
                                                                    <div className="font-semibold text-slate-100">{a.name}</div>
                                                                    <div className="text-xs text-slate-400">{a.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><span className={`role-badge ${role?.cls || ""}`}>{role?.label}</span></td>
                                                        <td>
                                                            {a.mfa
                                                                ? <span className="mfa-chip"><KeyRound size={11} /> Đang bật</span>
                                                                : <span className="mfa-chip is-off"><Unlock size={11} /> Tắt</span>}
                                                        </td>
                                                        <td>
                                                            <span className={`account-status account-status--${a.status}`}>
                                                                {a.status === "active" && "Đang hoạt động"}
                                                                {a.status === "locked" && "Đang bị khoá"}
                                                                {a.status === "deactivated" && "Đã vô hiệu"}
                                                            </span>
                                                        </td>
                                                        <td className="text-xs text-slate-400">{a.lastLogin}</td>
                                                        <td style={{ textAlign: "right" }}>
                                                            <div className="table-actions">
                                                                <button className="btn-action-edit" title="Sửa" onClick={() => handleOpenEditAdmin(a)}>
                                                                    <UserCog size={15} />
                                                                </button>
                                                                <button className="btn-action-delete" title="Vô hiệu hoá"
                                                                    onClick={() => handleDeactivateAdmin(a)}>
                                                                    <Lock size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB: AUDIT LOG (UC4/UC7) ================= */}
                    {currentTab === "audit" && (
                        <div className="admin-tab-view animate-fade">
                            <div className="admin-tab-head">
                                <div>
                                    <h1 className="admin-tab-title">Audit Log</h1>
                                    <p className="admin-tab-desc">
                                        UC4/UC7 — Mọi sự kiện đăng nhập, thay đổi nội dung, phân quyền đều được ghi nhật ký
                                    </p>
                                </div>
                            </div>

                            <div className="dash-card">
                                <div className="audit-list">
                                    {auditLoading && (
                                        <div className="audit-item" style={{ justifyContent: "center", padding: 30 }}>
                                            Đang tải nhật ký...
                                        </div>
                                    )}
                                    {!auditLoading && auditLogs.length === 0 && (
                                        <div className="audit-item" style={{ justifyContent: "center", padding: 30, color: "var(--dash-text-3)" }}>
                                            Chưa có bản ghi nào
                                        </div>
                                    )}
                                    {!auditLoading && auditLogs.map((log) => (
                                        <div key={log.id} className={`audit-item audit-item--${log.type}`}>
                                            <div className="audit-item__icon">
                                                {log.type === "success" && <CheckCircle2 size={16} />}
                                                {log.type === "failed" && <AlertCircle size={16} />}
                                                {log.type === "lock" && <Lock size={16} />}
                                                {log.type === "change" && <Edit3 size={16} />}
                                            </div>
                                            <div>
                                                <div className="audit-item__title">{log.event}</div>
                                                <div className="audit-item__detail">
                                                    {log.admin} • {log.detail}
                                                </div>
                                            </div>
                                            <div className="audit-item__time">
                                                {log.time ? new Date(log.time).toLocaleString("vi-VN") : "—"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ================= MODAL POI (UC5) ================= */}
            {editingPoi && poiForm && (
                <div className="admin-modal-backdrop" onClick={() => !savingPoi && (setEditingPoi(null), setPoiForm(null))}>
                    <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__head">
                            <div>
                                <h2 className="admin-modal__title">
                                    {editingPoi === "new" ? "Thêm POI mới" : `Chỉnh sửa ${poiForm.id}`}
                                </h2>
                                <p className="admin-modal__desc">
                                    Nhập thông tin POI và mô tả đa ngôn ngữ. Có thể dùng AI để sinh bản dịch.
                                </p>
                            </div>
                            <button className="clear-btn" onClick={() => { setEditingPoi(null); setPoiForm(null); }} disabled={savingPoi}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="poi-editor">
                            <div>
                                <div className="form-row-2" style={{ marginBottom: 12 }}>
                                    <div className="form-group">
                                        <label>Mã POI</label>
                                        <input type="text" value={poiForm.id} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>Loại</label>
                                        <select value={poiForm.category}
                                            onChange={(e) => setPoiForm({ ...poiForm, category: e.target.value })}
                                            disabled={savingPoi}>
                                            {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-2" style={{ marginBottom: 12 }}>
                                    <div className="form-group">
                                        <label>Tên POI</label>
                                        <input type="text" value={poiForm.name}
                                            placeholder="VD: Chuồng Hổ Bengal"
                                            onChange={(e) => setPoiForm({ ...poiForm, name: e.target.value })}
                                            disabled={savingPoi} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phân khu</label>
                                        <input type="text" value={poiForm.zone}
                                            placeholder="VD: Khu Thú săn mồi"
                                            onChange={(e) => setPoiForm({ ...poiForm, zone: e.target.value })}
                                            disabled={savingPoi} />
                                    </div>
                                </div>

                                <div className="form-row-3" style={{ marginBottom: 12 }}>
                                    <div className="form-group">
                                        <label>Vĩ độ (Lat)</label>
                                        <input type="text" value={poiForm.latitude}
                                            onChange={(e) => setPoiForm({ ...poiForm, latitude: e.target.value })}
                                            disabled={savingPoi} />
                                    </div>
                                    <div className="form-group">
                                        <label>Kinh độ (Lng)</label>
                                        <input type="text" value={poiForm.longitude}
                                            onChange={(e) => setPoiForm({ ...poiForm, longitude: e.target.value })}
                                            disabled={savingPoi} />
                                    </div>
                                    <div className="form-group">
                                        <label>Bán kính geofence (m)</label>
                                        <input type="number" min={5} max={200} value={poiForm.geofenceRadius}
                                            onChange={(e) => setPoiForm({ ...poiForm, geofenceRadius: +e.target.value })}
                                            disabled={savingPoi} />
                                    </div>
                                </div>

                                <div className="lang-tabs">
                                    {LANGUAGES.map((l) => {
                                        const done = !!poiForm.translations[l.code].trim();
                                        return (
                                            <button key={l.code} type="button" data-lang={l.code}
                                                className={`lang-tab ${poiLangTab === l.code ? "is-active" : ""}`}
                                                onClick={() => setPoiLangTab(l.code)}>
                                                <span className={`lang-tab__dot ${done ? "is-complete" : ""}`} />
                                                {l.label}
                                            </button>
                                        );
                                    })}
                                    <div className="lang-tabs__spacer" />
                                    <button type="button" className="btn-ai" onClick={handleAiTranslate} disabled={isTranslating || savingPoi}>
                                        {isTranslating ? <><span className="btn-spinner" /> AI đang dịch...</> : <><Sparkles size={14} /> Dịch bằng AI</>}
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label>Mô tả — {LANGUAGES.find((l) => l.code === poiLangTab)?.label}</label>
                                    <textarea rows={6}
                                        value={poiForm.translations[poiLangTab]}
                                        placeholder={poiLangTab === "vi" ? "Nhập mô tả tiếng Việt (bắt buộc)..." : "Bản dịch sẽ do AI sinh, vui lòng rà soát lại..."}
                                        onChange={(e) => setPoiForm({
                                            ...poiForm,
                                            translations: { ...poiForm.translations, [poiLangTab]: e.target.value },
                                        })}
                                        disabled={savingPoi} />
                                    <span className="field-hint">
                                        Ngôn ngữ mặc định của hệ thống là Tiếng Việt (dùng khi bản dịch ngôn ngữ khác chưa có).
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label>Xem trước vùng Geofence</label>
                                </div>
                                <div className="geofence-preview">
                                    <div className="geofence-preview__ring"
                                        style={{ "--ring-size": `${Math.min(90, 20 + poiForm.geofenceRadius / 2)}%` }} />
                                    <div className="geofence-preview__pin" />
                                    <div className="geofence-preview__caption">
                                        Bán kính: {poiForm.geofenceRadius}m • Toạ độ: {poiForm.latitude}, {poiForm.longitude}
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: 14 }}>
                                    <label>Trạng thái hoạt động</label>
                                    <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className="switch">
                                            <input type="checkbox" checked={poiForm.isActive}
                                                onChange={(e) => setPoiForm({ ...poiForm, isActive: e.target.checked })}
                                                disabled={savingPoi} />
                                            <span className="switch__track" />
                                        </span>
                                        <span style={{ fontSize: 12.5, color: "var(--dash-text-2)" }}>
                                            {poiForm.isActive ? "Đang mở cửa tham quan" : "Tạm đóng / bảo trì"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="admin-modal__foot">
                            <button className="btn-secondary-admin"
                                onClick={() => { setEditingPoi(null); setPoiForm(null); }}
                                disabled={savingPoi}>
                                Huỷ
                            </button>
                            <button className="btn-primary-admin" onClick={savePoi} disabled={savingPoi}>
                                {savingPoi ? (
                                    <><span className="btn-spinner" /> Đang lưu...</>
                                ) : (
                                    <><Save size={16} /> Lưu POI</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL: THÊM TÀI KHOẢN ADMIN ================= */}
            {showAddAdminModal && (
                <div className="admin-modal-backdrop"
                    onClick={() => !savingAdmin && setShowAddAdminModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__head">
                            <div>
                                <h2 className="admin-modal__title">Thêm tài khoản Admin</h2>
                                <p className="admin-modal__desc">Tạo tài khoản mới cho nhân sự quản trị Thảo Cầm Viên Sài Gòn</p>
                            </div>
                            <button className="clear-btn" onClick={() => setShowAddAdminModal(false)} disabled={savingAdmin}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAdmin} className="admin-modal__form">
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" required placeholder="VD: Nguyễn Văn A"
                                    value={newAdminForm.name}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                                    disabled={savingAdmin} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" required placeholder="VD: a.nguyen@saigonzoo.net"
                                    value={newAdminForm.email}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                                    disabled={savingAdmin} />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu ban đầu (tối thiểu 6 ký tự)</label>
                                <input type="password" required minLength={6} placeholder="••••••••"
                                    value={newAdminForm.password}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                                    disabled={savingAdmin} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                                    <span className="switch">
                                        <input type="checkbox" checked={newAdminForm.mfa}
                                            onChange={(e) => setNewAdminForm({ ...newAdminForm, mfa: e.target.checked })}
                                            disabled={savingAdmin} />
                                        <span className="switch__track" />
                                    </span>
                                    <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>
                                        Bật xác thực đa yếu tố (MFA) cho tài khoản này
                                    </span>
                                </label>
                            </div>
                            <div className="admin-modal__foot">
                                <button type="button" className="btn-secondary-admin"
                                    onClick={() => setShowAddAdminModal(false)} disabled={savingAdmin}>
                                    Huỷ
                                </button>
                                <button type="submit" className="btn-primary-admin" disabled={savingAdmin}>
                                    {savingAdmin ? <><span className="btn-spinner" /> Đang lưu...</> : <><Check size={16} /> Lưu tài khoản</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: SỬA TÀI KHOẢN ADMIN ================= */}
            {showEditAdminModal && editAdminForm && (
                <div className="admin-modal-backdrop"
                    onClick={() => !savingEditAdmin && setShowEditAdminModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__head">
                            <div>
                                <h2 className="admin-modal__title">Chỉnh sửa tài khoản Admin</h2>
                                <p className="admin-modal__desc">Cập nhật thông tin tài khoản {editAdminForm.id}</p>
                            </div>
                            <button className="clear-btn" onClick={() => setShowEditAdminModal(false)} disabled={savingEditAdmin}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditAdmin} className="admin-modal__form">
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" required value={editAdminForm.name}
                                    onChange={(e) => setEditAdminForm({ ...editAdminForm, name: e.target.value })}
                                    disabled={savingEditAdmin} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" required value={editAdminForm.email}
                                    onChange={(e) => setEditAdminForm({ ...editAdminForm, email: e.target.value })}
                                    disabled={savingEditAdmin} />
                            </div>
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select value={editAdminForm.status}
                                    onChange={(e) => setEditAdminForm({ ...editAdminForm, status: e.target.value })}
                                    disabled={savingEditAdmin}>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="deactivated">Đã vô hiệu hoá</option>
                                    <option value="locked">Đang bị khoá</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                                    <span className="switch">
                                        <input type="checkbox" checked={editAdminForm.mfa}
                                            onChange={(e) => setEditAdminForm({ ...editAdminForm, mfa: e.target.checked })}
                                            disabled={savingEditAdmin} />
                                        <span className="switch__track" />
                                    </span>
                                    <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>
                                        Bật xác thực đa yếu tố (MFA)
                                    </span>
                                </label>
                            </div>
                            <div className="admin-modal__foot">
                                <button type="button" className="btn-secondary-admin"
                                    onClick={() => setShowEditAdminModal(false)} disabled={savingEditAdmin}>
                                    Huỷ
                                </button>
                                <button type="submit" className="btn-primary-admin" disabled={savingEditAdmin}>
                                    {savingEditAdmin ? <><span className="btn-spinner" /> Đang lưu...</> : <><Check size={16} /> Lưu thay đổi</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= TOAST ================= */}
            {toast && (
                <div className={`admin-toast ${toast.tone === "error" ? "admin-toast--error" : ""}`}>
                    {toast.tone === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span>{toast.msg}</span>
                </div>
            )}
        </div>
    );
}