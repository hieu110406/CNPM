// components/admin/AdminDashboard.jsx
// Dashboard Quản trị viên Thảo Cầm Viên Sài Gòn
// Quản lý tổng quan, cá thể thú, cây di sản, vé, điểm POI bản đồ & nhật ký vận hành

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  PawPrint,
  Ticket,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Trash2,
  LogOut,
  Compass,
  Eye,
  ShieldCheck,
  BarChart3,
  ArrowUpRight,
  Activity,
  Filter,
  RefreshCw,
  Trees,
  Check,
  X,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../router/AdminAuthContext";
import { MARKERS } from "../map/mapData";
import "./dashboard.css";

// Dữ liệu mẫu cá thể động & thực vật ban đầu
const INITIAL_FLORA_FAUNA = [
  {
    id: "FF-001",
    name: "Hổ Bengal Trắng (Panthera tigris)",
    type: "animal",
    category: "Thú săn mồi",
    zone: "Khu Voi & Thú Lớn",
    status: "healthy", // "healthy" | "monitoring" | "treatment"
    age: "6 tuổi",
    gender: "Đực",
    diet: "Thịt bò & gà tươi (8kg/ngày)",
    caretaker: "BS. Nguyễn Văn Hùng",
    lastCheck: "Hôm nay, 08:30",
  },
  {
    id: "FF-002",
    name: "Voi Châu Á (Elephas maximus)",
    type: "animal",
    category: "Thú ăn cỏ lớn",
    zone: "Khu Voi & Thú Lớn",
    status: "healthy",
    age: "24 tuổi",
    gender: "Cái",
    diet: "Cỏ voi, mía cây, chuối (150kg/ngày)",
    caretaker: "Lê Văn Tuấn",
    lastCheck: "Hôm qua, 16:00",
  },
  {
    id: "FF-003",
    name: "Hươu Cao Cổ (Giraffa camelopardalis)",
    type: "animal",
    category: "Thú ăn cỏ",
    zone: "Đồng Cỏ Châu Phi",
    status: "monitoring",
    age: "4 tuổi",
    gender: "Cái (Đang mang thai)",
    diet: "Lá keo, cỏ tươi, củ quả bổ sung",
    caretaker: "BS. Trần Thị Mai",
    lastCheck: "Hôm nay, 09:15",
  },
  {
    id: "FF-004",
    name: "Hồng Hạc Mỹ (Phoenicopterus ruber)",
    type: "animal",
    category: "Loài chim quý",
    zone: "Hồ Hồng Hạc",
    status: "healthy",
    age: "Đàn 18 cá thể",
    gender: "Hỗn hợp",
    diet: "Tảo spirulina, giáp xác nhỏ",
    caretaker: "Phạm Quốc Bảo",
    lastCheck: "03/10/2026",
  },
  {
    id: "FF-005",
    name: "Cây Sao Đen Cổ Thụ (Heritage Tree #14)",
    type: "plant",
    category: "Cây di sản 130 năm",
    zone: "Trục đường chính Cổng Lê Duẩn",
    status: "healthy",
    age: "135 năm tuổi",
    gender: "Thực vật",
    diet: "Bón vi sinh định kỳ tháng 10",
    caretaker: "Tổ Cây Xanh TCV",
    lastCheck: "01/10/2026",
  },
  {
    id: "FF-006",
    name: "Vượn Má Vàng (Nomascus gabriellae)",
    type: "animal",
    category: "Linh trưởng đặc hữu",
    zone: "Đảo Linh Trưởng",
    status: "treatment",
    age: "8 tuổi",
    gender: "Đực",
    diet: "Trái cây mềm, lá non, trứng gà",
    caretaker: "BS. Nguyễn Văn Hùng",
    lastCheck: "Hôm nay, 11:00 (Uống kháng sinh)",
  },
];

// Dữ liệu mẫu vé & giao dịch gần đây
const RECENT_TICKETS = [
  { id: "TCK-9482", type: "Vé Người Lớn (x2)", customer: "Hoàng Minh", time: "11:42", amount: "120.000đ", gate: "Cổng 1 (Nguyễn Bỉnh Khiêm)", method: "QR VNPAY" },
  { id: "TCK-9481", type: "Vé Gia Đình Combo + Xe Điện", customer: "Nguyễn Thu Hà", time: "11:38", amount: "260.000đ", gate: "Cổng 2 (Nguyễn Thị Minh Khai)", method: "Momo" },
  { id: "TCK-9480", type: "Vé Trẻ Em (x3)", customer: "Đoàn THCS Lê Quý Đôn", time: "11:35", amount: "120.000đ", gate: "Cổng 1 (Nguyễn Bỉnh Khiêm)", method: "Tiền mặt" },
  { id: "TCK-9479", type: "Vé Người Lớn (x1)", customer: "David Miller", time: "11:29", amount: "60.000đ", gate: "Cổng 1 (Nguyễn Bỉnh Khiêm)", method: "Thẻ Visa" },
  { id: "TCK-9478", type: "Vé Đoàn Tham Quan (x45)", customer: "Cty Du lịch Sài Gòn Tourist", time: "11:15", amount: "2.250.000đ", gate: "Cổng 1 (Nguyễn Bỉnh Khiêm)", method: "Chuyển khoản" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { adminUser: user, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin", { replace: true });
  };

  const handleGoToMap = () => navigate("/");
  // Tab hiện tại: "overview" | "flora_fauna" | "tickets" | "poi" | "schedules"
  const [currentTab, setCurrentTab] = useState("overview");

  // Dữ liệu quản lý động thực vật
  const [itemsList, setItemsList] = useState(INITIAL_FLORA_FAUNA);
  const [searchItem, setSearchItem] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "animal" | "plant"
  const [showAddModal, setShowAddModal] = useState(false);

  // Form thêm cá thể mới
  const [newForm, setNewForm] = useState({
    name: "",
    type: "animal",
    category: "",
    zone: "Khu Voi & Thú Lớn",
    status: "healthy",
    age: "",
    diet: "",
    caretaker: "BS. Nguyễn Văn Hùng",
  });

  // Quản lý POI bản đồ
  const [poiList, setPoiList] = useState(() =>
    MARKERS.map((m) => ({
      ...m,
      isOpen: true,
      notes: "Hoạt động bình thường",
    }))
  );

  // Tìm kiếm POI
  const [poiSearch, setPoiSearch] = useState("");

  // Lọc danh sách động thực vật
  const filteredItems = useMemo(() => {
    return itemsList.filter((it) => {
      const matchType = filterType === "all" || it.type === filterType;
      const matchSearch =
        it.name.toLowerCase().includes(searchItem.toLowerCase()) ||
        it.zone.toLowerCase().includes(searchItem.toLowerCase()) ||
        it.category.toLowerCase().includes(searchItem.toLowerCase());
      return matchType && matchSearch;
    });
  }, [itemsList, filterType, searchItem]);

  // Xử lý bật/tắt trạng thái điểm POI trên bản đồ
  const togglePoiStatus = (id) => {
    setPoiList((prev) =>
      prev.map((poi) =>
        poi.id === id ? { ...poi, isOpen: !poi.isOpen } : poi
      )
    );
  };

  // Xử lý thêm cá thể mới
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const newItem = {
      id: `FF-00${itemsList.length + 1}`,
      name: newForm.name,
      type: newForm.type,
      category: newForm.category || (newForm.type === "animal" ? "Động vật" : "Cây cổ thụ"),
      zone: newForm.zone,
      status: newForm.status,
      age: newForm.age || "Chưa xác định",
      gender: newForm.type === "animal" ? "Chưa rõ" : "Thực vật",
      diet: newForm.diet || "Chế độ tiêu chuẩn",
      caretaker: newForm.caretaker,
      lastCheck: "Vừa cập nhật",
    };

    setItemsList([newItem, ...itemsList]);
    setShowAddModal(false);
    setNewForm({
      name: "",
      type: "animal",
      category: "",
      zone: "Khu Voi & Thú Lớn",
      status: "healthy",
      age: "",
      diet: "",
      caretaker: "BS. Nguyễn Văn Hùng",
    });
  };

  // Xử lý xóa cá thể
  const handleDeleteItem = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dữ liệu cá thể này?")) {
      setItemsList((prev) => prev.filter((it) => it.id !== id));
    }
  };

  return (
    <div className="admin-dash">
      {/* Vệt sáng trang trí nền */}
      <div className="admin-dash__glow admin-dash__glow--1" />
      <div className="admin-dash__glow admin-dash__glow--2" />

      {/* Top Header Navigation */}
      <header className="admin-dash__header">
        <div className="admin-dash__brand">
          <div className="admin-dash__logo">
            <span>🐅</span>
          </div>
          <div>
            <div className="admin-dash__brand-title">
              Thảo Cầm Viên Sài Gòn
              <span className="admin-dash__brand-badge">Admin Portal</span>
            </div>
            <p className="admin-dash__brand-sub">Trung tâm Điều hành &amp; Giám sát Dữ liệu Số</p>
          </div>
        </div>

        {/* Nút tác vụ nhanh Header */}
        <div className="admin-dash__actions">
          <button
            onClick={handleGoToMap}
            className="admin-dash__btn-map"
            title="Mở giao diện bản đồ du khách"
          >
            <Compass size={15} />
            <span>Xem Bản Đồ Khách</span>
            <ExternalLink size={12} className="opacity-70" />
          </button>

          <div className="admin-dash__divider" />

          {/* User Profile Card */}
          <div className="admin-dash__user">
            <div className="admin-dash__avatar">
              <ShieldCheck size={18} />
            </div>
            <div className="admin-dash__user-info">
              <div className="admin-dash__user-name">{user?.name || "Ban Quản Trị TCV"}</div>
              <div className="admin-dash__user-role">{user?.role || "Quản trị viên cấp cao"}</div>
            </div>
          </div>

          {/* Nút Đăng xuất */}
          <button
            onClick={handleLogout}
            className="admin-dash__btn-logout"
            title="Đăng xuất khỏi hệ thống quản trị"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Nội dung chính Dashboard */}
      <div className="admin-dash__body">
        {/* Sidebar Menu điều hướng */}
        <aside className="admin-dash__sidebar">
          <div className="admin-nav-group">
            <div className="admin-nav-title">QUẢN TRỊ CHÍNH</div>

            <button
              onClick={() => setCurrentTab("overview")}
              className={`admin-nav-item ${currentTab === "overview" ? "is-active" : ""}`}
            >
              <LayoutDashboard size={18} />
              <span>Tổng quan số liệu</span>
            </button>

            <button
              onClick={() => setCurrentTab("flora_fauna")}
              className={`admin-nav-item ${currentTab === "flora_fauna" ? "is-active" : ""}`}
            >
              <PawPrint size={18} />
              <span>Động &amp; Thực vật</span>
              <span className="admin-nav-badge">{itemsList.length}</span>
            </button>

            <button
              onClick={() => setCurrentTab("tickets")}
              className={`admin-nav-item ${currentTab === "tickets" ? "is-active" : ""}`}
            >
              <Ticket size={18} />
              <span>Vé &amp; Khách vào cổng</span>
            </button>

            <button
              onClick={() => setCurrentTab("poi")}
              className={`admin-nav-item ${currentTab === "poi" ? "is-active" : ""}`}
            >
              <MapPin size={18} />
              <span>Điểm POI Bản đồ</span>
              <span className="admin-nav-badge">{poiList.length}</span>
            </button>
          </div>

          <div className="admin-nav-group" style={{ marginTop: "24px" }}>
            <div className="admin-nav-title">VẬN HÀNH &amp; HỆ THỐNG</div>

            <button
              onClick={() => setCurrentTab("schedules")}
              className={`admin-nav-item ${currentTab === "schedules" ? "is-active" : ""}`}
            >
              <Calendar size={18} />
              <span>Lịch cho thú ăn &amp; Y tế</span>
            </button>

            <div className="admin-dash__system-card">
              <div className="admin-dash__system-head">
                <span className="admin-dash__ping" />
                <span>Hạ tầng IoT &amp; Bản đồ</span>
              </div>
              <div className="admin-dash__system-desc">
                Hệ thống âm thanh thuyết minh và định vị GPS đang hoạt động bình thường (99.8%).
              </div>
            </div>
          </div>
        </aside>

        {/* Khung nội dung Tab */}
        <main className="admin-dash__content custom-scrollbar">
          {/* ================= TAB 1: TỔNG QUAN SỐ LIỆU ================= */}
          {currentTab === "overview" && (
            <div className="admin-tab-view animate-fade">
              {/* Tiêu đề Tab */}
              <div className="admin-tab-head">
                <div>
                  <h1 className="admin-tab-title">Tổng Quan Tình Hình Hoạt Động</h1>
                  <p className="admin-tab-desc">
                    Số liệu trực tuyến cập nhật lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • Ngày {new Date().toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="admin-tab-actions">
                  <span className="admin-live-tag">
                    <span className="admin-live-dot" /> Dữ liệu thời gian thực
                  </span>
                </div>
              </div>

              {/* Lưới Thẻ Thống Kê (KPI Cards) */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card__head">
                    <div className="stat-card__icon stat-card__icon--blue">
                      <Users size={20} />
                    </div>
                    <span className="stat-card__trend stat-card__trend--up">
                      <ArrowUpRight size={13} /> +14.2%
                    </span>
                  </div>
                  <div className="stat-card__value">8,640</div>
                  <div className="stat-card__label">Khách tham quan hôm nay</div>
                  <div className="stat-card__foot">Đạt 108% mục tiêu cuối tuần</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card__head">
                    <div className="stat-card__icon stat-card__icon--emerald">
                      <TrendingUp size={20} />
                    </div>
                    <span className="stat-card__trend stat-card__trend--up">
                      <ArrowUpRight size={13} /> +9.8%
                    </span>
                  </div>
                  <div className="stat-card__value">432.5 tr</div>
                  <div className="stat-card__label">Doanh thu vé ước tính</div>
                  <div className="stat-card__foot">74% giao dịch qua cổng QR số</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card__head">
                    <div className="stat-card__icon stat-card__icon--amber">
                      <PawPrint size={20} />
                    </div>
                    <span className="stat-card__badge-sub">125 loài</span>
                  </div>
                  <div className="stat-card__value">1,380</div>
                  <div className="stat-card__label">Cá thể động vật bảo tồn</div>
                  <div className="stat-card__foot">5 ca đang chăm sóc y tế đặc biệt</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card__head">
                    <div className="stat-card__icon stat-card__icon--green">
                      <Trees size={20} />
                    </div>
                    <span className="stat-card__badge-sub">Di sản</span>
                  </div>
                  <div className="stat-card__value">2,600+</div>
                  <div className="stat-card__label">Cây cổ thụ &amp; Thực vật quý</div>
                  <div className="stat-card__foot">100% gắn chip NFC &amp; QR cứu hộ</div>
                </div>
              </div>

              {/* Lưới biểu đồ và giám sát khu vực */}
              <div className="dash-grid-2">
                {/* Biểu đồ mật độ theo giờ */}
                <div className="dash-card">
                  <div className="dash-card__head">
                    <div>
                      <h3 className="dash-card__title">
                        <BarChart3 size={17} className="text-emerald" />
                        Mật Độ Khách Theo Khung Giờ (Hôm nay)
                      </h3>
                      <p className="dash-card__desc">Khung giờ cao điểm ghi nhận từ 09:00 - 11:30 sáng</p>
                    </div>
                  </div>

                  <div className="hourly-chart">
                    {[
                      { time: "07h", count: 420, percent: 35 },
                      { time: "08h", count: 850, percent: 65 },
                      { time: "09h", count: 1420, percent: 95, peak: true },
                      { time: "10h", count: 1650, percent: 100, peak: true },
                      { time: "11h", count: 1200, percent: 80 },
                      { time: "12h", count: 680, percent: 45 },
                      { time: "13h", count: 540, percent: 40 },
                      { time: "14h", count: 890, percent: 68 },
                      { time: "15h", count: 1150, percent: 78 },
                      { time: "16h", count: 980, percent: 70 },
                      { time: "17h", count: 450, percent: 35 },
                    ].map((bar, i) => (
                      <div key={i} className="hourly-col">
                        <div className="hourly-col__track">
                          <div
                            className={`hourly-col__bar ${bar.peak ? "is-peak" : ""}`}
                            style={{ height: `${bar.percent}%` }}
                            title={`${bar.time}: ${bar.count} khách`}
                          />
                        </div>
                        <span className="hourly-col__label">{bar.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danh sách phân khu thu hút nhất */}
                <div className="dash-card">
                  <div className="dash-card__head">
                    <div>
                      <h3 className="dash-card__title">
                        <Activity size={17} className="text-amber" />
                        Khu Vực Thu Hút Nhất Bản Đồ
                      </h3>
                      <p className="dash-card__desc">Dựa trên lượt quét QR và tra cứu thuyết minh</p>
                    </div>
                  </div>

                  <div className="zones-rank-list">
                    {[
                      { name: "Khu Voi & Thú Săn Mồi Lớn", views: "3,840 lượt", percent: 92, tag: "Cực đông", color: "#10b981" },
                      { name: "Hồ Hồng Hạc & Đảo Linh Trưởng", views: "2,910 lượt", percent: 75, tag: "Đông", color: "#34d399" },
                      { name: "Vườn Thú Thiếu Nhi & Trải Nghiệm", views: "2,450 lượt", percent: 64, tag: "Ổn định", color: "#60a5fa" },
                      { name: "Khu Bò Sát & Thủy Cung", views: "1,820 lượt", percent: 48, tag: "Bình thường", color: "#f59e0b" },
                      { name: "Trục Cây Cổ Thụ & Vườn Lan", views: "1,340 lượt", percent: 36, tag: "Yên tĩnh", color: "#a78bfa" },
                    ].map((zone, idx) => (
                      <div key={idx} className="zone-rank-item">
                        <div className="zone-rank-item__row">
                          <span className="zone-rank-name">
                            <strong>#{idx + 1}</strong> {zone.name}
                          </span>
                          <span className="zone-rank-views">{zone.views}</span>
                        </div>
                        <div className="zone-rank-bar">
                          <div
                            className="zone-rank-bar__fill"
                            style={{ width: `${zone.percent}%`, backgroundColor: zone.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lịch sử vé mới vào cổng */}
              <div className="dash-card" style={{ marginTop: "20px" }}>
                <div className="dash-card__head">
                  <div>
                    <h3 className="dash-card__title">
                      <Ticket size={17} className="text-emerald" />
                      Giao Dịch Vé Mới Nhất
                    </h3>
                    <p className="dash-card__desc">Dữ liệu kết nối từ cổng soát vé thông minh</p>
                  </div>
                  <button onClick={() => setCurrentTab("tickets")} className="dash-card__link">
                    Xem tất cả ({RECENT_TICKETS.length}) &rarr;
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã Vé</th>
                        <th>Loại Vé</th>
                        <th>Khách Hàng</th>
                        <th>Thời Gian</th>
                        <th>Số Tiền</th>
                        <th>Cổng Vào</th>
                        <th>Phương Thức</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RECENT_TICKETS.map((tck) => (
                        <tr key={tck.id}>
                          <td><span className="code-badge">{tck.id}</span></td>
                          <td><strong>{tck.type}</strong></td>
                          <td>{tck.customer}</td>
                          <td><span className="time-badge">{tck.time}</span></td>
                          <td><span className="price-badge">{tck.amount}</span></td>
                          <td>{tck.gate}</td>
                          <td><span className="method-badge">{tck.method}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ĐỘNG & THỰC VẬT ================= */}
          {currentTab === "flora_fauna" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-tab-head">
                <div>
                  <h1 className="admin-tab-title">Quản Lý Động &amp; Thực Vật</h1>
                  <p className="admin-tab-desc">
                    Hồ sơ cá thể, tình trạng sức khỏe, chế độ dinh dưỡng và cán bộ phụ trách
                  </p>
                </div>
                <div className="admin-tab-actions">
                  <button onClick={() => setShowAddModal(true)} className="btn-primary-admin">
                    <Plus size={16} />
                    <span>Thêm Cá Thể Mới</span>
                  </button>
                </div>
              </div>

              {/* Bộ lọc & Tìm kiếm */}
              <div className="admin-filter-bar">
                <div className="admin-search-box">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên loài, phân khu, danh mục..."
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                  />
                  {searchItem && (
                    <button onClick={() => setSearchItem("")} className="clear-btn">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="admin-filter-tabs">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`filter-btn ${filterType === "all" ? "is-active" : ""}`}
                  >
                    Tất cả ({itemsList.length})
                  </button>
                  <button
                    onClick={() => setFilterType("animal")}
                    className={`filter-btn ${filterType === "animal" ? "is-active" : ""}`}
                  >
                    Động vật ({itemsList.filter((i) => i.type === "animal").length})
                  </button>
                  <button
                    onClick={() => setFilterType("plant")}
                    className={`filter-btn ${filterType === "plant" ? "is-active" : ""}`}
                  >
                    Cây di sản ({itemsList.filter((i) => i.type === "plant").length})
                  </button>
                </div>
              </div>

              {/* Bảng danh sách động thực vật */}
              <div className="dash-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã ID</th>
                        <th>Tên Loài / Thực Vật</th>
                        <th>Phân Khu</th>
                        <th>Tình Trạng Sức Khỏe</th>
                        <th>Độ Tuổi</th>
                        <th>Chế Độ Dinh Dưỡng</th>
                        <th>Cán Bộ / Bác Sĩ</th>
                        <th>Kiểm Tra Gần Nhất</th>
                        <th style={{ textAlign: "right" }}>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id}>
                          <td><span className="code-badge">{item.id}</span></td>
                          <td>
                            <div className="table-item-title">
                              <span>{item.type === "animal" ? "🐾" : "🌳"}</span>
                              <div>
                                <div className="font-semibold text-slate-100">{item.name}</div>
                                <div className="text-xs text-slate-400">{item.category}</div>
                              </div>
                            </div>
                          </td>
                          <td>{item.zone}</td>
                          <td>
                            {item.status === "healthy" && (
                              <span className="status-badge status-badge--healthy">
                                <CheckCircle2 size={12} /> Khỏe mạnh
                              </span>
                            )}
                            {item.status === "monitoring" && (
                              <span className="status-badge status-badge--monitoring">
                                <Clock size={12} /> Đang theo dõi
                              </span>
                            )}
                            {item.status === "treatment" && (
                              <span className="status-badge status-badge--treatment">
                                <AlertCircle size={12} /> Cần điều trị
                              </span>
                            )}
                          </td>
                          <td>{item.age}</td>
                          <td className="max-w-xs truncate" title={item.diet}>{item.diet}</td>
                          <td><span className="caretaker-badge">{item.caretaker}</span></td>
                          <td className="text-xs text-slate-400">{item.lastCheck}</td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="btn-action-delete"
                              title="Xóa hồ sơ cá thể"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: VÉ & KHÁCH VÀO CỔNG ================= */}
          {currentTab === "tickets" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-tab-head">
                <div>
                  <h1 className="admin-tab-title">Quản Lý Vé &amp; Doanh Thu Tham Quan</h1>
                  <p className="admin-tab-desc">
                    Kiểm soát lượng khách ra vào cổng theo thời gian thực và tổng hợp doanh thu
                  </p>
                </div>
              </div>

              {/* Lưới tóm tắt vé */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card__label">Vé Người Lớn (60k)</div>
                  <div className="stat-card__value">5,240</div>
                  <div className="stat-card__foot">314.400.000 đ</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__label">Vé Trẻ Em (40k)</div>
                  <div className="stat-card__value">2,850</div>
                  <div className="stat-card__foot">114.000.000 đ</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__label">Vé Đoàn / Trường Học</div>
                  <div className="stat-card__value">480</div>
                  <div className="stat-card__foot">24.000.000 đ (Ưu đãi)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__label">Tỷ Lệ Quét Cổng Tự Động</div>
                  <div className="stat-card__value">98.4%</div>
                  <div className="stat-card__foot">Không ùn tắc tại cửa kiểm soát</div>
                </div>
              </div>

              {/* Bảng giao dịch */}
              <div className="dash-card" style={{ marginTop: "20px" }}>
                <div className="dash-card__head">
                  <h3 className="dash-card__title">
                    <Ticket size={17} className="text-emerald" />
                    Lịch Sử Giao Dịch Chi Tiết
                  </h3>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã Vé</th>
                        <th>Loại Vé</th>
                        <th>Khách Hàng</th>
                        <th>Thời Gian</th>
                        <th>Số Tiền</th>
                        <th>Cổng Vào</th>
                        <th>Phương Thức</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RECENT_TICKETS.map((tck) => (
                        <tr key={tck.id}>
                          <td><span className="code-badge">{tck.id}</span></td>
                          <td><strong>{tck.type}</strong></td>
                          <td>{tck.customer}</td>
                          <td><span className="time-badge">{tck.time}</span></td>
                          <td><span className="price-badge">{tck.amount}</span></td>
                          <td>{tck.gate}</td>
                          <td><span className="method-badge">{tck.method}</span></td>
                          <td>
                            <span className="status-badge status-badge--healthy">
                              <Check size={12} /> Đã qua cổng
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: ĐIỂM POI BẢN ĐỒ ================= */}
          {currentTab === "poi" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-tab-head">
                <div>
                  <h1 className="admin-tab-title">Quản Lý Điểm Tham Quan &amp; POI Trên Bản Đồ</h1>
                  <p className="admin-tab-desc">
                    Bật/tắt trạng thái mở cửa, cập nhật thông báo bảo trì trực tiếp lên bản đồ du khách
                  </p>
                </div>
              </div>

              <div className="dash-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã POI</th>
                        <th>Tên Địa Điểm</th>
                        <th>Phân Loại</th>
                        <th>Tọa Độ Bản Đồ (X, Y)</th>
                        <th>Trạng Thái Hoạt Động</th>
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poiList.map((poi) => (
                        <tr key={poi.id}>
                          <td><span className="code-badge">{poi.id}</span></td>
                          <td>
                            <div className="table-item-title">
                              <span>{poi.icon || "📍"}</span>
                              <div>
                                <div className="font-semibold text-slate-100">{poi.name}</div>
                                <div className="text-xs text-slate-400">{poi.zone}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="category-pill">{poi.type}</span></td>
                          <td><code>X: {poi.x}% • Y: {poi.y}%</code></td>
                          <td>
                            <span
                              className={`status-badge ${
                                poi.isOpen ? "status-badge--healthy" : "status-badge--treatment"
                              }`}
                            >
                              {poi.isOpen ? "Đang Mở Cửa Tham Quan" : "Tạm Đóng Bảo Trì"}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => togglePoiStatus(poi.id)}
                              className={`btn-toggle-poi ${poi.isOpen ? "is-open" : "is-closed"}`}
                              title="Bấm để đổi trạng thái mở cửa / bảo trì"
                            >
                              {poi.isOpen ? "Đóng tạm thời" : "Mở cửa lại"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: LỊCH CHO THÚ ĂN & Y TẾ ================= */}
          {currentTab === "schedules" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-tab-head">
                <div>
                  <h1 className="admin-tab-title">Lịch Trình Chăm Sóc &amp; Sự Kiện Công Khai</h1>
                  <p className="admin-tab-desc">
                    Lịch cho thú ăn công khai cho du khách xem và ca trực y tế trong ngày
                  </p>
                </div>
              </div>

              <div className="dash-grid-2">
                {/* Khung giờ cho ăn */}
                <div className="dash-card">
                  <h3 className="dash-card__title">
                    <Clock size={17} className="text-amber" />
                    Lịch Cho Thú Ăn Hôm Nay (Du khách xem)
                  </h3>

                  <div className="schedule-list">
                    {[
                      { time: "09:00", name: "Cho Voi Ăn Mía & Tắm Voi", zone: "Khu Voi Châu Á", status: "completed" },
                      { time: "10:30", name: "Cho Hổ Bengal Ăn Thịt Bò", zone: "Chuồng Cọp Trắng", status: "completed" },
                      { time: "14:00", name: "Cho Hươu Cao Cổ Ăn Lá Keo", zone: "Đồng Cỏ Châu Phi", status: "upcoming" },
                      { time: "15:30", name: "Cho Hà Mã Tắm & Ăn Dưa Hấu", zone: "Hồ Hà Mã", status: "upcoming" },
                      { time: "16:15", name: "Cho Chim Nước & Bồ Nông Ăn Cá", zone: "Hồ Chim Trôi", status: "upcoming" },
                    ].map((sch, i) => (
                      <div key={i} className="schedule-item">
                        <div className="schedule-time">{sch.time}</div>
                        <div className="schedule-info">
                          <div className="schedule-name">{sch.name}</div>
                          <div className="schedule-zone">{sch.zone}</div>
                        </div>
                        <span className={`status-badge ${sch.status === "completed" ? "status-badge--healthy" : "status-badge--monitoring"}`}>
                          {sch.status === "completed" ? "Đã xong" : "Sắp diễn ra"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ca trực bác sĩ thú y */}
                <div className="dash-card">
                  <h3 className="dash-card__title">
                    <Users size={17} className="text-emerald" />
                    Ca Trực Bác Sĩ &amp; Đội Ngũ Cứu Hộ
                  </h3>

                  <div className="schedule-list">
                    {[
                      { name: "BS. Nguyễn Văn Hùng", role: "Trưởng ca thú y", phone: "0903.***.112", status: "Đang trực" },
                      { name: "BS. Trần Thị Mai", role: "Chuyên trách linh trưởng", phone: "0918.***.445", status: "Đang trực" },
                      { name: "Lê Văn Tuấn", role: "Tổ trưởng chăm sóc thú lớn", phone: "0977.***.892", status: "Đang trực" },
                      { name: "Tổ Cứu Hộ & Cây Xanh", role: "Ứng cứu khẩn cấp 24/7", phone: "Hotline 1900.****", status: "Sẵn sàng" },
                    ].map((staff, i) => (
                      <div key={i} className="schedule-item">
                        <div className="staff-avatar">{staff.name[4]}</div>
                        <div className="schedule-info">
                          <div className="schedule-name">{staff.name}</div>
                          <div className="schedule-zone">{staff.role} • {staff.phone}</div>
                        </div>
                        <span className="status-badge status-badge--healthy">
                          <CheckCircle2 size={12} /> {staff.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL THÊM CÁ THỂ MỚI ================= */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <div>
                <h2 className="admin-modal__title">Thêm Hồ Sơ Cá Thể Mới</h2>
                <p className="admin-modal__desc">Nhập thông tin động vật hoặc thực vật vào cơ sở dữ liệu TCV</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="clear-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="admin-modal__form">
              <div className="form-group">
                <label>Loại cá thể</label>
                <div className="form-radio-row">
                  <label className={`form-radio-chip ${newForm.type === "animal" ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="type"
                      checked={newForm.type === "animal"}
                      onChange={() => setNewForm({ ...newForm, type: "animal" })}
                    />
                    <span>🐾 Động vật</span>
                  </label>
                  <label className={`form-radio-chip ${newForm.type === "plant" ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="type"
                      checked={newForm.type === "plant"}
                      onChange={() => setNewForm({ ...newForm, type: "plant" })}
                    />
                    <span>🌳 Cây xanh / Thực vật</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Tên loài (Tên thông thường &amp; Tên khoa học)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hổ Bengal, Cây Dầu Rái 100 tuổi..."
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Phân khu / Vị trí chuồng</label>
                  <input
                    type="text"
                    placeholder="VD: Khu Voi, Hồ Hồng Hạc..."
                    value={newForm.zone}
                    onChange={(e) => setNewForm({ ...newForm, zone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Tình trạng sức khỏe</label>
                  <select
                    value={newForm.status}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value })}
                  >
                    <option value="healthy">Khỏe mạnh bình thường</option>
                    <option value="monitoring">Đang theo dõi sức khỏe</option>
                    <option value="treatment">Cần kiểm tra / Điều trị y tế</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Độ tuổi / Năm trồng</label>
                  <input
                    type="text"
                    placeholder="VD: 5 tuổi, 120 năm..."
                    value={newForm.age}
                    onChange={(e) => setNewForm({ ...newForm, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Cán bộ / Bác sĩ phụ trách</label>
                  <input
                    type="text"
                    value={newForm.caretaker}
                    onChange={(e) => setNewForm({ ...newForm, caretaker: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Chế độ dinh dưỡng / Chăm sóc</label>
                <textarea
                  rows={2}
                  placeholder="Khẩu phần ăn hàng ngày, lưu ý đặc biệt..."
                  value={newForm.diet}
                  onChange={(e) => setNewForm({ ...newForm, diet: e.target.value })}
                />
              </div>

              <div className="admin-modal__foot">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary-admin">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary-admin">
                  <Check size={16} /> Lưu Vào Hệ Thống
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
