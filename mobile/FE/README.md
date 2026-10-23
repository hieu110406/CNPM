# Mobile frontend — Thảo Cầm Viên

Ứng dụng React Native / Expo. Bản đồ lấy địa điểm từ database qua backend và dùng waypoint, cạnh nối, Dijkstra trong `app/FE/src/components/map/mapGraph.js` của web để tìm đường ngay trên thiết bị. Trang chủ và trang khám phá hiện vẫn dùng dữ liệu mẫu.

## Android và iOS

Dự án dùng Expo SDK 58 để khớp với Expo Go 58 trên điện thoại. Các gói Expo và React Native được đồng bộ bằng `npx.cmd expo install --fix`; không chỉ nâng riêng gói `expo`. Thư mục `mobile` chỉ chứa lệnh chuyển tiếp, không cài thêm Expo tại đó.

Sau khi cập nhật dependencies, dừng Metro cũ rồi chạy từ `mobile`:

```powershell
npm.cmd start -- --clear
```

Dùng Expo Go hỗ trợ SDK 58 hoặc development build tương ứng trên Android/iOS. Không sửa `node_modules` hay thêm alias cho asset registry để che lỗi lệch SDK.

## Kết nối bản đồ với Neon

Backend trong `app/BE` đọc `DATABASE_URL` từ `.env` (đã cấu hình Neon). Mobile không chứa thông tin đăng nhập database.

`npm.cmd start` trong `mobile` hoặc `mobile/FE` tự chạy backend và chờ API sẵn sàng trước khi mở Expo. Các lệnh `android`, `ios`, `web` cũng chạy cùng backend. Backend đã chạy ở cổng cấu hình thì được dùng lại.

Khi chạy Expo qua LAN trên cùng máy với backend, mobile tự dùng địa chỉ máy đang chạy Expo, cổng `5000`. Điện thoại và máy tính cần cùng mạng và cổng backend phải truy cập được.

Để chỉ định backend khác, tạo `mobile/FE/.env.local`:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000/api
```

Thay IP bằng IP LAN của máy chạy backend. Android Emulator có thể dùng `http://10.0.2.2:5000/api`, trình duyệt trên máy tính dùng `http://localhost:5000/api`. Với bản build phát hành hoặc Expo tunnel, đặt URL HTTPS của backend có thể truy cập từ điện thoại. Tải lại ứng dụng sau khi sửa biến môi trường.

Bản đồ gọi `GET /api/pois/public?lang=vi` để lấy các địa điểm đang hoạt động từ bảng `poi`, gồm tên, tọa độ, loại, mô tả và biểu tượng. Chỉ POI có tọa độ mới xuất hiện trên bản đồ và trong danh sách chọn điểm. Sau khi tải POI, mobile gọi `buildGraph(pois)` từ `mapGraph.js` dùng chung với web để nối từng POI vào waypoint gần nhất, rồi gọi `shortestPath(from, to)` ngay trên thiết bị. Mobile không gọi API tìm đường và không dùng bảng `map_node`/`map_edge`. Vẫn cần giữ `app/BE/db/database.js` để API đọc bảng `poi`. Mỗi lần mở lại tab bản đồ, ứng dụng tải lại danh sách địa điểm; lỗi kết nối có nút thử lại.

## Chạy dự án

```powershell
cd mobile
npm.cmd --prefix FE ci
npm.cmd --prefix ../app/BE install
npm.cmd start
```

Chọn Android/iOS trong Expo hoặc chạy `npm.cmd run web` để xem trên trình duyệt.

`mobile/package.json` chuyển các lệnh chạy sang dự án trong `FE/`. Khi đứng ở `mobile`, dùng `npm start` thay cho `npx expo start`.

Nhấn `Ctrl+C` để dừng Expo và backend do lệnh này khởi động. Backend có sẵn từ trước sẽ tiếp tục chạy. Nếu chỉ muốn chạy frontend với backend riêng, dùng `npm.cmd run start:fe`. Launcher đọc cổng backend từ `PORT` trong môi trường hoặc `app/BE/.env` (mặc định `5000`); nếu đổi cổng, hãy đặt `EXPO_PUBLIC_API_URL` tương ứng trong `mobile/FE/.env.local`.

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
  I18N/
    vi.ts               # Bản dịch tiếng Việt
    en.ts               # Bản dịch tiếng Anh
    zh.ts               # Bản dịch tiếng Trung giản thể
  context/
    I18nContext.tsx     # Ngôn ngữ hiện tại và hàm dịch dùng chung
  constants/
    theme.ts            # Màu sắc, font, khoảng cách
  global.css            # Biến font cho web
assets/images/          # Ảnh và bản đồ
```

- Code giao diện chính, style và trạng thái tương tác trong `components/<tính năng>/`.
- Thêm màn hình: tạo component trong `components/`, để `pages/` gọi component đó, sau đó thêm file route mỏng trong `app/`.
- Component dùng chung ở `components/ui/`; thanh điều hướng và khung ứng dụng ở `components/layout/`.
- Bản dịch mobile nằm trong `src/I18N/`; thêm khóa dịch tương ứng vào cả `vi.ts`, `en.ts` và `zh.ts`, sau đó lấy nội dung qua `useI18n()` từ `src/context/I18nContext.tsx`. Ngôn ngữ được chọn áp dụng ngay trong phiên chạy, chưa lưu lại sau khi đóng ứng dụng.
- Không đặt component, dữ liệu hoặc hàm tiện ích vào `app/` vì Expo Router xem file ở đó là route.
- Chỉ tạo `api/`, `context/`, `hooks/` khi bắt đầu có phần sử dụng; chưa kết nối API ở bước giao diện này.

## Kiểm tra

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
```

Tìm kiếm, lọc khu vực và hộp chi tiết ở Khám phá chạy bằng dữ liệu mẫu. Bản đồ mobile dùng ảnh tham khảo và đồ thị waypoint `mapGraph.js` của web để tìm tuyến giữa cổng chính và các điểm tham quan mẫu; chưa dùng GPS hoặc phát audio.
