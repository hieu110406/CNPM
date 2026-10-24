
const VI = {
  app: {
    title: "Thảo Cầm Viên",
    subtitle: "Saigon Zoo & Botanical Gardens",
    hours: "Mở cửa: 07:00 - 18:30",
    weather: "TP.HCM 31°C",
  },

  navigation: {
    admin: "Admin",
    guide: "Hướng dẫn",
    explore: "Khám phá khu vực",
  },

  search: {
    placeholder: "Tìm loài thú, cây xanh, dịch vụ...",
  },

  filters: {
    all: "Tất cả",
    animal: "Động vật",
    plant: "Thực vật",
    gate: "Cổng vào",
    building: "Công trình & Cổng",
    entertainment: "Vui chơi & Giải trí",
    restaurant: "Nhà hàng & Cà phê",
    restroom: "Nhà vệ sinh",
    service: "Dịch vụ & Xe điện",
    medical: "Trạm y tế & Sơ cứu",
    photo: "Điểm check-in đẹp",
    wc: "Vệ sinh",
    fun: "Giải trí",
  },

  types: {
    animal: "Khu vực động vật",
    plant: "Khu vực thực vật",
    building: "Công trình & Cổng",
    entertainment: "Vui chơi & Giải trí",
    restaurant: "Nhà hàng & Cà phê",
    restroom: "Nhà vệ sinh",
    service: "Dịch vụ & Xe điện",
    medical: "Trạm y tế & Sơ cứu",
    photo: "Điểm check-in đẹp",
    gate: "Cổng vào",
  },

  rightPanelTitle: "Hướng Dẫn Tham Quan",
  exploreBtn: "Khám phá",

  settings: {
    title: "Cài Đặt Hệ Thống",
    description: "Tùy chỉnh ngôn ngữ, kích cỡ chữ và giao diện tham quan",
    languageHint: "Chọn ngôn ngữ hiển thị trên toàn bộ ứng dụng",
    
    tabs: {
      language: "Ngôn ngữ",
      font: "Cỡ chữ",
      display: "Giao diện",
      audio: "Bản đồ & Âm thanh",
    },

    font: {
      selectLabel: "Chọn kiểu phông chữ",
      sizeLabel: "Kích thước chữ",
      previewTitle: "Bản xem trước kích thước chữ trực tiếp:",
      previewText:
        "Thảo Cầm Viên Sài Gòn (Est. 1864) — Không gian xanh lịch sử với hàng trăm loài động thực vật quý hiếm giữa lòng thành phố.",
    },

    theme: {
      label: "Chế độ giao diện",
      light: "Sáng tự nhiên",
      dark: "Tối dịu mắt (Ban đêm)",
    },

    motion: {
      label: "Hiệu ứng chuyển động mượt",
      description: "Bật hoạt ảnh lướt, xoay và phóng to bản đồ mượt mà",
    },

    audio: {
      autoPlayLabel: "Tự động phát thuyết minh",
      autoPlayDescription:
        "Tự động phát lời thuyết minh âm thanh khi bấm vào địa điểm",
    },

    map: {
      showLabelsLabel: "Hiện nhãn tên địa điểm trên bản đồ",
      showLabelsDescription:
        "Hiển thị tên địa điểm trực tiếp bên cạnh các biểu tượng trên bản đồ",
    },

    actions: {
      reset: "Khôi phục mặc định",
      close: "Áp dụng & Đóng",
    },
  },

  guide: {
    title: "Hướng Dẫn Tham Quan",

    tabs: {
      zones: "Khu nổi bật",
      legend: "Chú thích",
    },

    highlights: "KHU VỰC NỔI BẬT",
    mostListened: "KHÁCH ĐANG NGHE NHIỀU NHẤT",
    top: "Top",
    plays: "lượt nghe",
    viewOnMap: "Bấm để xem vị trí trên bản đồ",
    groups: "nhóm",

    bigAnimalsTitle: "Khu Thú Lớn Nổi Bật",
    bigAnimalsSubtitle: "Voi châu Á, hươu cao cổ, hà mã...",
    bigBadge: "5 loài",

    birdsTitle: "Vườn Chim & Thủy Cầm",
    birdsSubtitle: "Hồng hạc, thiên nga, bồ nông...",
    birdsBadge: "Hồ cảnh quan",

    primatesTitle: "Thế Giới Linh Trưởng",
    primatesSubtitle: "Vượn đen má trắng, các loài khỉ...",
    primatesBadge: "Khu bảo tồn",

    entertainmentTitle: "Vui Chơi & Trải Nghiệm",
    entertainmentSubtitle: "Đu quay khổng lồ, sân khấu biểu diễn...",
    entertainmentBadge: "Gia đình & Bé",

    botanicalTitle: "Vườn Thực Vật Cổ Thụ",
    botanicalSubtitle: "Cây trăm tuổi, vườn phong lan...",
    botanicalBadge: "Di sản xanh",

    electricTram: "Tour Xe Điện Khám Phá",
    tramDescription:
      "Trải nghiệm xe điện dạo quanh 20 hecta vườn thú với lời bình audio sinh động.",
    ticketPrice: "20.000đ / vé",
    viewRoute: "Xem vị trí ga",
  },

  map: {
    canvas: {
      hint: "Kéo để di chuyển • Lăn chuột để phóng to / thu nhỏ",
      start: "Xuất phát",
      destination: "Điểm đến",
      imageAlt: "Bản đồ Thảo Cầm Viên Sài Gòn",
      clearRoute: "Xóa lộ trình dẫn đường",
    },

    legend: {
      title: "Danh mục địa điểm",
      reset: "Xóa bộ lọc",
    },

    infoCard: {
      gate: "Cổng",
      close: "Đóng",
      viewDetails: "Xem chi tiết & hình ảnh",
      viewDetailsTitle: "Mở bảng thông tin chi tiết và album hình ảnh",
      viewMore: "Xem thêm",
      didYouKnow: "Bạn có biết?",
      feedingTime: "Giờ cho ăn",
      openingHours: "Giờ mở cửa",
      audioTitle: "Nghe thuyết minh",
      pause: "Tạm dừng",
      play: "Phát thuyết minh",
      navigate: "Chỉ đường tới đây",
      navigateAlert: "Bắt đầu dẫn đường đến: {{name}}",
      favorite: "Lưu vào danh sách yêu thích",
      favoriteTitle: "Lưu vào danh sách yêu thích",
      share: "Chia sẻ địa điểm",
      shareTitle: "Chia sẻ địa điểm",
      copied: "Đã sao chép liên kết chia sẻ địa điểm!",
      audioLoading: "Đang tải audio...",
      listenAudio: "Nghe thuyết minh",
      noAudio: "POI này chưa có audio thuyết minh.",
      previousImage: "Ảnh trước",
      nextImage: "Ảnh kế tiếp",
      viewImage: "Xem ảnh",
      liked: "Đã thích",
      like: "Yêu thích",
      shareShort: "Chia sẻ",
      origin: "Nguồn gốc",
      habitat: "Môi trường sống",
      characteristics: "Đặc điểm sinh học & tập tính",
      diet: "Thức ăn",
      weight: "Khối lượng",
      lifespan: "Tuổi thọ",
      desc: "",
    },
  },

  system: {
    offline: "Bạn đang ở chế độ ngoại tuyến.",
  },

  markers: {
    gate_main: {
      name: "Cổng chính (Cổng A)",
      zone: "Lối vào chính",
      desc: "Số 2 Nguyễn Bỉnh Khiêm, phường Bến Nghé, Quận 1. Điểm bán vé và quầy đón tiếp.",
    },

    gate_c: {
      name: "Cổng C (Nguyễn Thị Minh Khai)",
      zone: "Lối vào phụ",
      desc: "Lối vào từ đường Nguyễn Thị Minh Khai, thuận tiện cho xe buýt và người đi bộ.",
    },

    gate_d: {
      name: "Cổng D",
      zone: "Lối vào phụ",
      desc: "Lối vào phía Tây Bắc gần sông Thị Nghè.",
    },

    den_hung: {
      name: "Đền thờ Vua Hùng & Bảo tàng Lịch sử",
      zone: "Khu di tích lịch sử",
      desc: "Di tích lịch sử văn hóa với kiến trúc cung đình truyền thống đặc sắc.",
    },

    elephant: {
      name: "Voi Châu Á",
      zone: "Khu thú lớn",
      desc: "Đàn voi châu Á với khu sân rộng và hồ tắm tự nhiên.",
    },

    giraffe: {
      name: "Hươu Cao Cổ",
      zone: "Khu thú lớn",
      desc: "Khu vực tham quan hươu cao cổ.",
    },

    tiger: {
      name: "Hổ Đông Dương & Hổ Trắng",
      zone: "Khu thú ăn thịt",
      desc: "Các loài hổ quý hiếm được chăm sóc trong khu chuồng mô phỏng môi trường tự nhiên.",
    },

    lion: {
      name: "Sư Tử Châu Phi",
      zone: "Khu thú ăn thịt",
      desc: "Sư tử sinh sống theo tập tính bầy đàn tự nhiên.",
    },

    bear: {
      name: "Gấu Ngựa & Gấu Chó",
      zone: "Khu thú ăn thịt",
      desc: "Hai loài gấu có nguồn gốc từ châu Á.",
    },

    rhino_hippo: {
      name: "Hà Mã",
      zone: "Khu thú lớn",
      desc: "Hồ nước nơi những chú hà mã bơi lội và làm mát cơ thể.",
    },

    rhino: {
      name: "Tê Giác",
      zone: "Khu thú ăn cỏ",
      desc: "Khu vực tham quan tê giác.",
    },

    deer_area: {
      name: "Nai Cà Tông & Hươu Sao",
      zone: "Khu móng guốc",
      desc: "Khu đồi cỏ xanh nơi đàn nai gặm cỏ bên suối nhân tạo.",
    },

    monkey_primate: {
      name: "Đảo Khỉ & Vượn Đen Má Trắng",
      zone: "Khu linh trưởng",
      desc: "Khu vực có dây leo và cành cây cho các loài linh trưởng chuyền cành.",
    },

    birds_lake: {
      name: "Hồ Hồng Hạc & Chim Nước",
      zone: "Khu chim cảnh",
      desc: "Mặt hồ có hồng hạc, bồ nông và thiên nga.",
    },

    birds_pool: {
      name: "Chim Trong Hồ",
      zone: "Khu chim cảnh",
      desc: "Khu vực hồ nước nơi các loài chim thủy cầm bơi lội và kiếm ăn.",
    },

    botanical_garden: {
      name: "Vườn Phong Lan & Xương Rồng",
      zone: "Vườn thực vật",
      desc: "Bộ sưu tập phong lan và các loại cây cảnh.",
    },

    ferris_wheel: {
      name: "Vòng Đu Quay Khổng Lồ",
      zone: "Khu trò chơi",
      desc: "Ngắm toàn cảnh thành phố và mảng xanh Thảo Cầm Viên từ trên cao.",
    },

    stage_main: {
      name: "Sân Khấu Biểu Diễn Nghệ Thuật",
      zone: "Sân khấu trung tâm",
      desc: "Các chương trình biểu diễn dành cho thiếu nhi vào cuối tuần và ngày lễ.",
    },

    photo_spot_bridge: {
      name: "Cầu Kính & Vườn Hoa Sen",
      zone: "Điểm check-in",
      desc: "Góc chụp ảnh được yêu thích tại Thảo Cầm Viên.",
    },

    tram_station: {
      name: "Ga Xe Điện Du Lịch",
      zone: "Dịch vụ vận chuyển",
      desc: "Xe điện đưa đón du khách tham quan vườn thú với lời thuyết minh.",
    },

    restaurant_central: {
      name: "Nhà Hàng Cây Xanh & Quán Cà Phê",
      zone: "Ẩm thực & Giải khát",
      desc: "Phục vụ thức ăn, cà phê, kem và đồ uống.",
    },

    wc_main: {
      name: "Nhà Vệ Sinh Trung Tâm",
      zone: "Tiện ích vệ sinh",
      desc: "Nhà vệ sinh có tiện ích cho gia đình và người sử dụng xe lăn.",
    },

    wc_north: {
      name: "Nhà Vệ Sinh Khu Bờ Sông",
      zone: "Tiện ích vệ sinh",
      desc: "Nằm gần hồ nước và khu vực bãi giữ xe cổng D.",
    },

    medical_station: {
      name: "Trạm Y Tế & Sơ Cứu",
      zone: "Hỗ trợ y tế",
      desc: "Trạm hỗ trợ sơ cứu và chăm sóc sức khỏe cho khách tham quan.",
    },
  },

  route: {
    startBtn: "Tìm đường",
    mapChoice: "Chọn 2 điểm trên bản đồ",
    pickTwoPoints: "Chọn điểm xuất phát và điểm đến trên bản đồ",
    complete: "Đã tìm thấy đường đi ngắn nhất",
    distance: "Quãng đường",
    selectStart: "Chọn điểm xuất phát trên bản đồ",
    selectDestination: "Chọn điểm đến trên bản đồ",
    finding: "Đang tìm đường...",
    cancelBtn: "Hủy tìm đường",
    errorSamePoint: "Điểm xuất phát và điểm đến không được trùng nhau.",
    errorMissingPoint: "Vui lòng chọn cả điểm xuất phát và điểm đến.",
    errorNotFound: "Không tìm thấy điểm tham quan đã chọn.",
    errorNoRoute: "Không có đường đi giữa hai điểm này.",
    errorGeneric: "Không thể tìm đường lúc này. Vui lòng thử lại.",
    selectStartRequired: "Vui lòng chọn điểm xuất phát.",
    noRoute: "Không tìm thấy đường đi giữa 2 địa điểm này.",
    from: "Từ",
    to: "Đến",
    notSelected: "Chưa chọn",
    startPoint: "Điểm xuất phát",
    chooseLocation: "Chọn vị trí của bạn",
    calculating: "Đang tính…",
    findShortest: "Tìm đường ngắn nhất",
    steps: "chặng",
    viewOnMapHint: "Bấm \"Xem trên bản đồ\" để hiện đường đi",
    viewMap: "Xem trên bản đồ",
  },
};

export default VI;
