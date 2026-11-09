const isRemoteHost = typeof window !== "undefined" && window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const envBase = import.meta.env.VITE_API_BASE_URL;
const BASE = (isRemoteHost && (!envBase || envBase.includes("localhost") || envBase.includes("127.0.0.1")))
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : (envBase || "http://localhost:5000/api");
const TRANSLATION_API_URL = (
    import.meta.env.VITE_TRANSLATION_API_URL || "https://cnpm-y6l5.onrender.com"
).replace(/\/+$/, "");

function getToken() {
    return localStorage.getItem("admin_token");
}

async function request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.detail || "Lỗi API");
    return data;
}

async function requestFormData(path, formData, method = "POST") {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.detail || "Lỗi API");
    return data;
}

async function requestTranslation(path, body) {
    const res = await fetch(`${TRANSLATION_API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.detail || data.error || "Không gọi được translation agent");
    }
    return data;
}

async function requestAgentAudio(path, body) {
    const res = await fetch(`${TRANSLATION_API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || "Không tạo được audio");
    }
    if (!contentType.toLowerCase().startsWith("audio/")) {
        throw new Error("Translation agent không trả về tệp audio hợp lệ.");
    }
    return res.blob();
}

async function requestRoute(from, to, language) {
    const params = new URLSearchParams({ from, to, lang: language });
    const res = await fetch(`${BASE}/route?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.message || data.error || "");
        error.code = data.code;
        throw error;
    }
    return data;
}

export const offlineDownloadUrl = (language = "vi") =>
    `${BASE}/offline/download?lang=${encodeURIComponent(language)}&platform=web`;

export const api = {

    // Offline Package
    getOfflinePackageMetadata: () => request("/offline"),

    // UC4 - Auth
    login: (email, password) =>
        request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => request("/auth/logout", { method: "POST" }),

    // UC5 - POI
    getPois: () => request("/pois"),
    getPublicPois: (language = "vi") =>
        request(`/pois/public?lang=${encodeURIComponent(language)}`),
    getPublicAudio: (poiCode, language = "vi") =>
        request(`/audio/public?poiCode=${encodeURIComponent(poiCode)}&lang=${encodeURIComponent(language)}`),
    getRoute: (from, to, language = "vi") => requestRoute(from, to, language),
    translatePoi: (data) => requestTranslation("/translate-poi", data),
    createPoi: (data, images = []) => {
        const formData = new FormData();
        formData.append("poi", JSON.stringify(data));
        images.forEach((image) => formData.append("images", image));
        return requestFormData("/pois", formData);
    },
    updatePoi: (dbId, data, images = [], removedImageIds = []) => {
        const formData = new FormData();
        formData.append("poi", JSON.stringify(data));
        formData.append("removedImageIds", JSON.stringify(removedImageIds));
        images.forEach((image) => formData.append("images", image));
        return requestFormData(`/pois/${dbId}`, formData, "PUT");
    },
    deletePoi: (dbId) => request(`/pois/${dbId}`, { method: "DELETE" }),

    // UC6 - Audio
    translateAudioScript: (script) =>
        requestTranslation("/translate-script", { script }),
    generateAudio: (text, language) =>
        requestAgentAudio("/text-to-speech", { text, language }),
    getAudio: (poiDbId) => request(`/audio?poiId=${poiDbId}`),
    createAudio: (data, file, filename = "audio.mp3") => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) formData.append(key, String(value));
        });
        formData.append("file", file, filename);
        return requestFormData("/audio", formData);
    },
    deleteAudio: (id) => request(`/audio/${id}`, { method: "DELETE" }),

    // Analytics used by the Overview tab
    getAnalytics: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        return request(`/analytics/overview${params.toString() ? `?${params}` : ""}`);
    },
    exportAnalytics: async ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        const res = await fetch(`${BASE}/analytics/overview/export?${params}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Không thể xuất báo cáo");
        return res.blob();
    },
    // API Bổ trợ cho Khu Nổi Bật (Tự động)
    getTopPopularPois: (language = "vi") =>
        request(`/analytics/top-popular?lang=${encodeURIComponent(language)}`),
    getCategories: () =>
        request("/analytics/categories"),

    // Sessions — theo dõi user đang online (qua analytics routes)
    pingSession: (sessionId, language, currentPoi, device) =>
        request("/analytics/sessions/ping", {
            method: "POST",
            body: JSON.stringify({ sessionId, language, currentPoi, device }),
        }),
    removeSession: (sessionId) =>
        request(`/analytics/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" }),
    getActiveSessions: () => request("/analytics/sessions/active"),

    // Lượt nghe audio — ghi nhận và reset
    logAudioUsage: (data) =>
        request("/analytics/usage", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    resetAudioUsage: () =>
        request("/analytics/usage/reset", {
            method: "POST",
        }),
};