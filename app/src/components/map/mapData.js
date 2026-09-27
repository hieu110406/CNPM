// mapData.js
// Dữ liệu thuần cho bản đồ — tách riêng khỏi UI để sau này dễ thay bằng API/CMS.
// Toạ độ x, y là phần trăm (0-100) theo chiều rộng/cao của ẢNH bản đồ thật.
// => Mở ảnh map thật, ước lượng % vị trí từng điểm rồi điền vào đây.

import {
  PawPrint,
  Leaf,
  Home as HomeIcon,
  Bath,
  UtensilsCrossed,
  Info as InfoIcon,
  HeartPulse,
} from "lucide-react";

export const TYPE_META = {
  animal: { label: "Khu vực động vật", color: "#2f855a", icon: PawPrint },
  plant: { label: "Khu vực thực vật", color: "#38a169", icon: Leaf },
  building: { label: "Công trình / Nhà", color: "#c53030", icon: HomeIcon },
  restroom: { label: "Nhà vệ sinh", color: "#3182ce", icon: Bath },
  restaurant: { label: "Nhà hàng / Quán ăn", color: "#dd6b20", icon: UtensilsCrossed },
  info: { label: "Quầy thông tin", color: "#805ad5", icon: InfoIcon },
  medical: { label: "Trạm y tế", color: "#e53e3e", icon: HeartPulse },
};

export const MARKERS = [
  { id: "gate", name: "Cổng chính", type: "building", emoji: "🏠", x: 41.58, y: 90.97, desc: "Số 2 Nguyễn Bỉnh Khiêm, Q.1, TP.HCM" },
  // { id: "tiger", name: "Hổ Đông Dương", type: "animal", emoji: "🐯", x: 47, y: 15, desc: "Khu thú lớn — giờ ăn 9:30 & 15:00" },
  // { id: "elephant", name: "Voi châu Á", type: "animal", emoji: "🐘", x: 34, y: 22, desc: "Khu thú lớn — khu vực rộng 1200m²" },
  // { id: "giraffe", name: "Hươu cao cổ", type: "animal", emoji: "🦒", x: 50, y: 24, desc: "Khu thú lớn — có khu cho ăn tương tác" },
  // { id: "polarbear", name: "Gấu Bắc Cực", type: "animal", emoji: "🐻‍❄️", x: 63, y: 20, desc: "Khu thú lớn — hồ nước làm mát" },
  // { id: "restroom1", name: "Nhà vệ sinh", type: "restroom", emoji: "🚻", x: 24, y: 20, desc: "Gần khu thú lớn" },
  // { id: "info1", name: "Quầy thông tin", type: "info", emoji: "ℹ️", x: 58, y: 18, desc: "Bản đồ giấy & hướng dẫn viên" },
  // { id: "restaurant1", name: "Quán ăn nhẹ", type: "restaurant", emoji: "🍽️", x: 66, y: 32, desc: "Đồ ăn nhanh, nước giải khát" },
  // { id: "deer", name: "Nai & hươu", type: "animal", emoji: "🦌", x: 62, y: 38, desc: "Khu thú lớn" },
  // { id: "bear1", name: "Gấu ngựa", type: "animal", emoji: "🐻", x: 78, y: 30, desc: "Khu thú lớn" },
  // { id: "croc", name: "Cá sấu nước ngọt", type: "animal", emoji: "🐊", x: 87, y: 32, desc: "Khu bò sát" },
  // { id: "flamingo", name: "Hồng hạc", type: "animal", emoji: "🦩", x: 60, y: 45, desc: "Khu chim" },
  // { id: "toucan", name: "Chim toucan", type: "animal", emoji: "🦜", x: 68, y: 43, desc: "Khu chim" },
  // { id: "lion", name: "Sư tử châu Phi", type: "animal", emoji: "🦁", x: 78, y: 42, desc: "Khu thú lớn — cho ăn 16:00" },
  // { id: "zebra", name: "Ngựa vằn", type: "animal", emoji: "🦓", x: 88, y: 43, desc: "Khu thú lớn" },
  // { id: "restroom2", name: "Nhà vệ sinh", type: "restroom", emoji: "🚻", x: 51, y: 44, desc: "Gần khu chim" },
  // { id: "hippo", name: "Hà mã", type: "animal", emoji: "🦛", x: 73, y: 52, desc: "Khu thú lớn — hồ ngâm mình" },
  // { id: "monkey", name: "Khỉ & vượn", type: "animal", emoji: "🐒", x: 84, y: 55, desc: "Khu linh trưởng" },
  // { id: "restaurant2", name: "Nhà hàng sân vườn", type: "restaurant", emoji: "🍴", x: 66, y: 52, desc: "Không gian ngoài trời" },
  // { id: "gorilla", name: "Đười ươi", type: "animal", emoji: "🦍", x: 76, y: 62, desc: "Khu linh trưởng" },
  // { id: "buffalo", name: "Trâu rừng", type: "animal", emoji: "🐃", x: 35, y: 58, desc: "Khu thú lớn" },
  // { id: "ostrich", name: "Đà điểu", type: "animal", emoji: "🦤", x: 62, y: 68, desc: "Khu chim" },
  // { id: "bear2", name: "Gấu chó", type: "animal", emoji: "🐻", x: 55, y: 78, desc: "Khu thú lớn" },
  // { id: "restroom3", name: "Nhà vệ sinh", type: "restroom", emoji: "🚻", x: 33, y: 68, desc: "Gần vườn thực vật" },
  // { id: "garden", name: "Vườn thực vật", type: "plant", emoji: "🌳", x: 16, y: 62, desc: "Cây cổ thụ trăm năm tuổi" },
  // { id: "medical", name: "Trạm y tế", type: "medical", emoji: "⛑️", x: 22, y: 46, desc: "Sơ cứu & hỗ trợ khẩn cấp" },
];

export const HIGHLIGHT_GROUPS = [
  { id: "big", title: "Khu thú lớn", subtitle: "Hổ, sư tử, voi, tê giác...", emoji: "🦁", memberIds: ["tiger", "elephant", "giraffe", "polarbear", "lion", "deer", "bear1", "bear2", "buffalo", "zebra"] },
  { id: "birds", title: "Khu chim", subtitle: "Hồng hạc, công, vẹt...", emoji: "🦩", memberIds: ["flamingo", "toucan", "ostrich"] },
  { id: "primates", title: "Khu linh trưởng", subtitle: "Khỉ, vượn, đười ươi...", emoji: "🐒", memberIds: ["monkey", "gorilla"] },
  { id: "reptiles", title: "Khu bò sát", subtitle: "Cá sấu, rùa, thằn lằn...", emoji: "🐊", memberIds: ["croc"] },
  { id: "botanical", title: "Vườn thực vật", subtitle: "Cây cổ thụ, vườn hoa...", emoji: "🌿", memberIds: ["garden"] },
];
