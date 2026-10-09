import React, { useState, useMemo } from "react";
import {
    LayoutDashboard, MapPin, Headphones, BarChart3, Users, ShieldCheck,
    Search, Plus, Trash2, LogOut, Compass, Check, X, AlertCircle,
    CheckCircle2, Clock, Download, Upload, Sparkles, Play, Pause,
    Languages, FileAudio, History, Activity, TrendingUp, ArrowUpRight,
    Calendar, Edit3, Globe, ExternalLink, Eye, Volume2, KeyRound,
    UserCog, PawPrint, TreePine, Info, Server, Zap, FileText, Mic,
    RefreshCw, Save, Lock, Unlock,
} from "lucide-react";
import { MARKERS } from "../map/mapData";
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

/* --- POI mẫu (lấy từ MARKERS để đồng bộ với bản đồ du khách) --- */
const buildInitialPois = () =>
    (MARKERS || []).slice(0, 10).map((m, i) => ({
        id: m.id || `POI-${String(i + 1).padStart(3, "0")}`,
        name: m.name || `Điểm tham quan ${i + 1}`,
        category: m.type || "animal",
        zone: m.zone || "Khu trung tâm",
        latitude: (10.7875 + (i % 4) * 0.0003).toFixed(6),
        longitude: (106.7050 + Math.floor(i / 4) * 0.0004).toFixed(6),
        geofenceRadius: 15 + (i % 4) * 5, // mét
        isActive: true,
        updatedAt: "21-09-2026",
        translations: {
            vi: m.name || "",
            en: i % 3 === 0 ? "" : `Guide for ${m.name || "POI"}`,
            zh: i % 2 === 0 ? "" : `导览：${m.name || "景点"}`,
        },
    }));

/* --- Audio track mẫu (bám AUDIO_TRACK trong ERD) --- */
const buildInitialAudio = (pois) => {
    const rows = [];
    let idx = 1;
    pois.forEach((p, i) => {
        LANGUAGES.forEach((l, j) => {
            // Bỏ trống 1 vài ô để demo trạng thái "missing"
            const missing = (i + j) % 5 === 0;
            if (missing) return;
            rows.push({
                id: `AUD-${String(idx++).padStart(3, "0")}`,
                poiId: p.id,
                language: l.code,
                source: (i + j) % 2 === 0 ? "upload" : "ai",
                duration: 60 + ((i * 7 + j * 13) % 90),
                sizeMb: +(0.8 + ((i + j) % 5) * 0.3).toFixed(2),
                status: j === 2 && i % 3 === 0 ? "draft" : "published",
                publishedAt: j === 2 && i % 3 === 0 ? null : "20-09-2026",
            });
        });
    });
    return rows;
};


const INITIAL_ADMINS = [
    { id: "AD-001", name: "Nguyễn Trung Hiếu", email: "hieu.nguyen@saigonzoo.net", role: "admin", mfa: true, status: "active", lastLogin: "21-09-2026 08:14" },
    { id: "AD-002", name: "Huỳnh Lê Khánh Ly", email: "ly.huynh@saigonzoo.net", role: "admin", mfa: true, status: "active", lastLogin: "21-09-2026 07:52" },
    { id: "AD-003", name: "Nguyễn Hoàng Khởi", email: "khoi.nguyen@saigonzoo.net", role: "admin", mfa: true, status: "active", lastLogin: "20-09-2026 17:30" },
];

/* --- Audit log mẫu (bám AUDIT_LOG) --- */
const INITIAL_AUDIT = [
    { id: 1, admin: "Nguyễn Trung Hiếu", type: "success", event: "Đăng nhập thành công", detail: "MFA hợp lệ • IP 113.161.x.x", time: "21-09-2026 08:14" },
    { id: 2, admin: "Huỳnh Lê Khánh Ly", type: "change", event: "Cập nhật POI", detail: "POI-003 • thêm bản dịch tiếng Trung", time: "21-09-2026 08:02" },
    { id: 3, admin: "Nguyễn Hoàng Khởi", type: "success", event: "Publish audio track", detail: "AUD-014 • EN • POI-002", time: "21-09-2026 07:58" },
    { id: 4, admin: "Trần Minh Quân", type: "failed", event: "Đăng nhập thất bại (lần 5)", detail: "Khoá tài khoản 15 phút", time: "18-09-2026 09:05" },
    { id: 5, admin: "Nguyễn Trung Hiếu", type: "lock", event: "Reset mật khẩu", detail: "AD-005 • link gửi qua email", time: "02-08-2026 14:25" },
];

/* --- Gói offline mẫu --- */
const OFFLINE_PACKAGE = {
    version: "v2026.09.21",
    totalMb: 148.6,
    limitMb: 150,
    publishedAt: "21-09-2026",
    downloads: { android: 1284, ios: 972, web: 305 },
};

/* =========================================================
   1. COMPONENT
   ========================================================= */

export default function AdminDashboard({ user, onLogout, onGoToMap }) {
    /* ---- State: điều hướng ---- */
    const [currentTab, setCurrentTab] = useState("overview");
    const [toast, setToast] = useState(null);

    /* ---- UC5: POI ---- */
    const [poiList, setPoiList] = useState(buildInitialPois);
    const [poiSearch, setPoiSearch] = useState("");
    const [poiCategory, setPoiCategory] = useState("all");
    const [editingPoi, setEditingPoi] = useState(null); // null | object | "new"
    const [poiLangTab, setPoiLangTab] = useState("vi");
    const [poiForm, setPoiForm] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);

    /* ---- UC6: Audio ---- */
<<<<<<< Updated upstream
    const [audioList, setAudioList] = useState(() => buildInitialAudio(buildInitialPois()));
    const [audioPoiId, setAudioPoiId] = useState(() => buildInitialPois()[0]?.id);
=======
    const [audioList, setAudioList] = useState([]);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioPoiId, setAudioPoiId] = useState(null);
>>>>>>> Stashed changes
    const [aiScript, setAiScript] = useState("");
    const [aiLang, setAiLang] = useState("vi");
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewTrack, setPreviewTrack] = useState(null);

    /* ---- UC7: Analytics ---- */
<<<<<<< Updated upstream
=======
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
>>>>>>> Stashed changes
    const [range, setRange] = useState("7d");
    const [exporting, setExporting] = useState(false);

    /* ---- UC7: Admin accounts ---- */
    const [adminList, setAdminList] = useState(INITIAL_ADMINS);

    /* ---- UC4: Audit log ---- */
<<<<<<< Updated upstream
    const [auditLogs] = useState(INITIAL_AUDIT);
=======
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
>>>>>>> Stashed changes

    /* ---- Helper ---- */
    const showToast = (msg, tone = "ok") => {
        setToast({ msg, tone });
        setTimeout(() => setToast(null), 2600);
    };

<<<<<<< Updated upstream
    /* ---- Derived ---- */
    const filteredPois = useMemo(() => {
        return poiList.filter((p) => {
            const okCat = poiCategory === "all" || p.category === poiCategory;
            const kw = poiSearch.trim().toLowerCase();
            const okKw =
                !kw ||
                p.name.toLowerCase().includes(kw) ||
                p.id.toLowerCase().includes(kw) ||
                p.zone.toLowerCase().includes(kw);
            return okCat && okKw;
=======
    /* =========================================================
       LOAD DỮ LIỆU
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

    // 2. POIs
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
>>>>>>> Stashed changes
        });
    }, [poiList, poiSearch, poiCategory]);

    const audioByPoi = useMemo(
        () => audioList.filter((a) => a.poiId === audioPoiId),
        [audioList, audioPoiId]
    );

    const currentAudioPoi = useMemo(
        () => poiList.find((p) => p.id === audioPoiId),
        [poiList, audioPoiId]
    );

    /* =========================================================
       UC5 — HÀNH ĐỘNG POI
       ========================================================= */
    const startCreatePoi = () => {
        setPoiForm({
<<<<<<< Updated upstream
            id: `POI-${String(poiList.length + 1).padStart(3, "0")}`,
            name: "",
            category: "animal",
            zone: "",
            latitude: "10.787500",
            longitude: "106.705000",
            geofenceRadius: 20,
            isActive: true,
            translations: { vi: "", en: "", zh: "" },
=======
            id: nextId, name: "", category: "animal", zone: "",
            latitude: "10.787500", longitude: "106.705000",
            geofenceRadius: 20, isActive: true,
            translations: {
                vi: { short: "", detail: "" },
                en: { short: "", detail: "" },
                zh: { short: "", detail: "" },
            },
>>>>>>> Stashed changes
        });
        setEditingPoi("new");
        setPoiLangTab("vi");
    };

    const startEditPoi = (poi) => {
        setPoiForm(JSON.parse(JSON.stringify(poi)));
        setEditingPoi(poi.id);
        setPoiLangTab("vi");
    };

    const validatePoiForm = (f) => {
        if (!f.name.trim()) return "Thiếu tên POI";
        if (!f.zone.trim()) return "Thiếu phân khu";
        if (!f.translations.vi.detail.trim()) return "Thiếu mô tả chi tiết tiếng Việt";
        if (!f.translations.vi.short.trim()) return "Thiếu mô tả ngắn tiếng Việt";
        if (f.geofenceRadius < 5 || f.geofenceRadius > 200) return "Bán kính geofence phải trong khoảng 5–200m";
        return null;
    };

    const savePoi = () => {
        const err = validatePoiForm(poiForm);
        if (err) return showToast(err, "error");
        if (editingPoi === "new") {
            setPoiList((prev) => [poiForm, ...prev]);
            showToast("Đã tạo POI mới (UC5)");
        } else {
            setPoiList((prev) => prev.map((p) => (p.id === poiForm.id ? poiForm : p)));
            showToast("Đã cập nhật POI (UC5)");
        }
        setEditingPoi(null);
        setPoiForm(null);
    };

<<<<<<< Updated upstream
    const deletePoi = (id) => {
        if (!window.confirm("Xoá POI này? Audio liên quan cũng sẽ bị gỡ khỏi gói offline.")) return;
        setPoiList((prev) => prev.filter((p) => p.id !== id));
        setAudioList((prev) => prev.filter((a) => a.poiId !== id));
        showToast("Đã xoá POI", "error");
=======
    const deletePoi = async (poi) => {
        if (!window.confirm(`Xoá POI "${poi.name}"? Audio liên quan cũng sẽ bị gỡ.`)) return;
        try {
            await api.deletePoi(poi.dbId);
            const list = await api.getPois();
            setPoiList(list);
            if (audioPoiId === poi.dbId) {
                setAudioPoiId(list[0]?.dbId || null);
            }
            showToast("Đã xoá POI");
        } catch (err) {
            showToast(err.message, "error");
        }
>>>>>>> Stashed changes
    };

    /* --- A1: AI-assisted translation (UC5 Alternative) --- */
    const handleAiTranslate = () => {
        const srcShort = poiForm.translations.vi.short.trim();
        const srcDetail = poiForm.translations.vi.detail.trim();
        if (!srcDetail) return showToast("Cần nhập mô tả chi tiết tiếng Việt trước khi dịch", "error");

        setIsTranslating(true);
        // Giả lập gọi AI content service
        setTimeout(() => {
            setPoiForm((f) => ({
                ...f,
                translations: {
                    ...f.translations,
                    en: {
                        short: f.translations.en.short || `[AI draft EN] ${srcShort || srcDetail.slice(0, 100)}`,
                        detail: f.translations.en.detail || `[AI draft EN] ${srcDetail}`,
                    },
                    zh: {
                        short: f.translations.zh.short || `[AI 草稿 ZH] ${srcShort || srcDetail.slice(0, 100)}`,
                        detail: f.translations.zh.detail || `[AI 草稿 ZH] ${srcDetail}`,
                    },
                },
            }));
            setIsTranslating(false);
            showToast("AI đã sinh bản nháp EN/ZH — vui lòng rà soát lại");
        }, 900);
    };

    /* =========================================================
<<<<<<< Updated upstream
       UC6 — HÀNH ĐỘNG AUDIO
=======
       UC6 — AUDIO
>>>>>>> Stashed changes
       ========================================================= */
    const uploadAudio = (lang) => {
        const dur = 60 + Math.floor(Math.random() * 60);
        const newTrack = {
            id: `AUD-${String(audioList.length + 1).padStart(3, "0")}`,
            poiId: audioPoiId,
            language: lang,
            source: "upload",
            duration: dur,
            sizeMb: +(dur * 0.015).toFixed(2),
            status: "draft",
            publishedAt: null,
        };
        setAudioList((prev) => [...prev, newTrack]);
        showToast(`Đã tải audio ${lang.toUpperCase()} (chờ publish)`);
    };

    const generateAiAudio = () => {
        if (!aiScript.trim()) return showToast("Nhập kịch bản trước khi sinh audio AI", "error");
        setIsGenerating(true);
        setTimeout(() => {
            const dur = 45 + Math.floor(aiScript.length / 6);
            const newTrack = {
                id: `AUD-${String(audioList.length + 1).padStart(3, "0")}`,
                poiId: audioPoiId,
                language: aiLang,
                source: "ai",
                duration: dur,
                sizeMb: +(dur * 0.015).toFixed(2),
                status: "draft",
                publishedAt: null,
            };
            setAudioList((prev) => [...prev, newTrack]);
            setIsGenerating(false);
            setAiScript("");
            showToast(`AI TTS đã sinh audio ${aiLang.toUpperCase()} — chờ publish`);
        }, 1200);
    };

    const publishTrack = (id) => {
        setAudioList((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: "published", publishedAt: "21-09-2026" } : a))
        );
        showToast("Đã publish — audio vào gói offline");
    };

    const removeTrack = (id) => {
        setAudioList((prev) => prev.filter((a) => a.id !== id));
        showToast("Đã gỡ audio track", "error");
    };

    /* =========================================================
       UC7 — EXPORT
       ========================================================= */
    const handleExport = (fmt) => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            showToast(`Đã xuất báo cáo ${fmt} (UC7)`);
        }, 700);
    };

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
                                        <div className="stat-card__icon stat-card__icon--blue"><Users size={20} /></div>
                                        <span className="stat-card__trend stat-card__trend--up"><ArrowUpRight size={13} /> +14.2%</span>
                                    </div>
                                    <div className="stat-card__value">8,640</div>
                                    <div className="stat-card__label">Lượt truy cập hôm nay</div>
                                    <div className="stat-card__foot">Mobile 71% • Web 29%</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card__head">
                                        <div className="stat-card__icon stat-card__icon--emerald"><MapPin size={20} /></div>
                                        <span className="stat-card__badge-sub">{poiList.length} POI</span>
                                    </div>
                                    <div className="stat-card__value">{poiList.filter((p) => p.isActive).length}</div>
                                    <div className="stat-card__label">POI đang hoạt động</div>
                                    <div className="stat-card__foot">
<<<<<<< Updated upstream
                                        {poiList.filter((p) => LANGUAGES.every((l) => p.translations[l.code])).length} POI đủ 3 ngôn ngữ
=======
                                        {poiList.filter((p) => LANGUAGES.every((l) => p.translations?.[l.code]?.detail)).length} POI đủ 3 ngôn ngữ
>>>>>>> Stashed changes
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card__head">
                                        <div className="stat-card__icon stat-card__icon--amber"><Headphones size={20} /></div>
                                        <span className="stat-card__badge-sub">VI/EN/ZH</span>
                                    </div>
                                    <div className="stat-card__value">{audioList.filter((a) => a.status === "published").length}</div>
                                    <div className="stat-card__label">Audio track đã publish</div>
                                    <div className="stat-card__foot">
                                        {audioList.filter((a) => a.status === "draft").length} bản nháp • {audioList.filter((a) => a.source === "ai").length} do AI sinh
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
                                {/* Language distribution */}
                                <div className="dash-card">
                                    <div className="dash-card__head">
                                        <div>
                                            <h3 className="dash-card__title"><Languages size={17} className="text-emerald" /> Phân bổ ngôn ngữ sử dụng</h3>
                                            <p className="dash-card__desc">Dựa trên USAGE_LOG — language_code</p>
                                        </div>
                                    </div>
                                    <div className="dash-card__body">
                                        <div className="lang-dist__bar">
                                            <div className="lang-dist__seg lang-dist__seg--vi" style={{ "--w": "58%" }} />
                                            <div className="lang-dist__seg lang-dist__seg--en" style={{ "--w": "27%" }} />
                                            <div className="lang-dist__seg lang-dist__seg--zh" style={{ "--w": "15%" }} />
                                        </div>
                                        <div className="lang-dist__legend">
                                            {[
                                                { c: "var(--lang-vi)", n: "Tiếng Việt (VI)", v: "58%" },
                                                { c: "var(--lang-en)", n: "English (EN)", v: "27%" },
                                                { c: "var(--lang-zh)", n: "中文 (ZH)", v: "15%" },
                                            ].map((x, i) => (
                                                <div key={i} className="lang-dist__item">
                                                    <span className="lang-dist__swatch" style={{ "--c": x.c }} />
                                                    <span className="lang-dist__name">{x.n}</span>
                                                    <span className="lang-dist__val">{x.v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* POI popularity */}
                                <div className="dash-card">
                                    <div className="dash-card__head">
                                        <div>
                                            <h3 className="dash-card__title"><Activity size={17} className="text-amber" /> Top POI được nghe nhiều nhất</h3>
                                            <p className="dash-card__desc">Lượt auto-play + manual play 7 ngày qua</p>
                                        </div>
                                    </div>
                                    <div className="zones-rank-list">
                                        {[
                                            { n: "Khu Voi Châu Á", v: "3,840", p: 92, c: "#10b981" },
                                            { n: "Chuồng Hổ Bengal", v: "2,910", p: 75, c: "#34d399" },
                                            { n: "Hồ Hồng Hạc", v: "2,450", p: 64, c: "#60a5fa" },
                                            { n: "Đảo Linh Trưởng", v: "1,820", p: 48, c: "#f59e0b" },
                                            { n: "Vườn Lan Cổ Thụ", v: "1,340", p: 36, c: "#a78bfa" },
                                        ].map((z, i) => (
                                            <div key={i} className="zone-rank-item">
                                                <div className="zone-rank-item__row">
                                                    <span className="zone-rank-name"><strong>#{i + 1}</strong> {z.n}</span>
                                                    <span className="zone-rank-views">{z.v} lượt</span>
                                                </div>
                                                <div className="zone-rank-bar">
                                                    <div className="zone-rank-bar__fill" style={{ width: `${z.p}%`, background: z.c }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Gói offline status */}
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
                                </div>
                                <div className="admin-tab-actions">
                                    <button onClick={startCreatePoi} className="btn-primary-admin">
                                        <Plus size={16} /><span>Thêm POI mới</span>
                                    </button>
                                </div>
                            </div>

                            {/* Filter bar */}
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

                            {/* Table */}
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
<<<<<<< Updated upstream
                                            {filteredPois.map((p) => {
                                                const doneLangs = LANGUAGES.filter((l) => p.translations[l.code]);
=======
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
                                                const tr = p.translations || {};
                                                const doneLangs = LANGUAGES.filter((l) => tr[l.code]?.detail);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                                                                    const done = !!p.translations[l.code];
=======
                                                                    const done = !!tr[l.code]?.detail;
>>>>>>> Stashed changes
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
                                                                <button className="btn-action-delete" title="Xoá" onClick={() => deletePoi(p.id)}>
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
                                    
                                </div>
                                <div className="admin-tab-actions">
                                    <select
                                        value={audioPoiId}
                                        onChange={(e) => setAudioPoiId(e.target.value)}
                                        style={{
                                            height: 40, padding: "0 12px", borderRadius: 8,
                                            border: "1px solid var(--dash-border)",
                                            background: "#fff", fontSize: 13, fontWeight: 600,
                                            color: "var(--dash-text-1)",
                                        }}
                                    >
                                        {poiList.map((p) => (
                                            <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Thông tin POI đang chọn */}
                            {currentAudioPoi && (
                                <div className="admin-banner admin-banner--ok" style={{ marginBottom: 16 }}>
                                    <Info size={16} />
                                    <div>
                                        <strong>{currentAudioPoi.name}</strong> — {currentAudioPoi.zone} • Geofence{" "}
<<<<<<< Updated upstream
                                        {currentAudioPoi.geofenceRadius}m • {LANGUAGES.filter((l) => currentAudioPoi.translations[l.code]).length}/3 ngôn ngữ đã có mô tả
=======
                                        {currentAudioPoi.geofenceRadius}m • {LANGUAGES.filter((l) => currentAudioPoi.translations?.[l.code]?.detail).length}/3 ngôn ngữ đã có mô tả
>>>>>>> Stashed changes
                                    </div>
                                </div>
                            )}

                            {/* 3 language cards */}
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
                                                        <button className="btn-secondary-admin" onClick={() => uploadAudio(lang.code)}>
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
                                                        {track.publishedAt ? `Publish: ${track.publishedAt}` : "Chưa publish — chưa vào gói offline"}
                                                    </div>

                                                    {/* Preview player */}
                                                    <div className="audio-player">
                                                        <button
                                                            className="audio-player__btn"
                                                            onClick={() => setPreviewTrack(previewTrack?.id === track.id ? null : track)}
                                                            title="Nghe thử"
                                                        >
                                                            {previewTrack?.id === track.id ? <Pause size={16} /> : <Play size={16} />}
                                                        </button>
                                                        <div className="audio-player__bar">
                                                            <div className="audio-player__fill" style={{ "--progress": previewTrack?.id === track.id ? "35%" : "0%" }} />
                                                        </div>
                                                        <span className="audio-player__time">0:{String(track.duration).padStart(2, "0")}</span>
                                                    </div>

                                                    <div className="audio-track__actions">
                                                        {track.status !== "published" && (
                                                            <button className="btn-primary-admin" onClick={() => publishTrack(track.id)}>
                                                                <Check size={14} /> Publish
                                                            </button>
                                                        )}
                                                        <button className="btn-secondary-admin" onClick={() => uploadAudio(lang.code)}>
                                                            <RefreshCw size={14} /> Thay thế
                                                        </button>
                                                        <button className="btn-action-delete" onClick={() => removeTrack(track.id)} title="Gỡ">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* AI Generator */}
                            <div className="dash-card" style={{ marginTop: 20 }}>
                                <div className="dash-card__head">
                                    <div>
                                        <h3 className="dash-card__title"><Sparkles size={17} className="text-amber" /> Sinh audio bằng AI Text-to-Speech</h3>
                                        <p className="dash-card__desc">Áp dụng cho POI: <strong>{currentAudioPoi?.name}</strong></p>
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
                                            className="admin-modal__form"
                                            style={{
                                                width: "100%", padding: 12, borderRadius: 10,
                                                border: "1px solid var(--dash-border)",
                                                fontFamily: "inherit", fontSize: 13, resize: "vertical",
                                            }}
                                        />
                                        <span className="script-box__count">{aiScript.length} ký tự</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                        <button className="btn-ai" onClick={generateAiAudio} disabled={isGenerating}>
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

                            {/* KPIs */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card__icon stat-card__icon--blue"><TrendingUp size={20} /></div>
                                    <div className="stat-card__value" style={{ marginTop: 10 }}>52,384</div>
                                    <div className="stat-card__label">Tổng lượt nghe audio</div>
                                    <div className="stat-card__foot">7 ngày gần nhất</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card__icon stat-card__icon--emerald"><Activity size={20} /></div>
                                    <div className="stat-card__value" style={{ marginTop: 10 }}>2,140</div>
                                    <div className="stat-card__label">Người dùng hoạt động (DAU)</div>
                                    <div className="stat-card__foot">+9.2% so với tuần trước</div>
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
                                    <div className="stat-card__icon stat-card__icon--purple"><Zap size={20} /></div>
                                    <div className="stat-card__value" style={{ marginTop: 10 }}>1.6s</div>
                                    <div className="stat-card__label">Độ trễ audio trung bình</div>
                                    <div className="stat-card__foot">Mục tiêu PRD: &lt; 2s</div>
                                </div>
                            </div>

                            <div className="dash-grid-2">
                                {/* Language distribution */}
                                <div className="dash-card">
                                    <div className="dash-card__head">
                                        <h3 className="dash-card__title"><Languages size={17} className="text-emerald" /> Phân bổ ngôn ngữ</h3>
                                    </div>
                                    <div className="dash-card__body">
                                        <div className="lang-dist__bar">
                                            <div className="lang-dist__seg lang-dist__seg--vi" style={{ "--w": "58%" }} />
                                            <div className="lang-dist__seg lang-dist__seg--en" style={{ "--w": "27%" }} />
                                            <div className="lang-dist__seg lang-dist__seg--zh" style={{ "--w": "15%" }} />
                                        </div>
                                        <div className="lang-dist__legend">
                                            <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-vi)" }} /><span className="lang-dist__name">Tiếng Việt</span><span className="lang-dist__val">58%</span></div>
                                            <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-en)" }} /><span className="lang-dist__name">English</span><span className="lang-dist__val">27%</span></div>
                                            <div className="lang-dist__item"><span className="lang-dist__swatch" style={{ "--c": "var(--lang-zh)" }} /><span className="lang-dist__name">中文</span><span className="lang-dist__val">15%</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Package card */}
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

                            {/* POI popularity table */}
                            <div className="dash-card" style={{ marginTop: 16 }}>
                                <div className="dash-card__head">
                                    <h3 className="dash-card__title"><MapPin size={17} className="text-emerald" /> Mức độ phổ biến POI</h3>
                                    <p className="dash-card__desc">Xếp hạng theo lượt play audio</p>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>POI</th>
                                                <th>Lượt nghe</th>
                                                <th>Hoàn thành ≥80%</th>
                                                <th>Tỉ lệ replay</th>
                                                <th>Ngôn ngữ phổ biến</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { n: "Khu Voi Châu Á", p: "3,840", c: "78%", r: "12%", l: "VI" },
                                                { n: "Chuồng Hổ Bengal", p: "2,910", c: "72%", r: "9%", l: "EN" },
                                                { n: "Hồ Hồng Hạc", p: "2,450", c: "81%", r: "15%", l: "ZH" },
                                                { n: "Đảo Linh Trưởng", p: "1,820", c: "66%", r: "8%", l: "VI" },
                                                { n: "Vườn Lan Cổ Thụ", p: "1,340", c: "54%", r: "5%", l: "EN" },
                                            ].map((row, i) => (
                                                <tr key={i}>
                                                    <td><strong>#{i + 1}</strong></td>
                                                    <td>{row.n}</td>
                                                    <td><span className="price-badge">{row.p}</span></td>
                                                    <td>{row.c}</td>
                                                    <td>{row.r}</td>
                                                    <td><span className="method-badge">{row.l}</span></td>
                                                </tr>
                                            ))}
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
                                </div>
                                <div className="admin-tab-actions">
                                    <button
                                        className="btn-primary-admin"
                                        onClick={() => showToast("Demo: mở form thêm tài khoản")}
                                    >
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
                                            {adminList.map((a) => {
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
                                                                <button className="btn-action-edit" title="Sửa" onClick={() => showToast("Demo: sửa tài khoản")}>
                                                                    <UserCog size={15} />
                                                                </button>
                                                                <button className="btn-action-delete" title="Vô hiệu hoá"
                                                                    onClick={() => {
                                                                        setAdminList((prev) =>
                                                                            prev.map((x) => (x.id === a.id ? { ...x, status: "deactivated" } : x))
                                                                        );
                                                                        showToast("Đã vô hiệu hoá tài khoản");
                                                                    }}>
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
                                    
                                </div>
                            </div>

                            <div className="dash-card">
                                <div className="audit-list">
                                    {auditLogs.map((log) => (
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
                                            <div className="audit-item__time">{log.time}</div>
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
                <div className="admin-modal-backdrop" onClick={() => { setEditingPoi(null); setPoiForm(null); }}>
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
                            <button className="clear-btn" onClick={() => { setEditingPoi(null); setPoiForm(null); }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="poi-editor">
                            {/* Cột trái: form */}
                            <div>
                                <div className="form-row-2" style={{ marginBottom: 12 }}>
                                    <div className="form-group">
                                        <label>Mã POI</label>
                                        <input type="text" value={poiForm.id} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>Loại</label>
                                        <select value={poiForm.category}
                                            onChange={(e) => setPoiForm({ ...poiForm, category: e.target.value })}>
                                            {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-2" style={{ marginBottom: 12 }}>
                                    <div className="form-group">
                                        <label>Tên POI</label>
                                        <input type="text" value={poiForm.name}
                                            placeholder="VD: Chuồng Hổ Bengal"
                                            onChange={(e) => setPoiForm({ ...poiForm, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phân khu</label>
                                        <input type="text" value={poiForm.zone}
                                            placeholder="VD: Khu Thú săn mồi"
                                            onChange={(e) => setPoiForm({ ...poiForm, zone: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-row-3" style={{ marginBottom: 12 }}>
                                    <div className="form-group">
                                        <label>Vĩ độ (Lat)</label>
                                        <input type="text" value={poiForm.latitude}
                                            onChange={(e) => setPoiForm({ ...poiForm, latitude: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Kinh độ (Lng)</label>
                                        <input type="text" value={poiForm.longitude}
                                            onChange={(e) => setPoiForm({ ...poiForm, longitude: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Bán kính geofence (m)</label>
                                        <input type="number" min={5} max={200} value={poiForm.geofenceRadius}
                                            onChange={(e) => setPoiForm({ ...poiForm, geofenceRadius: +e.target.value })} />
                                    </div>
                                </div>

                                {/* Language tabs */}
                                <div className="lang-tabs">
                                    {LANGUAGES.map((l) => {
                                        const done = !!(poiForm.translations[l.code]?.detail || "").trim();
                                        return (
                                            <button
                                                key={l.code}
                                                type="button"
                                                data-lang={l.code}
                                                className={`lang-tab ${poiLangTab === l.code ? "is-active" : ""}`}
                                                onClick={() => setPoiLangTab(l.code)}
                                            >
                                                <span className={`lang-tab__dot ${done ? "is-complete" : ""}`} />
                                                {l.label}
                                            </button>
                                        );
                                    })}
                                    <div className="lang-tabs__spacer" />
                                    <button type="button" className="btn-ai" onClick={handleAiTranslate} disabled={isTranslating}>
                                        {isTranslating ? <><span className="btn-spinner" /> AI đang dịch...</> : <><Sparkles size={14} /> Dịch bằng AI</>}
                                    </button>
                                </div>

                                {/* Mô tả ngắn */}
                                <div className="form-group">
<<<<<<< Updated upstream
                                    <label>Mô tả — {LANGUAGES.find((l) => l.code === poiLangTab)?.label}</label>
                                    <textarea
                                        rows={6}
                                        value={poiForm.translations[poiLangTab]}
                                        placeholder={poiLangTab === "vi" ? "Nhập mô tả tiếng Việt (bắt buộc)..." : "Bản dịch sẽ do AI sinh, vui lòng rà soát lại..."}
                                        onChange={(e) =>
                                            setPoiForm({
                                                ...poiForm,
                                                translations: { ...poiForm.translations, [poiLangTab]: e.target.value },
                                            })
                                        }
                                    />
=======
                                    <label>
                                        Mô tả ngắn — {LANGUAGES.find((l) => l.code === poiLangTab)?.label}
                                        <span style={{ fontSize: 11, color: "var(--dash-text-3)", marginLeft: 8 }}>
                                            (card danh sách)
                                        </span>
                                    </label>
                                    <textarea rows={2}
                                        value={poiForm.translations[poiLangTab]?.short || ""}
                                        placeholder="VD: S2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Q.1..."
                                        maxLength={180}
                                        onChange={(e) => setPoiForm({
                                            ...poiForm,
                                            translations: {
                                                ...poiForm.translations,
                                                [poiLangTab]: {
                                                    ...poiForm.translations[poiLangTab],
                                                    short: e.target.value,
                                                },
                                            },
                                        })}
                                        disabled={savingPoi} />
                                    <span className="field-hint">
                                        {(poiForm.translations[poiLangTab]?.short || "").length}/180 ký tự — ngắn gọn 1-2 câu.
                                    </span>
                                </div>

                                {/* Mô tả chi tiết */}
                                <div className="form-group" style={{ marginTop: 12 }}>
                                    <label>
                                        Mô tả chi tiết — {LANGUAGES.find((l) => l.code === poiLangTab)?.label}
                                        <span style={{ fontSize: 11, color: "var(--dash-text-3)", marginLeft: 8 }}>
                                            (modal chi tiết)
                                        </span>
                                    </label>
                                    <textarea rows={6}
                                        value={poiForm.translations[poiLangTab]?.detail || ""}
                                        placeholder={poiLangTab === "vi" ? "Nhập mô tả chi tiết tiếng Việt (bắt buộc)..." : "Bản dịch chi tiết do AI sinh..."}
                                        onChange={(e) => setPoiForm({
                                            ...poiForm,
                                            translations: {
                                                ...poiForm.translations,
                                                [poiLangTab]: {
                                                    ...poiForm.translations[poiLangTab],
                                                    detail: e.target.value,
                                                },
                                            },
                                        })}
                                        disabled={savingPoi} />
>>>>>>> Stashed changes
                                    <span className="field-hint">
                                        Ngôn ngữ mặc định của hệ thống là Tiếng Việt (dùng khi bản dịch ngôn ngữ khác chưa có).
                                    </span>
                                </div>
                            </div>

                            {/* Cột phải: geofence preview */}
                            <div>
                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label>Xem trước vùng Geofence</label>
                                </div>
                                <div className="geofence-preview">
                                    <div
                                        className="geofence-preview__ring"
                                        style={{ "--ring-size": `${Math.min(90, 20 + poiForm.geofenceRadius / 2)}%` }}
                                    />
                                    <div className="geofence-preview__pin" />
                                    <div className="geofence-preview__caption">
                                        Bán kính: {poiForm.geofenceRadius}m • Toạ độ: {poiForm.latitude}, {poiForm.longitude}
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: 14 }}>
                                    <label>Trạng thái hoạt động</label>
                                    <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className="switch">
                                            <input
                                                type="checkbox"
                                                checked={poiForm.isActive}
                                                onChange={(e) => setPoiForm({ ...poiForm, isActive: e.target.checked })}
                                            />
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
                            <button className="btn-secondary-admin" onClick={() => { setEditingPoi(null); setPoiForm(null); }}>
                                Huỷ
                            </button>
                            <button className="btn-primary-admin" onClick={savePoi}>
                                <Save size={16} /> Lưu POI
                            </button>
                        </div>
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