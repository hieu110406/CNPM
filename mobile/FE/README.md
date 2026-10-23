# Mobile frontend — Thảo Cầm Viên

Ứng dụng React Native / Expo. Hiện dùng dữ liệu mẫu, chưa kết nối backend.

## Chạy dự án

```powershell
cd mobile
npm.cmd --prefix FE ci
npm.cmd start
```

Chọn Android/iOS trong Expo hoặc chạy `npm.cmd run web` để xem trên trình duyệt.

`mobile/package.json` chuyển các lệnh chạy sang dự án trong `FE/`. Khi đứng ở `mobile`, dùng `npm start` thay cho `npx expo start`.

## Cấu trúc

```text
src/
  app/                  # Expo Router: chỉ khai báo route và layout điều hướng
    _layout.tsx
    index.tsx           # / → pages/HomePage
    explore.tsx         # /explore → pages/ExplorePage
    map.tsx             # /map → pages/MapPage
  pages/                # Chỉ gọi component màn hình tương ứng
    HomePage.tsx
    ExplorePage.tsx
    MapPage.tsx
  components/
    home/
      HomeScreen.tsx    # Giao diện và trạng thái trang chủ
    explore/
      ExploreScreen.tsx # Giao diện tìm kiếm, lọc và chi tiết địa điểm
    map/
      ZooMap.tsx        # Bản đồ, tìm tuyến giữa các điểm tham quan
    layout/
      AppTabs.tsx       # Thanh điều hướng dưới dùng chung Android, iOS, web
    ui/
      MobileUI.tsx      # Screen, Heading và style UI dùng chung
  data/
    destinations.ts     # Dữ liệu mẫu các điểm tham quan
  constants/
    theme.ts            # Màu sắc, font, khoảng cách
  global.css            # Biến font cho web
assets/images/          # Ảnh và bản đồ
```

- Code giao diện chính, style và trạng thái tương tác trong `components/<tính năng>/`.
- Thêm màn hình: tạo component trong `components/`, để `pages/` gọi component đó, sau đó thêm file route mỏng trong `app/`.
- Component dùng chung ở `components/ui/`; thanh điều hướng và khung ứng dụng ở `components/layout/`.
- Không đặt component, dữ liệu hoặc hàm tiện ích vào `app/` vì Expo Router xem file ở đó là route.
- Chỉ tạo `api/`, `context/`, `hooks/` khi bắt đầu có phần sử dụng; chưa kết nối API ở bước giao diện này.

## Kiểm tra

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
```

Tìm kiếm, lọc khu vực và hộp chi tiết ở Khám phá chạy bằng dữ liệu mẫu. Bản đồ mobile dùng ảnh tham khảo và đồ thị waypoint `mapGraph.js` của web để tìm tuyến giữa cổng chính và các điểm tham quan mẫu; chưa dùng GPS hoặc phát audio.
