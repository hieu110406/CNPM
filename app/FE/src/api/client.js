const BASE = "http://localhost:5000/api";

function getToken() {
    return localStorage.getItem("admin_token");
}

async function request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Lỗi API");
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
    createPoi: (data) => request("/pois", { method: "POST", body: JSON.stringify(data) }),
    updatePoi: (dbId, data) => request(`/pois/${dbId}`, { method: "PUT", body: JSON.stringify(data) }),
    deletePoi: (dbId) => request(`/pois/${dbId}`, { method: "DELETE" }),

    // UC6 - Audio
    getAudio: (poiDbId) => request(`/audio?poiId=${poiDbId}`),
    createAudio: (data) => request("/audio", { method: "POST", body: JSON.stringify(data) }),
    publishAudio: (id) => request(`/audio/${id}/publish`, { method: "PUT" }),
    deleteAudio: (id) => request(`/audio/${id}`, { method: "DELETE" }),

    // UC7 - Admin & Analytics
    getAdmins: () => request("/admin-accounts"),
    createAdmin: (data) => request("/admin-accounts", { method: "POST", body: JSON.stringify(data) }),
    deactivateAdmin: (id) => request(`/admin-accounts/${id}/deactivate`, { method: "PUT" }),
    updateAdmin: (id, data) => request(`/admin-accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    getAnalytics: () => request("/analytics/overview"),
    getAuditLogs: () => request("/audit-logs"),
};
