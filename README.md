tổ chức thư mục
├── public/ # Tài nguyên tĩnh không qua đóng gói Vite 
│   ├── sw.js # File Service Worker (Workbox / Custom SW) [2] 
│   ├── manifest.webmanifest # PWA Manifest (Logo, tên app, theme) 
│   └── pmtiles/ # Gói bản đồ PMTiles mẫu ngoại tuyến [4] 
│ 
├── src/ 
│ ├── assets/ # Hình ảnh, Icon, Logo, Audio demo 
│ │ ├── images/ 
│ │ └── icons/ │
│ │ ├── components/ # Các UI Component dùng chung 
│ │ ├── common/ # Button, Card, Input, Loading, Modal... 
│ │ ├── layout/ # Navbar, BottomSheet, Sidebar, Header 
│ │ ├── audio/ # AudioPlayer, MiniPlayer (Trình phát thuyết minh) [1] 
│ │ └── map/ # MapContainer, PoiMarker, LocationMarker [4] 
│ │ │ ├── config/ # Cấu hình môi trường &amp; Constants 
│ │ ├── constants.ts # Bán kính Geofence (30m), Cooldown (5 phút), Timeout... [1] 
│ │ └── maptiler.ts # API Key, Tile Server URLs [4] 
│ │ │ ├── context/ # React Contexts quản lý trạng thái toàn cục
│ │ ├── AuthContext.tsx # Lưu trạng thái Đăng nhập, Token, Role [3] 
│ │ ├── LanguageContext.tsx # Quản lý Đa ngôn ngữ 2 làn (Content + UI) [4] 
│ │ └── OfflineContext.tsx # Trạng thái Online/Offline, Quản lý Offline Pack [2] 
│ │ │ ├── data/ # Mock Data cho giai đoạn đầu chưa có API
│ │ └── mockPois.ts 
│ │ │ ├── hooks/ # Custom Hooks tái sử dụng logic 
│ │ ├── useGeolocation.ts # Theo dõi GPS vị trí người dùng [1] 
│ │ ├── useGeofence.ts # Bắt sự kiện vào/ra vùng 30m quán ăn [1] 
│ │ ├── useAudioPlayer.ts # Điều khiển hàng đợi &amp; phát âm thanh [1] 
│ │ └── useOfflinePack.ts # Tiến trình tải &amp; kích hoạt gói ngoại tuyến [2] 
│ │ │ ├── layouts/ # Khung giao diện theo từng phân quyền / vai trò [3]
│ │ ├── TouristLayout.tsx # Layout giao diện Khách du lịch (Mobile-first)
│ │ ├── OwnerLayout.tsx # Layout giao diện Chủ quán 
│ │ └── AdminLayout.tsx # Layout giao diện Quản trị viên (Dashboard) 
│ │ │ ├── pages/ # Các màn hình chính (Phân chia theo phân vùng) 
│ │ ├── tourist/ # Màn hình cho Khách du lịch 
│ │ │ ├── HomePage.tsx # Trang chủ / Bản đồ 
│ │ │ ├── PoiDetailPage.tsx# Trang chi tiết quán &amp; phát audio
│ │ │ └── OfflinePage.tsx # Màn hình quản lý tải Gói Ngoại Tuyến 
│ │ ├── owner/ # Màn hình cho Chủ quán [3]
│ │ │ ├── OwnerPortal.tsx # Đăng ký / Sửa quán ăn 
│ │ │ └── VerificationPendingPage.tsx # Màn hình chờ duyệt 
│ │ ├── admin/ # Màn hình cho Admin [3] 
│ │ │ ├── DashboardPage.tsx# Thống kê tổng quan 
│ │ │ └── PoiApprovalPage.tsx # Phê duyệt quán ăn
│ │ └── auth/ # Đăng nhập / Đăng ký 
│ │ ├── LoginPage.tsx 
│ │ └── UnauthorizedPage.tsx 
│ │ │ ├── routes/ # Cấu hình Điều hướng &amp; Phân quyền 
│ │ ├── AppRoutes.tsx # Cấu hình Router tổng 
│ │ └── ProtectedRoute.tsx # Route Guard kiểm tra Role &amp; Permission [3]
│ │ │ ├── services/ # CORE LOGIC &amp; NGHIỆP VỤ HỆ THỐNG
│ │ ├── api/ # Gọi API Backend (Axios Client, Endpoints)
│ │ ├── db/ # Quản lý IndexedDB (\`Quan4DB\`) [2] 
│ │ ├── location/ # \`LocationService\` &amp; \`GeofenceEngine\` (turf.distance) [1] 
│ │ ├── audio/ # \`NarrationEngine\` &amp; Cơ chế 4-tier Fallback Audio [1] 
│ │ └── offline/ # \`OfflinePackManager\` &amp; Verifier SHA-256 [2] 
│ │ │ ├── styles/ # TailwindCSS / CSS globals 
│ │ └── index.css 
│ │ │ ├── types/ # Khai báo TypeScript Interfaces
│ │ ├── poi.ts # Kiểu dữ liệu Điểm ẩm thực
│ │ ├── auth.ts # Kiểu dữ liệu User, Role, Permission [3]
│ │ └── offline.ts # Kiểu dữ liệu Gói ngoại tuyến, Asset Manifest [2]
│ │ │ └── utils/ # Hàm tiện ích thuần túy (Pure functions) 
│ ├── sha256.ts # Kiểm tra mã băm SHA-256 file offline [2] 
│ └── formatters.ts # Định dạng khoảng cách, tiền tệ, ngày tháng 
│ ├── .env # Biến môi trường 
├── index.html # HTML chính
├── vite.config.ts # Cấu hình Vite &amp; PWA Plugin 
└── tsconfig.json # Cấu hình TypeScript
