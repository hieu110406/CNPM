# Dự án CNPM - Cấu trúc tương lai

Tài liệu này mô tả cấu trúc thư mục dự kiến cho project trong tương lai, nhằm giúp dự án dễ mở rộng, dễ quản lý và dễ phát triển theo từng module.

## Mục tiêu tổ chức project

- Phân tách rõ ràng giữa UI, logic, dữ liệu và dịch vụ
- Dễ thêm tính năng mới mà không làm rối code
- Dễ làm việc nhóm và maintain sau này
- Dễ mở rộng sang nhiều module như dashboard, map, auth, admin, user

## Cấu trúc đề xuất

```text
CNPM/
├── README.md
├── .gitignore
├── docs/
│   ├── architecture.md
│   ├── api-spec.md
│   └── database.md
├── app/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── favicon.ico
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── assets/
│       │   ├── images/
│       │   ├── icons/
│       │   └── fonts/
│       ├── app/
│       │   ├── routes/
│       │   │   ├── AppRoutes.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   ├── store/
│       │   │   ├── index.js
│       │   │   └── slices/
│       │   └── providers/
│       │       ├── AuthProvider.jsx
│       │       └── ThemeProvider.jsx
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button/
│       │   │   ├── Modal/
│       │   │   └── Input/
│       │   ├── layout/
│       │   │   ├── Header.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── Footer.jsx
│       │   ├── map/
│       │   │   ├── MapView.jsx
│       │   │   └── MapMarker.jsx
│       │   ├── audio/
│       │   │   ├── AudioPlayer.jsx
│       │   │   └── AudioList.jsx
│       │   └── ui/
│       │       └── Card.jsx
│       ├── features/
│       │   ├── auth/
│       │   │   ├── LoginPage.jsx
│       │   │   ├── RegisterPage.jsx
│       │   │   └── authService.js
│       │   ├── dashboard/
│       │   │   ├── DashboardPage.jsx
│       │   │   └── dashboardService.js
│       │   ├── map/
│       │   │   ├── MapPage.jsx
│       │   │   └── mapService.js
│       │   └── profile/
│       │       ├── ProfilePage.jsx
│       │       └── profileService.js
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── AboutPage.jsx
│       │   ├── NotFoundPage.jsx
│       │   └── ErrorPage.jsx
│       ├── services/
│       │   ├── api/
│       │   │   ├── client.js
│       │   │   └── endpoints.js
│       │   ├── authService.js
│       │   ├── userService.js
│       │   └── mapService.js
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useTheme.js
│       │   └── useMap.js
│       ├── utils/
│       │   ├── formatDate.js
│       │   ├── currency.js
│       │   └── helpers.js
│       ├── config/
│       │   ├── constants.js
│       │   └── env.js
│       ├── styles/
│       │   ├── variables.css
│       │   ├── mixins.css
│       │   └── globals.css
│       ├── data/
│       │   ├── mockData.js
│       │   └── sample.json
│       └── types/
│           ├── user.ts
│           ├── map.ts
│           └── api.ts
└── package-lock.json
```

## Cách đọc cấu trúc này

- `app/src/features` : chứa các module chức năng lớn theo nghiệp vụ
- `app/src/components` : các thành phần UI tái sử dụng
- `app/src/pages` : màn hình chính của ứng dụng
- `app/src/services` : gọi API / xử lý logic dữ liệu
- `app/src/hooks` : custom hooks
- `app/src/utils` : hàm tiện ích
- `app/src/config` : cấu hình ứng dụng
- `app/src/styles` : CSS/SCSS variables và global styles

## Lợi ích của cấu trúc này

- Có thể thêm tính năng mới mà không phá vỡ layout cũ
- Dễ tìm file theo chức năng
- Dễ làm việc nhiều người cùng lúc
- Dễ nâng cấp lên mô hình scalable hơn khi project lớn lên

## Ghi chú

Đây là cấu trúc theo hướng phát triển tương lai, không phải là layout hiện tại của project đang chạy. Khi dự án bắt đầu phát triển thật, ta sẽ dần chuyển code về theo cấu trúc này.
