# Phân tích kiến trúc và file có thể dọn — CNPM

Ngày: 02/11/2026. Chỉ phân tích; chưa xóa hay sửa source code.

## Kiến trúc hiện tại

| Khối | Điểm vào / trách nhiệm |
|---|---|
| Web React + Vite | `app/FE/index.html` → `src/main.jsx` → `App.jsx`; giao diện bản đồ và quản trị, API client, SettingsContext |
| Backend Express | `app/BE/server.js` → routes → controllers → PostgreSQL qua `db/database.js`; POI, audio, auth/admin, audit, analytics, pathfinding |
| Mobile Expo | `mobile/FE/package.json` dùng `expo-router/entry`; `src/app/_layout.tsx` và các route index/explore/map; pages → components → API |
| Agent Python | `app/agent/translat_bot.py`; dịch nội dung và tạo audio; chạy bằng Uvicorn qua script ở `app/package.json` |
| Mã chia sẻ | Mobile import trực tiếp `app/FE/src/components/map/mapGraph.js`; Metro watchFolders cho phép theo dõi thư mục này |
| Dữ liệu và storage | SQL schema/seed, PostgreSQL; backend có `supabaseStorage.js`; asset bản đồ riêng cho web/mobile |

Graph: 883 nodes, 1.624 edges, 96 communities. Đã dùng graphify query và graphify path trước khi đối chiếu source. Graph mặc định vô hướng; không coi thứ tự source/target trong JSON là bằng chứng độc lập về chiều import.

## Phương pháp và độ tin cậy

Tìm file cô lập trong graph, đối chiếu import/re-export và tên file bằng tìm kiếm toàn repository, kiểm tra scripts, HTML, app.json và icon.json. Loại node_modules, dist, .git, graphify-out, cache Expo và môi trường bí mật khỏi tìm kiếm tham chiếu. Không thấy cơ chế import.meta.glob/require.context nạp tự động các ứng viên dưới đây.

“Có thể dọn” nghĩa là không tìm thấy người dùng trong code/config hiện tại. Đây là kết luận phân tích tĩnh, chưa phải kiểm thử sau khi xóa; không xác minh người dùng bên ngoài repository hoặc URL public đã được chia sẻ. Các nhóm có import/re-export nội bộ phải dọn cùng nhau.

## A. Source dư — đề xuất ưu tiên

| File / nhóm | Bằng chứng và cách dọn |
|---|---|
| `app/FE/src/components/map/MapLegend.jsx` | Không có import hay nơi render; các nhắc tên còn lại là comment CSS |
| `app/FE/src/components/map/MapSidePanel.jsx` | Không có import hay nơi render; comment CSS không làm component được dùng |
| `app/FE/src/components/language/LanguageSwitcher.jsx` + `language.css` | Component không có nơi import; CSS chỉ được component này import. Dọn cùng nhau |
| `app/FE/src/components/audio/AudioPlayer.jsx` + `index.js` | MiniPlayer/AudioPlayer chỉ được barrel này export, không có consumer. Dọn cùng nhau; giữ `PoiAudioControl.jsx` đang được dùng |
| `app/FE/src/components/layout/index.js` + `Sidebar.jsx` | Barrel không có consumer; Sidebar chỉ được barrel re-export. Dọn cùng nhau, hoặc bỏ export trước. Giữ `AppLayout.jsx`, `Header.jsx`, `layout.css` |
| `app/FE/src/components/settings/index.js` | Không có consumer; AppLayout import SettingsModal trực tiếp. Chỉ dọn barrel, giữ SettingsModal/CSS |
| `app/FE/src/pages/admin/index.js` | Wrapper re-export không có consumer; App.jsx import `components/admin` trực tiếp |
| `mobile/FE/src/data/destinations.ts` | Dữ liệu mẫu không có import. Biến routePoints trong ZooMap.tsx là biến cục bộ khác, không dùng export này |
| `mobile/FE/src/constants/theme.ts` + `src/global.css` | Theme cũ không có consumer; global.css chỉ được theme.ts import. Dọn cùng nhau; giữ appearance.ts đang được dùng |

Tổng nhóm A: 13 file, bao gồm các CSS và barrel liên quan.

## B. Asset nội bộ không tìm thấy tham chiếu

Web — 3 file:

- `app/FE/src/assets/hero.png`
- `app/FE/src/assets/react.svg`
- `app/FE/src/assets/vite.svg`

Mobile — 14 file:

- `mobile/FE/assets/images/expo-badge-white.png`
- `mobile/FE/assets/images/expo-badge.png`
- `mobile/FE/assets/images/expo-logo.png`
- `mobile/FE/assets/images/logo-glow.png`
- `mobile/FE/assets/images/react-logo.png`
- `mobile/FE/assets/images/react-logo@2x.png`
- `mobile/FE/assets/images/react-logo@3x.png`
- `mobile/FE/assets/images/tutorial-web.png`
- `mobile/FE/assets/images/tabIcons/explore.png`
- `mobile/FE/assets/images/tabIcons/explore@2x.png`
- `mobile/FE/assets/images/tabIcons/explore@3x.png`
- `mobile/FE/assets/images/tabIcons/home.png`
- `mobile/FE/assets/images/tabIcons/home@2x.png`
- `mobile/FE/assets/images/tabIcons/home@3x.png`

Đã kiểm tra cả basename gốc và biến thể @2x/@3x để tránh nhầm cơ chế chọn mật độ ảnh. Chưa xóa hoặc chạy build với các asset bị loại.

## C. Có thể dọn nhưng cần quyết định về công cụ/tài liệu

- `mobile/FE/scripts/reset-project.js`: template reset không dùng trong runtime, nhưng còn được `mobile/FE/package.json:41` gọi. Nếu bỏ tính năng reset, phải xóa cả npm script; không chạy script này để dọn dự án.
- `app/FE/public/favicon.svg`, `app/FE/public/icons.svg`: không có tham chiếu nội bộ. Favicon hiện tại lấy từ logo.png trong index.html. Cần xác nhận không còn người dùng truy cập URL public trực tiếp.
- Bốn file ghi chú `app/FE/src/assets/read`, `src/components/read`, `src/components/audio/read`, `src/components/layout/read`: không tham gia runtime; hai file cuối chỉ có nội dung “lmao”.
- 19 file `.gitkeep`: không tham gia runtime; bỏ sẽ khiến các thư mục rỗng không còn được Git giữ lại.
- `package.json` và `package-lock.json` ở root: package root chỉ khai báo Supabase JS SDK; không tìm thấy code import SDK này. Chỉ cân nhắc xóa cặp file sau khi xác nhận không có công cụ/deploy bên ngoài dùng root làm install directory. Các package.json trong app, app/BE, app/FE, mobile, mobile/FE vẫn có vai trò riêng.
- `app/BE/db/seed_pathfinding.js`: là script chạy trực tiếp, không thấy import hoặc npm script hiện hành gọi. Cần xác nhận không còn dùng để khởi tạo/sửa dữ liệu; không kết luận xóa chỉ từ graph.

## D. Các file cô lập trong graph nhưng phải giữ

- `app/BE/db/schema.sql`: database.js:45 đọc qua fs.readFileSync; thiếu cạnh AST không có nghĩa là không dùng.
- `app/BE/server.js`, `app/FE/src/main.jsx`, `app/FE/index.html`, các route trong `mobile/FE/src/app/`: entry point hoặc framework tự nạp.
- `mobile/scripts/start.cjs`: mobile/FE/package.json gọi ở scripts start/android/ios/web.
- `app/agent/translat_bot.py`: Uvicorn nạp qua tên module trong npm script.
- `app/FE/src/components/map/mapGraph.js` và `mapGraph.d.ts`: mobile sử dụng thuật toán và kiểu dữ liệu; không chỉ thuộc web.
- `mobile/FE/metro.config.js`, tsconfig, app.json, vercel.json, eslint config và styles.d.ts: cấu hình hoặc khai báo tự được công cụ nhận diện.
- `app/FE/src/assets/map/zoo_map.png`, `mobile/FE/assets/images/zoo-map.png`: được hai MapCanvas/ZooMap sử dụng; không xóa một bản chỉ vì cùng nội dung.
- `app/FE/src/assets/marker/logo.png`: favicon tại app/FE/index.html:6.
- Icon, splash, favicon trong mobile/FE/app.json; `assets/expo.icon/icon.json` tham chiếu cả `expo-symbol 2.svg` và `grid.png`.
- `app/BE/I18N/*`: controller pathfinding import trực tiếp. Không nhầm với bộ locale riêng của mobile.
- Tests GPS, position-watcher và presence-heartbeat: công cụ kiểm tra, không cần được app runtime import để có giá trị.
- AGENTS.md, README, PRD và I18N_GUIDE: tài liệu/hướng dẫn; không xem là source dư chỉ vì không có import.

## Kiểm tra đã chạy và giới hạn

- `npm.cmd --prefix mobile run typecheck`: PASS.
- `npm.cmd --prefix mobile run lint`: PASS.
- Không xóa source, không mô phỏng runtime sau khi xóa, chưa chạy web/native production build.
- Graph có 36 dangling references, 1 self-loop và 80 quan hệ gộp cùng endpoint. Vì vậy đã đối chiếu source/config; số cạnh bằng 0 không đủ chứng minh file an toàn để xóa.
- Kết luận ưu tiên: 13 file source/CSS/barrel theo nhóm A và 17 asset nội bộ theo nhóm B là 30 ứng viên dọn có bằng chứng mạnh nhất. Kiểm tra build web và mobile sau một thay đổi xóa thực tế trước khi merge.
