# App Frontend

Đây là phần frontend của dự án theo hướng phát triển tương lai. Mục tiêu là giữ project rõ ràng, dễ mở rộng và dễ quản lý theo từng module chức năng.

## Cấu trúc dự kiến

```text
app/
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── routes/
│   │   ├── store/
│   │   └── providers/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── map/
│   │   ├── audio/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── map/
│   │   └── profile/
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │   ├── api/
│   │   ├── authService.js
│   │   └── mapService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useMap.js
│   ├── utils/
│   │   ├── formatDate.js
│   │   └── helpers.js
│   ├── config/
│   │   ├── constants.js
│   │   └── env.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── data/
│   │   └── mockData.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Mô tả ngắn

- `features/` : các module theo chức năng nghiệp vụ
- `components/` : component dùng chung và UI tái sử dụng
- `pages/` : các màn hình chính của app
- `services/` : xử lý API và logic liên quan dữ liệu
- `hooks/` : custom hook cho app
- `utils/` : helper, format, xử lý dữ liệu
- `styles/` : CSS và theme chuẩn hóa

## Lưu ý

Đây là cấu trúc chuẩn hóa cho dự án tương lai, phù hợp để phát triển lâu dài. Khi app đang triển khai, có thể chưa cần theo đúng 100% ngay từ đầu, nhưng nên giữ nguyên hướng tổ chức này để dễ mở rộng.

## POI trên bản đồ

Bản đồ tải POI đang hoạt động từ `GET /api/pois/public` và dùng dữ liệu tĩnh làm dự phòng khi backend không truy cập được. Để nạp các POI mặc định vào database lần đầu, chạy `npm run seed:pois` trong thư mục `app/BE`; lệnh này chỉ thêm POI chưa có và đồng bộ chúng vào `map_node`.
