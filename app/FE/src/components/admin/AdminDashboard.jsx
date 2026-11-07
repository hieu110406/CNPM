import { useState, useMemo, useEffect, useRef } from "react";
import {
    LayoutDashboard, MapPin, Headphones, Users, ShieldCheck,
    Search, Plus, Trash2, LogOut, Compass, Check, X, AlertCircle,
    CheckCircle2, Clock, Download, Upload, Sparkles,
    Languages, FileAudio, Activity, TrendingUp, ArrowUpRight,
    Edit3, Globe, ExternalLink, UserCog, Info, Server,
    FileText, Mic, RefreshCw, Save, Lock,
} from "lucide-react";
import { api } from "../../api/client";
import logo from "../../assets/marker/logo.png";
import PoiMapPicker from "./PoiMapPicker";
import "./dashboard.css";


const LANGUAGES = [
    { code: "vi", label: "Tiếng Việt", short: "VI" },
    { code: "en", label: "English", short: "EN" },
    { code: "zh", label: "中文", short: "ZH" },
];

function getPoiTranslationRequest(form) {
    return {
        poi: {
            name: form.name.trim(),
            zone: form.zone.trim(),
            category: form.category,
            status: form.isActive ? "active" : "closed",
        },
        descriptionsVi: {
            short: form.translations.vi.short.trim(),
            detail: form.translations.vi.detail.trim(),
        },
    };
}

function getPoiTranslationSource(form) {
    return JSON.stringify({
        name: form.name.trim(),
        zone: form.zone.trim(),
        short: form.translations.vi.short.trim(),
        detail: form.translations.vi.detail.trim(),
    });
}

function mergePoiTranslations(form, translations) {
    const nextTranslations = { ...form.translations };
    const fieldTranslations = {};
    for (const language of ["en", "zh"]) {
        fieldTranslations[language] = {};
        for (const field of ["name", "zone"]) {
            const value = translations?.poi?.[field]?.[language];
            if (typeof value !== "string" || !value.trim()) {
                throw new Error(`Agent chưa dịch trường ${field === "name" ? "tên POI" : "khu vực"} sang ${language.toUpperCase()}`);
            }
            fieldTranslations[language][field] = value.trim();
        }
        nextTranslations[language] = {
            ...nextTranslations[language],
            name: fieldTranslations[language].name,
            zone: fieldTranslations[language].zone,
        };
    }
    nextTranslations.vi = {
        ...nextTranslations.vi,
        name: form.name.trim(),
        zone: form.zone.trim(),
    };
    for (const language of ["en", "zh"]) {
        const translation = translations?.[language];
        if (!translation?.short?.trim() || !translation?.detail?.trim()) {
            throw new Error(`Agent chưa trả về đầy đủ thông tin POI cho ${language.toUpperCase()}`);
        }
        nextTranslations[language] = {
            ...nextTranslations[language],
            short: translation.short.trim(),
            detail: translation.detail.trim(),
        };
    }
    return { ...form, fieldTranslations, translations: nextTranslations };
}

function getPoiTranslations(form) {
    return Object.fromEntries(LANGUAGES.map(({ code }) => [
        code,
        {
            ...form.translations[code],
            name: code === "vi"
                ? form.name.trim()
                : form.fieldTranslations?.[code]?.name || form.translations[code]?.name || null,
            zone: code === "vi"
                ? form.zone.trim()
                : form.fieldTranslations?.[code]?.zone || form.translations[code]?.zone || null,
        },
    ]));
}

function getAudioDuration(file) {
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        let settled = false;
        const timeout = window.setTimeout(
            () => finish(null, new Error("Không đọc được metadata audio; hãy thử file MP3, WAV, OGG, M4A, AAC hoặc WebM hợp lệ.")),
            10000
        );
        const finish = (duration, error) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            URL.revokeObjectURL(url);
            if (error) {
                reject(error);
            } else if (Number.isFinite(duration) && duration > 0) {
                resolve(Math.round(duration));
            } else {
                reject(new Error("Tệp audio không đọc được thời lượng hoặc không phải audio hợp lệ."));
            }
        };
        audio.addEventListener("loadedmetadata", () => finish(audio.duration), { once: true });
        audio.addEventListener(
            "error",
            () => finish(null, new Error("Trình duyệt không phát được tệp audio này. Hãy thử định dạng MP3, WAV, OGG, M4A, AAC hoặc WebM.")),
            { once: true }
        );
        audio.src = url;
    });
}

const CATEGORY_OPTIONS = [
    { value: "animal", labels: { vi: "Động vật", en: "Animal", zh: "动物" } },
    { value: "plant", labels: { vi: "Thực vật", en: "Plant", zh: "植物" } },
    { value: "building", labels: { vi: "Công trình & Cổng", en: "Buildings & gates", zh: "建筑与大门" } },
    { value: "entertainment", labels: { vi: "Vui chơi & Giải trí", en: "Entertainment", zh: "娱乐设施" } },
    { value: "restaurant", labels: { vi: "Nhà hàng & Cà phê", en: "Restaurants & cafés", zh: "餐厅与咖啡馆" } },
    { value: "restroom", labels: { vi: "Nhà vệ sinh", en: "Restrooms", zh: "洗手间" } },
    { value: "service", labels: { vi: "Dịch vụ", en: "Services", zh: "服务设施" } },
    { value: "medical", labels: { vi: "Trạm y tế & Sơ cứu", en: "Medical & first aid", zh: "医疗与急救站" } },
    { value: "photo", labels: { vi: "Điểm check-in", en: "Photo spot", zh: "拍照打卡点" } },
];

const DEFAULT_POI_ZONES = [
    "Lối vào chính", "Lối vào phụ", "Khu di tích lịch sử", "Khu thú lớn", "Khu thú ăn thịt",
    "Khu thú săn mồi", "Khu thú lớn ngập nước", "Khu thú ăn cỏ", "Khu móng guốc", "Khu linh trưởng",
    "Khu chim cảnh", "Vườn thực vật", "Khu trò chơi", "Sân khấu trung tâm", "Điểm Check-in",
    "Dịch vụ vận chuyển", "Ẩm thực & Giải khát", "Tiện ích vệ sinh", "Hỗ trợ y tế",
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
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [iconPickerTab, setIconPickerTab] = useState("animal");
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedPoiSource, setTranslatedPoiSource] = useState("");
    const [poiImages, setPoiImages] = useState([]);
    const poiImagesRef = useRef([]);
    const [removedPoiImageIds, setRemovedPoiImageIds] = useState([]);

    useEffect(() => () => {
        poiImagesRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
        poiImagesRef.current = [];
    }, []);

    /* ---- UC6: Audio ---- */
    const [audioList, setAudioList] = useState([]);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioPoiId, setAudioPoiId] = useState(null);
    const [aiScripts, setAiScripts] = useState({ vi: "", en: "", zh: "" });
    const [aiLang, setAiLang] = useState("vi");
    const [aiTranslationsSource, setAiTranslationsSource] = useState("");
    const [isTranslatingScript, setIsTranslatingScript] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAudio, setGeneratedAudio] = useState(null);
    const [savedGeneratedLanguages, setSavedGeneratedLanguages] = useState([]);
    const [isSavingGeneratedAudio, setIsSavingGeneratedAudio] = useState(false);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const audioFileInputRef = useRef(null);
    const pendingAudioLanguage = useRef(null);
    const pendingAudioPoiId = useRef(null);
    const aiScript = aiScripts[aiLang];

    /* ---- UC7: Analytics ---- */
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [range, setRange] = useState("7d");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    const [exporting, setExporting] = useState(false);
    const [onlineData, setOnlineData] = useState({ total: 0, sessions: [], byLanguage: [], byDevice: [] });

    const getAnalyticsRange = () => {
        if (range === "custom") return { from: customFrom, to: customTo };
        const end = new Date();
        const days = range === "1d" ? 1 : range === "30d" ? 30 : 7;
        const start = new Date(end);
        start.setDate(end.getDate() - days + 1);
        const formatDate = (date) => date.toISOString().slice(0, 10);
        return { from: formatDate(start), to: formatDate(end) };
    };

    /* ---- Helper ---- */
    const showToast = (msg, tone = "ok") => {
        setToast({ msg, tone });
        setTimeout(() => setToast(null), 2600);
    };

    const clearPoiImages = () => {
        poiImagesRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
        poiImagesRef.current = [];
        setPoiImages([]);
        setRemovedPoiImageIds([]);
    };

    const removePoiImage = (index) => {
        const removed = poiImagesRef.current[index];
        if (!removed) return;
        URL.revokeObjectURL(removed.url);
        const remaining = poiImagesRef.current.filter((_, fileIndex) => fileIndex !== index);
        poiImagesRef.current = remaining;
        setPoiImages(remaining);
    };

    /* =========================================================
       LOAD DỮ LIỆU
       ========================================================= */
    useEffect(() => {
        const tracks = generatedAudio?.tracks || [];
        return () => tracks.forEach(({ url }) => URL.revokeObjectURL(url));
    }, [generatedAudio]);

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

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setAnalyticsLoading(true);
            try {
                const data = await api.getAnalytics(getAnalyticsRange());
                if (!cancelled) setAnalytics(data);
            } catch (err) {
                if (!cancelled) console.error("Analytics:", err.message);
            } finally {
                if (!cancelled) setAnalyticsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [range, customFrom, customTo]);

    useEffect(() => {
        if (!audioPoiId) {
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

    /* ---- Polling realtime: user online & thống kê lượt nghe audio mỗi 5s ---- */
    useEffect(() => {
        let cancelled = false;
        const refreshLiveData = async () => {
            try {
                const [online, analyticsData] = await Promise.all([
                    api.getActiveSessions().catch(() => null),
                    api.getAnalytics(getAnalyticsRange()).catch(() => null),
                ]);
                if (!cancelled) {
                    if (online) setOnlineData(online);
                    if (analyticsData) setAnalytics(analyticsData);
                }
            } catch (err) {
                console.debug("Live analytics refresh failed", err);
            }
        };
        refreshLiveData();
        const interval = setInterval(refreshLiveData, 5_000);
        return () => { cancelled = true; clearInterval(interval); };
    }, [currentTab, range, customFrom, customTo]);

    const handleResetUsage = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn đặt lại toàn bộ lượt nghe audio về 0?")) return;
        try {
            await api.resetAudioUsage();
            const data = await api.getAnalytics(getAnalyticsRange());
            setAnalytics(data);
            showToast("Đã đặt lại lượt nghe audio về 0", "success");
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
            emoji: "🦁",
            latitude: "10.787500", longitude: "106.705000",
            mapX: 50, mapY: 50,
            geofenceRadius: 20, isActive: true,
            translations: {
                vi: { short: "", detail: "" },
                en: { short: "", detail: "" },
                zh: { short: "", detail: "" },
            },
        });
        setEditingPoi("new");
        clearPoiImages();
        setPoiLangTab("vi");
        setShowIconPicker(false);
        setTranslatedPoiSource("");
    };

    const startEditPoi = (poi) => {
        setPoiForm({
            ...JSON.parse(JSON.stringify(poi)),
            dbId: poi.dbId,
            emoji: poi.emoji || "",
            mapX: poi.mapX ?? 50,
            mapY: poi.mapY ?? 50,
            translations: { vi: "", en: "", zh: "", ...poi.translations },
        });
        setEditingPoi(poi.id);
        clearPoiImages();
        setPoiLangTab("vi");
        setShowIconPicker(false);
        setTranslatedPoiSource(getPoiTranslationSource(poi));
    };

    const removeExistingPoiImage = (imageId) => {
        setRemovedPoiImageIds((ids) => [...new Set([...ids, imageId])]);
    };

    const handlePoiImageSelect = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        event.target.value = "";
        const retainedImageCount = (poiForm?.images || []).filter(
            (image) => !removedPoiImageIds.includes(image.id)
        ).length;
        if (retainedImageCount + poiImagesRef.current.length + selectedFiles.length > 10) {
            return showToast("Mỗi POI chỉ được chọn tối đa 10 ảnh", "error");
        }
        const invalidFile = selectedFiles.find((file) =>
            !["image/jpeg", "image/png", "image/webp"].includes(file.type)
            || file.size > 8 * 1024 * 1024
        );
        if (invalidFile) {
            return showToast("Chỉ nhận JPEG, PNG hoặc WebP; mỗi ảnh tối đa 8 MB", "error");
        }
        const added = selectedFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        const next = [...poiImagesRef.current, ...added];
        poiImagesRef.current = next;
        setPoiImages(next);
    };

    const validatePoiForm = (f) => {
        if (!f.name.trim()) return "Thiếu tên POI";
        if (!f.zone.trim()) return "Thiếu phân khu";
        if (!f.translations.vi.detail.trim()) return "Thiếu mô tả chi tiết tiếng Việt";
        if (!f.translations.vi.short.trim()) return "Thiếu mô tả ngắn tiếng Việt";
        if (f.geofenceRadius < 5 || f.geofenceRadius > 200) return "Bán kính geofence phải trong khoảng 5–200m";
        if (f.mapX < 0 || f.mapX > 100 || f.mapY < 0 || f.mapY > 100) return "Toạ độ bản đồ X/Y phải trong khoảng 0–100";
        return null;
    };

    const savePoi = async () => {
        const err = validatePoiForm(poiForm);
        if (err) return showToast(err, "error");

        setSavingPoi(true);
        try {
            let poiToExport = poiForm;
            if (translatedPoiSource !== getPoiTranslationSource(poiForm)) {
                const result = await api.translatePoi(getPoiTranslationRequest(poiForm));
                poiToExport = mergePoiTranslations(poiForm, result.translations);
            }
            const poiData = { ...poiToExport, translations: getPoiTranslations(poiToExport) };

            if (editingPoi === "new") {
                await api.createPoi(
                    poiData,
                    poiImages.map(({ file }) => file)
                );
                clearPoiImages();
                setEditingPoi(null);
                setPoiForm(null);
                showToast("Đã lưu POI, bản dịch và ảnh vào hệ thống");
                try {
                    setPoiList(await api.getPois());
                } catch (refreshError) {
                    showToast(`POI đã lưu nhưng không thể tải lại danh sách: ${refreshError.message}`, "error");
                }
                return;
            } else {
                const result = await api.updatePoi(
                    poiForm.dbId,
                    poiData,
                    poiImages.map(({ file }) => file),
                    removedPoiImageIds
                );
                clearPoiImages();
                setEditingPoi(null);
                setPoiForm(null);
                try {
                    setPoiList(await api.getPois());
                    showToast(result.warning || "Đã cập nhật POI", result.warning ? "error" : "ok");
                } catch (refreshError) {
                    showToast(
                        `POI đã cập nhật${result.warning ? `; ${result.warning}` : ""}, nhưng không thể tải lại danh sách: ${refreshError.message}`,
                        "error"
                    );
                }
                return;
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSavingPoi(false);
        }
    };

    const deletePoi = async (poi) => {
        if (!window.confirm(`Xoá POI "${poi.name}"? Ảnh và audio liên quan cũng sẽ bị gỡ.`)) return;
        try {
            const result = await api.deletePoi(poi.dbId);
            const list = await api.getPois();
            setPoiList(list);
            if (audioPoiId === poi.dbId) {
                setAudioPoiId(list[0]?.dbId || null);
            }
            showToast(result.warning || "Đã xoá POI", result.warning ? "error" : "ok");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleAiTranslate = async () => {
        if (!poiForm.translations.vi.short.trim()) {
            return showToast("Cần nhập mô tả ngắn tiếng Việt trước khi dịch", "error");
        }
        if (!poiForm.translations.vi.detail.trim()) {
            return showToast("Cần nhập mô tả chi tiết tiếng Việt trước khi dịch", "error");
        }
        setIsTranslating(true);
        try {
            const result = await api.translatePoi(getPoiTranslationRequest(poiForm));
            const translatedForm = mergePoiTranslations(poiForm, result.translations);
            setPoiForm(translatedForm);
            setTranslatedPoiSource(getPoiTranslationSource(poiForm));
            showToast("Agent đã dịch thông tin POI và mô tả sang tiếng Anh, tiếng Trung");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsTranslating(false);
        }
    };

    /* =========================================================
       UC6 — AUDIO
       ========================================================= */
    const reloadAudio = async () => {
        if (!audioPoiId) return;
        const data = await api.getAudio(audioPoiId);
        setAudioList(data);
    };

    const uploadAudio = async (lang) => {
        if (!audioPoiId) return showToast("Chọn POI trước", "error");
        pendingAudioLanguage.current = lang;
        pendingAudioPoiId.current = audioPoiId;
        audioFileInputRef.current?.click();
    };

    const handleAudioFileSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        const language = pendingAudioLanguage.current;
        const poiDbId = pendingAudioPoiId.current;
        pendingAudioLanguage.current = null;
        pendingAudioPoiId.current = null;
        if (!file || !language || !poiDbId) return;
        if (file.size > 30 * 1024 * 1024) {
            return showToast("Tệp audio không được vượt quá 30 MB", "error");
        }

        setIsUploadingAudio(true);
        try {
            const duration = await getAudioDuration(file);
            const result = await api.createAudio({
                poiDbId,
                language,
                source: "upload",
                duration,
            }, file, file.name);
            if (audioPoiId === poiDbId) await reloadAudio();
            showToast(
                result.warning || `Đã lưu audio ${language.toUpperCase()} vào database`,
                result.warning ? "error" : "ok"
            );
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsUploadingAudio(false);
        }
    };

    const translateAudioScript = async () => {
        if (!aiScripts.vi.trim()) return showToast("Nhập kịch bản tiếng Việt trước khi dịch", "error");

        setIsTranslatingScript(true);
        try {
            const response = await api.translateAudioScript(aiScripts.vi);
            const translations = response.translations;
            if (!translations?.en?.trim() || !translations?.zh?.trim()) {
                throw new Error("Agent chưa trả về đầy đủ bản dịch tiếng Anh và tiếng Trung");
            }
            setAiScripts((previous) => ({
                ...previous,
                en: translations.en.trim(),
                zh: translations.zh.trim(),
            }));
            setAiTranslationsSource(aiScripts.vi.trim());
            showToast("Đã dịch kịch bản sang tiếng Anh và tiếng Trung");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsTranslatingScript(false);
        }
    };

    const generateAiAudio = async () => {
        const sourceScript = aiScripts.vi.trim();
        if (!sourceScript) return showToast("Nhập kịch bản tiếng Việt trước khi tạo 3 audio", "error");
        if (!audioPoiId) return showToast("Chọn POI trước", "error");

        setIsGenerating(true);
        const poiDbId = audioPoiId;
        setGeneratedAudio(null);
        setSavedGeneratedLanguages([]);
        const tracks = [];
        try {
            let scripts = aiScripts;
            if (aiTranslationsSource !== sourceScript) {
                const response = await api.translateAudioScript(sourceScript);
                const translations = response.translations;
                if (!translations?.en?.trim() || !translations?.zh?.trim()) {
                    throw new Error("Agent chưa trả về đầy đủ bản dịch tiếng Anh và tiếng Trung");
                }
                scripts = {
                    vi: sourceScript,
                    en: translations.en.trim(),
                    zh: translations.zh.trim(),
                };
                setAiScripts(scripts);
                setAiTranslationsSource(sourceScript);
            }

            for (const { code } of LANGUAGES) {
                const audio = await api.generateAudio(scripts[code].trim(), code);
                const blob = audio.type ? audio : new Blob([audio], { type: "audio/mpeg" });
                const duration = await getAudioDuration(blob);
                const url = URL.createObjectURL(blob);
                tracks.push({ language: code, blob, url, duration });
            }

            setGeneratedAudio({ poiDbId, tracks });
            showToast("Đã tạo 3 audio. Nghe thử rồi bấm Lưu audio nếu đồng ý.");
        } catch (err) {
            if (tracks.length) setGeneratedAudio({ poiDbId, tracks });
            showToast(
                tracks.length
                    ? `Mới tạo được ${tracks.length}/3 audio; nghe thử bản đã tạo hoặc thử tạo lại. ${err.message}`
                    : err.message,
                "error"
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const saveGeneratedAudio = async () => {
        if (!generatedAudio?.tracks.length) return;
        if (audioPoiId !== generatedAudio.poiDbId) {
            return showToast("POI đang chọn đã thay đổi; hãy chọn lại POI của audio preview trước khi lưu.", "error");
        }

        setIsSavingGeneratedAudio(true);
        const savedLanguages = [];
        const savedLanguageSet = new Set(savedGeneratedLanguages);
        try {
            for (const track of generatedAudio.tracks) {
                if (savedLanguageSet.has(track.language)) continue;
                await api.createAudio({
                    poiDbId: generatedAudio.poiDbId,
                    language: track.language,
                    source: "ai",
                    duration: track.duration,
                }, track.blob, `poi-audio-${track.language}.mp3`);
                savedLanguages.push(track.language.toUpperCase());
                savedLanguageSet.add(track.language);
                setSavedGeneratedLanguages([...savedLanguageSet]);
            }
            setGeneratedAudio(null);
            setSavedGeneratedLanguages([]);
            try {
                await reloadAudio();
                showToast(`Đã lưu audio ${generatedAudio.tracks.map(({ language }) => language.toUpperCase()).join(", ")} vào POI`);
            } catch (refreshError) {
                showToast(`Đã lưu audio nhưng không tải lại được danh sách: ${refreshError.message}`, "error");
            }
        } catch (err) {
            let message = savedLanguages.length
                ? `Đã lưu ${savedLanguages.join(", ")}; không lưu được các audio còn lại: ${err.message}`
                : err.message;
            try {
                await reloadAudio();
            } catch (refreshError) {
                message += ` Không tải lại được danh sách audio: ${refreshError.message}`;
            }
            showToast(message, "error");
        } finally {
            setIsSavingGeneratedAudio(false);
        }
    };

    const removeTrack = async (track) => {
        if (!window.confirm(`Gỡ audio ${track.language.toUpperCase()}?`)) return;
        try {
            const result = await api.deleteAudio(track.dbId);
            await reloadAudio();
            showToast(result.warning || "Đã gỡ audio track", result.warning ? "error" : "ok");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    /* =========================================================
       UC7 — EXPORT
       ========================================================= */
    const handleExport = async (fmt) => {
        setExporting(true);
        try {
            const blob = await api.exportAnalytics(getAnalyticsRange());
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `analytics-${fmt.toLowerCase()}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            showToast(`Đã tải báo cáo ${fmt}`);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setExporting(false);
        }
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
                    <div className="admin-dash__logo">
                        <img src={logo} alt="Thảo Cầm Viên Sài Gòn" />
                    </div>
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
                                        {analytics ? analytics.totalPlays.toLocaleString() : "0"}
                                    </div>
                                    <div className="stat-card__label">Lượt nghe audio (tổng)</div>
                                    <div className="stat-card__foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Tỉ lệ hoàn thành ≥80%: {analytics ? `${analytics.completedRate}%` : "0%"}</span>
                                        <button
                                            type="button"
                                            onClick={handleResetUsage}
                                            title="Đặt lại thống kê lượt nghe về 0"
                                            style={{
                                                background: 'none', border: 'none', color: '#94a3b8',
                                                cursor: 'pointer', fontSize: 11, display: 'inline-flex',
                                                alignItems: 'center', gap: 3, padding: '2px 4px',
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                                            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
                                        >
                                            <RefreshCw size={11} /> Reset
                                        </button>
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
                                        {poiList.filter((p) => LANGUAGES.every((l) => p.translations?.[l.code]?.detail)).length} POI đủ 3 ngôn ngữ
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
                                        <div className="stat-card__icon stat-card__icon--green"><Users size={20} /></div>
                                        <span className="stat-card__trend stat-card__trend--up" style={{ gap: 4 }}>
                                            <span style={{
                                                width: 7, height: 7, borderRadius: '50%',
                                                background: onlineData.total > 0 ? '#16a34a' : '#f59e0b',
                                                animation: onlineData.total > 0 ? 'pulse 1.5s ease infinite' : 'none',
                                            }} />
                                            Live
                                        </span>
                                    </div>
                                    <div className="stat-card__value">
                                        {onlineData.total}
                                    </div>
                                    <div className="stat-card__label">Người dùng đang online</div>
                                    <div className="stat-card__foot">
                                        Cập nhật mỗi 30s • Heartbeat
                                    </div>
                                </div>
                            </div>

                            {/* ---- Card: Người dùng đang online ---- */}
                            <div className="dash-card" style={{ marginBottom: 16 }}>
                                <div className="dash-card__head">
                                    <div>
                                        <h3 className="dash-card__title">
                                            <Users size={17} className="text-emerald" />{" "}
                                            Người dùng đang có mặt
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                marginLeft: 10, padding: '2px 10px',
                                                background: onlineData.total > 0 ? '#dcfce7' : '#fef3c7',
                                                color: onlineData.total > 0 ? '#16a34a' : '#92400e',
                                                borderRadius: 20, fontSize: 12, fontWeight: 700,
                                            }}>
                                                <span style={{
                                                    width: 8, height: 8, borderRadius: '50%',
                                                    background: onlineData.total > 0 ? '#16a34a' : '#f59e0b',
                                                    animation: onlineData.total > 0 ? 'pulse 1.5s ease infinite' : 'none',
                                                }} />
                                                {onlineData.total} online
                                            </span>
                                        </h3>
                                        <p className="dash-card__desc">Cập nhật tự động mỗi 30 giây • Dựa trên heartbeat ping từ trình duyệt</p>
                                    </div>
                                </div>
                                <div className="dash-card__body">
                                    {onlineData.total === 0 ? (
                                        <div style={{ textAlign: 'center', padding: 20, color: 'var(--dash-text-3)' }}>
                                            Hiện không có người dùng nào đang truy cập
                                        </div>
                                    ) : (
                                        <>
                                            {/* Breakdown theo ngôn ngữ & thiết bị */}
                                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
                                                <div>
                                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Theo ngôn ngữ</div>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {onlineData.byLanguage.map((item) => (
                                                            <span key={item.lang} style={{
                                                                padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                                background: item.lang === 'vi' ? '#dbeafe' : item.lang === 'en' ? '#fef3c7' : '#fce7f3',
                                                                color: item.lang === 'vi' ? '#1d4ed8' : item.lang === 'en' ? '#92400e' : '#be185d',
                                                            }}>
                                                                {item.lang === 'vi' ? '🇻🇳' : item.lang === 'en' ? '🇬🇧' : '🇨🇳'} {item.lang.toUpperCase()}: {item.c}
                                                            </span>
                                                        ))}
                                                    </div>
                                    {range === "custom" && (
                                        <div className="analytics-date-range">
                                            <label>Từ <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} /></label>
                                            <label>Đến <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} /></label>
                                        </div>
                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Theo thiết bị</div>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {onlineData.byDevice.map((item) => (
                                                            <span key={item.device} style={{
                                                                padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                                background: '#f1f5f9', color: '#334155',
                                                            }}>
                                                                {item.device === 'web' ? '🌐' : '📱'} {item.device}: {item.c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bảng chi tiết */}
                                            <div className="table-responsive">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Session</th>
                                                            <th>Ngôn ngữ</th>
                                                            <th>Thiết bị</th>
                                                            <th>Trạng thái</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {onlineData.sessions.map((s, i) => (
                                                            <tr key={i}>
                                                                <td><code style={{ fontSize: 11 }}>{s.sessionId}</code></td>
                                                                <td>
                                                                    <span style={{
                                                                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                                                                        background: s.language === 'vi' ? '#dbeafe' : s.language === 'en' ? '#fef3c7' : '#fce7f3',
                                                                        color: s.language === 'vi' ? '#1d4ed8' : s.language === 'en' ? '#92400e' : '#be185d',
                                                                    }}>
                                                                        {s.language.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td style={{ fontSize: 12 }}>{s.device === 'web' ? '🌐 Web' : s.device}</td>
                                                                <td>
                                                                    <span style={{
                                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                        padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                                                                        background: s.idleSec < 35 ? '#dcfce7' : '#fef9c3',
                                                                        color: s.idleSec < 35 ? '#16a34a' : '#a16207',
                                                                    }}>
                                                                        <span style={{
                                                                            width: 6, height: 6, borderRadius: '50%',
                                                                            background: s.idleSec < 35 ? '#16a34a' : '#f59e0b',
                                                                        }} />
                                                                        {s.idleSec < 5 ? 'Đang hoạt động' : `${s.idleSec}s trước`}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="dash-grid-2">
                                <div className="dash-card">
                                    <div className="dash-card__head">
                                        <h3 className="dash-card__title"><Languages size={17} className="text-emerald" /> Phân bổ ngôn ngữ sử dụng</h3>
                                        <p className="dash-card__desc">Dựa trên USAGE_LOG — language_code</p>
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
                                        <h3 className="dash-card__title"><Activity size={17} className="text-amber" /> Top POI được nghe nhiều nhất</h3>
                                        <p className="dash-card__desc">Lượt auto-play + manual play</p>
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
                                            {c.labels.vi} ({poiList.filter((p) => p.category === c.value).length})
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
                                                const tr = p.translations || {};
                                                const doneLangs = LANGUAGES.filter((l) => tr[l.code]?.detail);
                                                return (
                                                    <tr key={p.id}>
                                                        <td><span className="code-badge">{p.id}</span></td>
                                                        <td>
                                                            <div className="table-item-title">
                                                                <span style={{ fontSize: 18 }}>{p.emoji || (p.category === "plant" ? "🌿" : p.category === "facility" || p.category === "building" ? "🏛️" : "🦁")}</span>
                                                                <div>
                                                                    <div className="font-semibold text-slate-100">{p.name}</div>
                                                                    <div className="text-xs text-slate-400">{p.zone}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="category-pill">
                                                                {CATEGORY_OPTIONS.find((c) => c.value === p.category)?.labels.vi || p.category}
                                                            </span>
                                                        </td>
                                                        <td><code>{p.latitude}, {p.longitude}</code></td>
                                                        <td><code>{p.geofenceRadius} m</code></td>
                                                        <td>
                                                            <div style={{ display: "flex", gap: 4 }}>
                                                                {LANGUAGES.map((l) => {
                                                                    const done = !!tr[l.code]?.detail;
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
                                </div>
                                <div className="admin-tab-actions">
                                    <select
                                        value={audioPoiId || ""}
                                        onChange={(e) => {
                                            setAudioPoiId(+e.target.value || null);
                                            setGeneratedAudio(null);
                                            setSavedGeneratedLanguages([]);
                                        }}
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
                                        {currentAudioPoi.geofenceRadius}m • {LANGUAGES.filter((l) => currentAudioPoi.translations?.[l.code]?.detail).length}/3 ngôn ngữ đã có mô tả
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

                            <input
                                ref={audioFileInputRef}
                                type="file"
                                accept="audio/*,video/mp4,.mp3,.wav,.ogg,.m4a,.aac,.webm"
                                hidden
                                onChange={handleAudioFileSelect}
                            />
                            <div className="audio-grid">
                                {LANGUAGES.map((lang) => {
                                    const track = audioByPoi.find((a) => a.language === lang.code);
                                    const previewTrack = generatedAudio?.poiDbId === audioPoiId
                                        ? generatedAudio.tracks.find((audio) => audio.language === lang.code)
                                        : null;
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
                                                        <button className="btn-secondary-admin" onClick={() => uploadAudio(lang.code)} disabled={!audioPoiId || isUploadingAudio}>
                                                            <Upload size={14} /> {isUploadingAudio ? "Đang tải..." : "Upload file"}
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="audio-track__meta">
                                                        <span><Clock size={12} /> {track.duration ? `${track.duration}s` : "—"}</span>
                                                        <span><FileAudio size={12} /> {track.sizeMb ?? "—"} MB</span>
                                                        <span><Mic size={12} /> {track.source === "ai" ? "AI TTS" : "Upload"}</span>
                                                    </div>
                                                    <div className="audio-track__source">Đã có trong database — có thể thay thế hoặc xóa.</div>

                                                    <div className="audio-player">
                                                        {track.fileUrl
                                                            ? <audio controls preload="none" src={track.fileUrl} aria-label={`Nghe audio ${lang.label}`} />
                                                            : <span className="text-xs text-slate-400">Chưa có tệp audio.</span>}
                                                    </div>

                                                    <div className="audio-track__actions">
                                                        <button className="btn-secondary-admin" onClick={() => uploadAudio(lang.code)} disabled={!audioPoiId || isUploadingAudio}>
                                                            <RefreshCw size={14} /> Thay thế
                                                        </button>
                                                        <button className="btn-action-delete" onClick={() => removeTrack(track)} title="Gỡ">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {previewTrack && (
                                                <div className="audio-preview">
                                                    <div className="audio-track__meta">
                                                        <span><Sparkles size={12} /> AI preview — chưa lưu</span>
                                                        <span><Clock size={12} /> {previewTrack.duration}s</span>
                                                    </div>
                                                    <div className="audio-player">
                                                        <audio
                                                            controls
                                                            preload="metadata"
                                                            src={previewTrack.url}
                                                            aria-label={`Nghe thử audio ${lang.label}`}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {generatedAudio?.tracks.length > 0 && generatedAudio.poiDbId === audioPoiId && (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                                    <button
                                        className="btn-primary-admin"
                                        onClick={saveGeneratedAudio}
                                        disabled={isSavingGeneratedAudio || isGenerating}
                                    >
                                        {isSavingGeneratedAudio
                                            ? <><span className="btn-spinner" /> Đang lưu...</>
                                            : <><Save size={14} /> Lưu / thay thế audio</>}
                                    </button>
                                    <button
                                        className="btn-secondary-admin"
                                        onClick={() => {
                                            setGeneratedAudio(null);
                                            setSavedGeneratedLanguages([]);
                                        }}
                                        disabled={isSavingGeneratedAudio}
                                    >
                                        Bỏ preview
                                    </button>
                                    <span className="audio-track__source">
                                        Nghe thử từng ngôn ngữ ở các thẻ phía trên; lưu sẽ cập nhật các audio tương ứng.
                                    </span>
                                </div>
                            )}

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
                                            Nhập kịch bản tiếng Việt rồi tạo 3 bản để nghe thử trong các thẻ ngôn ngữ phía trên. Audio chỉ được lưu vào POI sau khi bạn bấm nút Lưu màu xanh.
                                        </div>
                                    </div>
                                    <div className="script-box">
                                        <textarea
                                            rows={5}
                                            maxLength={5000}
                                            placeholder={aiLang === "vi"
                                                ? "Ví dụ: Chào mừng bạn đến với khu Voi Châu Á của Thảo Cầm Viên Sài Gòn..."
                                                : `Nhập hoặc dịch kịch bản sang ${aiLang.toUpperCase()}...`}
                                            value={aiScript}
                                            onChange={(e) => {
                                                setGeneratedAudio(null);
                                                setSavedGeneratedLanguages([]);
                                                setAiScripts((previous) => ({
                                                    ...previous,
                                                    [aiLang]: e.target.value,
                                                }));
                                                if (aiLang === "vi") setAiTranslationsSource("");
                                            }}
                                            style={{
                                                width: "100%", padding: 12, borderRadius: 10,
                                                border: "1px solid var(--dash-border)",
                                                fontFamily: "inherit", fontSize: 13, resize: "vertical",
                                            }}
                                        />
                                        <span className="script-box__count">{aiScript.length} ký tự</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                        <button className="btn-secondary-admin" onClick={translateAudioScript}
                                            disabled={isTranslatingScript || isGenerating || !aiScripts.vi.trim()}>
                                            {isTranslatingScript ? <><span className="btn-spinner" /> Đang dịch...</> : <><Languages size={14} /> Dịch VI → EN/ZH</>}
                                        </button>
                                        <button className="btn-ai" onClick={generateAiAudio} disabled={isGenerating || isTranslatingScript || !currentAudioPoi || !aiScripts.vi.trim()}>
                                            {isGenerating ? <><span className="btn-spinner" /> Đang tạo 3 audio...</> : <><Sparkles size={14} /> Tạo 3 audio để nghe thử</>}
                                        </button>
                                        <button className="btn-secondary-admin" onClick={() => {
                                            setAiScripts({ vi: "", en: "", zh: "" });
                                            setAiTranslationsSource("");
                                            setGeneratedAudio(null);
                                            setSavedGeneratedLanguages([]);
                                        }} disabled={isGenerating || isTranslatingScript}>
                                            Xoá tất cả kịch bản
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* ================= MODAL POI (UC5) ================= */}
            {editingPoi && poiForm && (
                <div className="admin-modal-backdrop" onClick={() => !savingPoi && (setEditingPoi(null), setPoiForm(null), clearPoiImages())}>
                    <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__head">
                            <div>
                                <h2 className="admin-modal__title">
                                    {editingPoi === "new" ? "Thêm POI mới" : `Chỉnh sửa ${poiForm.id}`}
                                </h2>
                                <p className="admin-modal__desc">
                                    Nhập thông tin POI và mô tả tiếng Việt; agent sẽ dịch tên, khu vực và mô tả sang EN/ZH. POI cùng ảnh sẽ được lưu vào database và Supabase Storage.
                                </p>
                            </div>
                            <button className="clear-btn" onClick={() => { setEditingPoi(null); setPoiForm(null); clearPoiImages(); }} disabled={savingPoi}>
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
                                            {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.labels.vi}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 14, position: 'relative' }}>
                                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Icon / Emoji đại diện</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {/* Preview + Trigger Button */}
                                        <button
                                            type="button"
                                            disabled={savingPoi}
                                            onClick={() => { setShowIconPicker((v) => !v); setIconPickerTab('animal'); }}
                                            title="Bấm để chọn icon"
                                            style={{
                                                width: 52, height: 52, borderRadius: 14,
                                                background: showIconPicker ? '#dcfce7' : '#f8fafc',
                                                border: showIconPicker ? '2px solid #16a34a' : '2px solid #cbd5e1',
                                                fontSize: 28, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: showIconPicker ? '0 0 0 3px #bbf7d0' : '0 2px 4px rgba(0,0,0,0.06)',
                                                transition: 'all .15s',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {poiForm.emoji || '📍'}
                                        </button>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 3 }}>Icon hiện tại — bấm ô để mở bảng chọn</div>
                                            <input
                                                type="text"
                                                value={poiForm.emoji || ''}
                                                placeholder="Hoặc dán emoji bất kỳ vào đây…"
                                                maxLength={8}
                                                onChange={(e) => setPoiForm({ ...poiForm, emoji: e.target.value })}
                                                disabled={savingPoi}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        {poiForm.emoji && (
                                            <button
                                                type="button" className="btn-outline-admin"
                                                style={{ padding: '6px 10px', fontSize: 11, flexShrink: 0 }}
                                                onClick={() => { setPoiForm({ ...poiForm, emoji: '' }); setShowIconPicker(false); }}
                                            >Xoá</button>
                                        )}
                                    </div>

                                    {/* Popup Picker */}
                                    {showIconPicker && (
                                        <div
                                            style={{
                                                position: 'absolute', top: '100%', left: 0, zIndex: 9999,
                                                width: 380, marginTop: 6,
                                                background: '#fff',
                                                border: '1.5px solid #e2e8f0',
                                                borderRadius: 14,
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                                overflow: 'hidden',
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Close bar */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>🎨 Chọn icon cho POI</span>
                                                <button type="button" onClick={() => setShowIconPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', lineHeight: 1 }}>×</button>
                                            </div>
                                            {/* Tabs */}
                                            <div style={{ display: 'flex', gap: 2, padding: '6px 8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                {[

                                                    { key: 'animal', label: '🐾 Động vật' },
                                                    { key: 'plant', label: '🌿 Thực vật' },
                                                    { key: 'facility', label: '🏛️ Tiện ích' },
                                                    { key: 'nature', label: '🌈 Khác' },
                                                ].map((tab) => (
                                                    <button
                                                        key={tab.key} type="button"
                                                        onClick={() => setIconPickerTab(tab.key)}
                                                        style={{
                                                            flex: 1, padding: '5px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                                                            cursor: 'pointer', border: 'none',
                                                            background: iconPickerTab === tab.key ? '#16a34a' : 'transparent',
                                                            color: iconPickerTab === tab.key ? '#fff' : '#475569',
                                                            transition: 'all .12s',
                                                        }}
                                                    >{tab.label}</button>
                                                ))}
                                            </div>
                                            {/* Grid */}
                                            <div style={{ padding: '10px 10px', display: 'flex', flexWrap: 'wrap', gap: 5, maxHeight: 220, overflowY: 'auto' }}>
                                                {({
                                                    animal: ["🐘","🦁","🐯","🦒","🦛","🐻","🐒","🦍","🦧","🐺","🦊","🐗","🐴","🦓","🦌","🦬","🐮","🐷","🐏","🐑","🐐","🦙","🦘","🦥","🦦","🦨","🦡","🦔","🐼","🐨","🐸","🦎","🐊","🐢","🐍","🦕","🦖","🐉","🦩","🦚","🦜","🦅","🦆","🐦","🕊️","🦤","🦢","🐧","🦉","🦇","🐠","🐟","🐬","🐳","🦭","🦑","🦞","🦀","🐙","🦋","🐝","🪲","🐛","🦗","🕷️"],
                                                    plant: ["🌿","🌳","🌲","🌴","🌵","🎋","🎍","🌾","🍀","🍃","🍂","🍁","🌱","🪴","🎄","🌸","🌺","🌻","🌹","🌷","💐","🌼","🏵️","🌙","🍄","🪨","🪵","🌊","🪸","🌏","🌿","🧅","🧄","🥬","🥦","🍃"],
                                                    facility: ["🏛️","🏯","🏰","⛩️","🗺️","🎡","🎢","🎠","🎭","🎪","🎨","🖼️","🍔","🍕","🌮","🍜","☕","🧃","🍦","🍰","🚻","🚺","🚹","🛒","🏪","🏥","🩺","💊","🚑","🚂","🚃","🚗","🛵","🚲","🛺","⛽","📸","📷","🎥","ℹ️","🪧","🔭","🎟️","🎫","🔑","🗝️","🚪","🏠","🛖","⛺","🌐","📍","📌","🧭"],
                                                    nature: ["⭐","🌟","✨","💫","🔥","🌈","☀️","🌤️","⛅","🌦️","🌧️","🌩️","❄️","🌬️","🌀","🌊","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏞️","🪐","🌌","🎇","🎆","❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💯","🎯","🏆","🥇","🎖️","🏅"]
                                                })[iconPickerTab]?.map((icon) => (
                                                    <button
                                                        key={icon} type="button"
                                                        onClick={() => { setPoiForm({ ...poiForm, emoji: icon }); setShowIconPicker(false); }}
                                                        title={icon}
                                                        style={{
                                                            width: 36, height: 36, fontSize: 20, cursor: 'pointer',
                                                            borderRadius: 8,
                                                            background: poiForm.emoji === icon ? '#dcfce7' : '#f8fafc',
                                                            border: poiForm.emoji === icon ? '2px solid #16a34a' : '1.5px solid #e2e8f0',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'transform .1s',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >{icon}</button>
                                                ))}
                                            </div>
                                            <div style={{ padding: '6px 12px 10px', borderTop: '1px solid #f1f5f9', fontSize: 11, color: '#94a3b8' }}>
                                                Bấm icon để chọn — bấm ngoài để đóng
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay to close picker on outside click */}
                                    {showIconPicker && (
                                        <div
                                            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                                            onClick={() => setShowIconPicker(false)}
                                        />
                                    )}
                                </div>

                                <div className="form-row-2" style={{ marginBottom: 12 }}>
                                    <div className="form-group">
                                        <label>Tên POI</label>
                                        <input type="text" value={typeof poiForm.name === "string" ? poiForm.name : poiForm.name.vi}
                                            placeholder="VD: Chuồng Hổ Bengal"
                                            onChange={(e) => setPoiForm({ ...poiForm, name: e.target.value })}
                                            disabled={savingPoi} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phân khu</label>
                                        <select
                                            value={typeof poiForm.zone === "string" ? poiForm.zone : poiForm.zone.vi}
                                            onChange={(e) => setPoiForm({ ...poiForm, zone: e.target.value, translations: { ...poiForm.translations, en: { ...poiForm.translations.en, zone: "" }, zh: { ...poiForm.translations.zh, zone: "" } } })}
                                            disabled={savingPoi}
                                        >
                                            <option value="">-- Chọn khu vực --</option>
                                            {[...new Set([...DEFAULT_POI_ZONES, ...poiList.map((poi) => typeof poi.zone === "string" ? poi.zone : poi.zone?.vi).filter(Boolean)])]
                                                .map((zone) => <option key={zone} value={zone}>{zone}</option>)}
                                        </select>
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
                                        const done = !!(poiForm.translations[l.code]?.detail || "").trim();
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
                                        {isTranslating ? <><span className="btn-spinner" /> Agent đang dịch...</> : <><Sparkles size={14} /> Dịch bằng AI</>}
                                    </button>
                                </div>

                                {/* Mô tả ngắn */}
                                <div className="form-group">
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
                                    <span className="field-hint">
                                        Ngôn ngữ mặc định của hệ thống là Tiếng Việt (dùng khi bản dịch ngôn ngữ khác chưa có).
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label>Chọn vị trí trên bản đồ</label>
                                </div>
                                <PoiMapPicker
                                    mapX={poiForm.mapX}
                                    mapY={poiForm.mapY}
                                    geofenceRadius={poiForm.geofenceRadius}
                                    disabled={savingPoi}
                                    onChange={({ mapX, mapY }) =>
                                        setPoiForm((current) => ({ ...current, mapX, mapY }))
                                    }
                                />

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

                        <section className="poi-image-uploader">
                            <div className="poi-image-uploader__head">
                                <div>
                                    <h3>Ảnh POI</h3>
                                    <p>
                                        Thêm hoặc xóa ảnh; tối đa 10 ảnh JPEG, PNG hoặc WebP, mỗi ảnh không quá 8 MB.
                                        {" "}Đang có {(poiForm.images || []).filter((image) => !removedPoiImageIds.includes(image.id)).length + poiImages.length}/10 ảnh.
                                    </p>
                                </div>
                                <label className="btn-secondary-admin poi-image-uploader__select">
                                    <Upload size={14} /> Chọn ảnh
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={handlePoiImageSelect}
                                        disabled={savingPoi}
                                    />
                                </label>
                            </div>
                            {(poiForm.images || []).length > 0 || poiImages.length > 0 ? (
                                <div className="poi-image-grid">
                                    {(poiForm.images || []).map((image) => {
                                        const isRemoved = removedPoiImageIds.includes(image.id);
                                        return (
                                            <div className={`poi-image-preview ${isRemoved ? "is-removed" : ""}`} key={`saved-${image.id}`}>
                                                <img src={image.url} alt={image.alt || poiForm.name} />
                                                <span title={image.alt || image.url}>{isRemoved ? "Sẽ xóa khi lưu" : "Ảnh đã lưu"}</span>
                                                <button
                                                    type="button"
                                                    aria-label={isRemoved ? "Khôi phục ảnh" : "Xóa ảnh"}
                                                    title={isRemoved ? "Khôi phục ảnh" : "Xóa ảnh"}
                                                    onClick={() => isRemoved
                                                        ? setRemovedPoiImageIds((ids) => ids.filter((id) => id !== image.id))
                                                        : removeExistingPoiImage(image.id)}
                                                    disabled={savingPoi}
                                                >
                                                    {isRemoved ? <RefreshCw size={13} /> : <X size={14} />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {poiImages.map(({ file, url }, index) => (
                                        <div className="poi-image-preview" key={`${file.name}-${file.lastModified}-${index}`}>
                                            <img src={url} alt={file.name} />
                                            <span title={file.name}>{file.name}</span>
                                            <button
                                                type="button"
                                                aria-label={`Bỏ ảnh ${file.name}`}
                                                onClick={() => removePoiImage(index)}
                                                disabled={savingPoi}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="poi-image-uploader__empty">POI chưa có ảnh. Chọn ảnh để tải lên.</p>
                            )}
                        </section>

                        <div className="admin-modal__foot">
                            <button className="btn-secondary-admin"
                                onClick={() => { setEditingPoi(null); setPoiForm(null); clearPoiImages(); }}
                                disabled={savingPoi}>
                                Huỷ
                            </button>
                            <button className="btn-primary-admin" onClick={savePoi} disabled={savingPoi || isTranslating}>
                                {savingPoi ? (
                                    <><span className="btn-spinner" /> Đang xử lý...</>
                                ) : (
                                    <><Save size={16} /> {editingPoi === "new" ? "Dịch & lưu POI" : "Lưu POI"}</>
                                )}
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