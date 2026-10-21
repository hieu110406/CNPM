import { useState, useEffect } from "react";
import { ChevronRight, TrendingUp } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { api } from "../../api/client";

export default function HighlightedZones({ onSelectPoi, onSelectGroup }) {
    const { language, t } = useSettings();

    const [topPois, setTopPois] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function loadData() {
            try {
                setLoading(true);
                const topData = await api.getTopPopularPois(language || "vi");
                if (!cancelled) {
                    setTopPois(topData || []);
                }
            } catch (err) {
                console.error("Lỗi lấy dữ liệu khu nổi bật:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadData();
        return () => { cancelled = true; };
    }, [language]);

    if (loading) {
        return <div style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Đang tải dữ liệu...</div>;
    }

    if (!topPois.length) {
        return null;
    }

    return (
        <div className="zones">
            {/* TOP POI TỰ ĐỘNG TỪ USAGE LOG TRÊN DATABASE */}
            <div>
                <div className="zones__head">
                    <p className="panel-title" style={{ color: '#e11d48' }}>
                        <TrendingUp size={16} style={{ marginRight: 6 }} />
                        {t("guide.mostListened", "Khách đang nghe nhiều nhất")}
                    </p>
                    <span className="zones__count">{t("guide.top", "Top")} {topPois.length}</span>
                </div>
                <div className="zones__list">
                    {topPois.map((poi) => (
                        <button
                            key={poi.id}
                            onClick={() => {
                                if (onSelectPoi) onSelectPoi(poi.id);
                                else if (onSelectGroup) onSelectGroup(poi);
                            }}
                            className="zone-card"
                            style={{ borderLeft: '4px solid #e11d48' }}
                            title={t("guide.viewOnMap", "Bấm để xem vị trí trên bản đồ")}
                        >
                            <div className="zone-card__avatar" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                                <span style={{ fontSize: 24 }}>{poi.emoji || '📍'}</span>
                            </div>
                            <div className="zone-card__info">
                                <div className="zone-card__row">
                                    <p className="zone-card__title">{poi.name}</p>
                                    <span className="zone-card__badge" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                                        {poi.plays} {t("guide.plays", "lượt nghe")}
                                    </span>
                                </div>
                                <p className="zone-card__subtitle">{poi.zone || "Chưa rõ khu vực"}</p>
                            </div>
                            <ChevronRight size={15} className="zone-card__chevron" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}