import React, { useState, useEffect } from "react";
import { ChevronRight, TrendingUp, Compass } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { api } from "../../api/client";

export default function HighlightedZones({ selectedGroupId, onSelectGroup }) {
    const { t, language } = useSettings();

    const [topPois, setTopPois] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function loadData() {
            try {
                setLoading(true);
                const [topData, catData] = await Promise.all([
                    api.getTopPopularPois(language || "vi"),
                    api.getCategories()
                ]);
                if (!cancelled) {
                    setTopPois(topData);
                    setCategories(catData);
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

    const CATEGORY_ICONS = {
        animal: "🦁", plant: "🌿", building: "🏛️", entertainment: "🎡",
        restaurant: "🍔", restroom: "🚻", service: "ℹ️", medical: "🩺", photo: "📸"
    };

    return (
        <div className="zones">
            {/* PHẦN 1: TOP POI TỰ ĐỘNG TỪ USAGE LOG */}
            {topPois.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div className="zones__head">
                        <p className="panel-title" style={{ color: '#e11d48' }}>
                            <TrendingUp size={16} style={{ marginRight: 6 }} />
                            Khách đang nghe nhiều nhất
                        </p>
                        <span className="zones__count">Top 5</span>
                    </div>
                    <div className="zones__list">
                        {topPois.map((poi) => (
                            <button
                                key={poi.id}
                                onClick={() => onSelectGroup(poi)}
                                className="zone-card"
                                style={{ borderLeft: '4px solid #e11d48' }}
                            >
                                <div className="zone-card__avatar" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                                    <span style={{ fontSize: 24 }}>{poi.emoji || '📍'}</span>
                                </div>
                                <div className="zone-card__info">
                                    <div className="zone-card__row">
                                        <p className="zone-card__title">{poi.name}</p>
                                        <span className="zone-card__badge" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                                            {poi.plays} lượt nghe
                                        </span>
                                    </div>
                                    <p className="zone-card__subtitle">{poi.zone || "Chưa rõ khu vực"}</p>
                                </div>
                                <ChevronRight size={15} className="zone-card__chevron" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* PHẦN 2: BỘ LỌC DANH MỤC (THEO PRD UC1) */}
            <div className="zones__head">
                <p className="panel-title">
                    <Compass size={16} style={{ marginRight: 6 }} />
                    Khám phá theo danh mục
                </p>
                <span className="zones__count">{categories.length} danh mục</span>
            </div>

            <div className="zones__list">
                {categories.map((cat) => {
                    const isSelected = selectedGroupId === cat.name;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelectGroup(isSelected ? null : cat)}
                            className={`zone-card ${isSelected ? "is-selected" : ""}`}
                        >
                            <div className={`zone-card__avatar zone-card__avatar--${cat.name}`}>
                                <span style={{ fontSize: 24 }}>{CATEGORY_ICONS[cat.name] || '📌'}</span>
                            </div>
                            <div className="zone-card__info">
                                <div className="zone-card__row">
                                    <p className="zone-card__title" style={{ textTransform: 'capitalize' }}>{cat.name}</p>
                                    <span className="zone-card__badge">{cat.poi_count} địa điểm</span>
                                </div>
                                <p className="zone-card__subtitle">Xem tất cả địa điểm thuộc nhóm này</p>
                            </div>
                            <ChevronRight size={15} className="zone-card__chevron" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}