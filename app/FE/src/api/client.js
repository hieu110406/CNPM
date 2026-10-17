const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
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

export const api = {
    // UC4 - Auth
    login: (email, password) =>
        request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    verifyMfa: (adminId, code) =>
        request("/auth/verify-mfa", { method: "POST", body: JSON.stringify({ adminId, code }) }),
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

    // UC7 - Admin & Analytics
    getAdmins: () => request("/admin-accounts"),
    createAdmin: (data) => request("/admin-accounts", { method: "POST", body: JSON.stringify(data) }),
    deactivateAdmin: (id) => request(`/admin-accounts/${id}/deactivate`, { method: "PUT" }),
    updateAdmin: (id, data) => request(`/admin-accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    getAnalytics: () => request("/analytics/overview"),
    getAuditLogs: () => request("/audit-logs"),

    // API Bổ trợ cho Khu Nổi Bật (Tự động)
    getTopPopularPois: (language = "vi") =>
        request(`/analytics/top-popular?lang=${encodeURIComponent(language)}`),
    getCategories: () =>
        request("/analytics/categories"),
};