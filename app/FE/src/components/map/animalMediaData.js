// animalMediaData.js
// Dữ liệu hình ảnh chất lượng cao và thông tin sinh học chi tiết cho từng loài thú & địa điểm tại Thảo Cầm Viên

export const MARKER_DETAILS = {
  elephant: {
    scientificName: "Elephas maximus",
    commonName: "Voi Châu Á",
    origin: "Nam Á & Đông Nam Á",
    habitat: "Rừng mưa nhiệt đới, rừng rụng lá ẩm",
    diet: "Cỏ voi tươi, mía ngọt, thân cây chuối, củ cà rốt, ngô (~150kg/ngày)",
    lifespan: "60 - 70 năm",
    weight: "3.000 - 5.000 kg",
    conservation: {
      status: "Nguy cấp",
      code: "EN",
      badgeColor: "#dc2626",
      desc: "Sách đỏ Việt Nam & IUCN Red List",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80",
        caption: "Đàn voi châu Á tắm hồ tại Thảo Cầm Viên",
      },
      {
        url: "https://images.unsplash.com/photo-1581852017103-68ac65504071?auto=format&fit=crop&w=1200&q=80",
        caption: "Voi trưởng thành với cặp ngà trắng uy nghi",
      },
      {
        url: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1200&q=80",
        caption: "Khoảnh khắc voi dùng vòi hút nước giải nhiệt",
      },
    ],
    characteristics: [
      "Voi châu Á có đôi tai nhỏ hơn voi châu Phi và đỉnh đầu có hai gù nổi rõ.",
      "Chiếc vòi chứa hơn 40.000 bó cơ, có thể nhặt một hạt đậu nhỏ hoặc quật ngã thân cây to.",
      "Tại Thảo Cầm Viên, đàn voi được chăm sóc trong khuôn viên râm mát với hồ bơi tự nhiên và bãi cát vận động.",
    ],
    funFacts: [
      "Voi có trí nhớ phi thường và khả năng nhận biết bản thân qua gương soi.",
      "Giao tiếp bằng sóng hạ âm (infrasound) truyền qua lòng đất xa tới hàng chục cây số.",
    ],
  },

  giraffe: {
    scientificName: "Giraffa camelopardalis",
    commonName: "Hươu Cao Cổ",
    origin: "Các thảo nguyên Savanna Châu Phi",
    habitat: "Rừng thưa, đồng cỏ bán khô hạn",
    diet: "Lá cây keo gai, chồi non, cỏ tươi nén, cà rốt (~35kg/ngày)",
    lifespan: "25 - 30 năm",
    weight: "800 - 1.400 kg (Cao 4.5 - 5.8m)",
    conservation: {
      status: "Sắp nguy cấp",
      code: "VU",
      badgeColor: "#d97706",
      desc: "IUCN Vulnerable",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80",
        caption: "Chú hươu cao cổ vươn mình đón nắng mai",
      },
      {
        url: "https://images.unsplash.com/photo-1574870111867-089730e5a72b?auto=format&fit=crop&w=1200&q=80",
        caption: "Du khách cho hươu cao cổ ăn trực tiếp tại lan can",
      },
      {
        url: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80",
        caption: "Cận cảnh họa tiết đốm da độc bản không trùng lặp",
      },
    ],
    characteristics: [
      "Động vật có vú cao nhất hành tinh với chiếc cổ dài tới 2.4 mét.",
      "Chiếc lưỡi màu tím đen dài gần 45 - 50 cm giúp chúng cuốn lá cây gai mà không bị xước.",
      "Trái tim nặng tới 11kg với áp lực máu cực cao để bơm máu lên tận đỉnh đầu.",
    ],
    funFacts: [
      "Hươu cao cổ chỉ cần ngủ khoảng 10 đến 30 phút mỗi ngày và thường ngủ đứng.",
      "Mỗi cá thể hươu cao cổ sở hữu hoa văn đốm trên da độc nhất vô nhị như dấu vân tay người.",
    ],
  },

  tiger: {
    scientificName: "Panthera tigris corbetti",
    commonName: "Hổ Đông Dương & Hổ Trắng",
    origin: "Bán đảo Đông Dương (Việt Nam, Lào, Campuchia)",
    habitat: "Rừng nguyên sinh rậm rạp, vùng đồi núi đá",
    diet: "Thịt bò tươi, thịt gà, sườn heo nguyên tảng (6 - 8kg/ngày)",
    lifespan: "15 - 20 năm",
    weight: "150 - 230 kg",
    conservation: {
      status: "Cực kỳ nguy cấp",
      code: "CR",
      badgeColor: "#b91c1c",
      desc: "Sách đỏ Việt Nam hạng CR — Nghiêm cấm săn bắt",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
        caption: "Hổ Đông Dương với bộ lông vằn ánh cam oai vệ",
      },
      {
        url: "https://images.unsplash.com/photo-1500479694472-551d1fb6258d?auto=format&fit=crop&w=1200&q=80",
        caption: "Hổ trắng quý hiếm đang nghỉ ngơi bên tán cây xanh",
      },
      {
        url: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80",
        caption: "Ánh mắt sắc bén của chúa tể rừng già",
      },
    ],
    characteristics: [
      "Kích thước nhỏ hơn hổ Siberia nhưng cực kỳ nhanh nhẹn và thích bơi lội dưới nước.",
      "Khu chuồng tại Thảo Cầm Viên có vách kính an toàn cao cấp giúp khách ngắm cự ly gần.",
      "Được nuôi dưỡng theo chế độ dinh dưỡng nghiêm ngặt kèm vitamin bổ sung hàng ngày.",
    ],
    funFacts: [
      "Không chỉ có bộ lông có vằn, da của hổ cũng có các vằn tương tự in chìm.",
      "Tiếng gầm uy lực của hổ có tần số cực thấp làm tê liệt con mồi trong tích tắc.",
    ],
  },

  lion: {
    scientificName: "Panthera leo",
    commonName: "Sư Tử Châu Phi",
    origin: "Khu vực Đông Phi & Nam Phi",
    habitat: "Đồng cỏ hoang dã, thảo nguyên thưa",
    diet: "Thịt bò tươi, thịt sườn cừu (7 - 9kg/ngày)",
    lifespan: "14 - 18 năm",
    weight: "160 - 225 kg",
    conservation: {
      status: "Sắp nguy cấp",
      code: "VU",
      badgeColor: "#d97706",
      desc: "IUCN Vulnerable",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=1200&q=80",
        caption: "Sư tử đực với bờm sẫm màu uy lực",
      },
      {
        url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80",
        caption: "Sư tử thư thái phơi nắng trên mỏm đá nhân tạo",
      },
    ],
    characteristics: [
      "Loài thú họ mèo duy nhất sống theo bầy đàn gắn kết chặt chẽ (gọi là Pride).",
      "Sư tử đực sở hữu bờm dày bảo vệ cổ họng khi giao tranh và khẳng định vị thế.",
    ],
    funFacts: [
      "Sư tử dành đến 20 tiếng mỗi ngày để ngủ và thư giãn nhằm tiết kiệm năng lượng.",
      "Tiếng gầm của một con sư tử đực có thể vang vọng tới cự ly 8km.",
    ],
  },

  bear: {
    scientificName: "Ursus thibetanus / Helarctos malayanus",
    commonName: "Gấu Ngựa & Gấu Chó",
    origin: "Đông Nam Á & Rừng Trường Sơn Việt Nam",
    habitat: "Rừng nhiệt đới ẩm, vách đá râm mát",
    diet: "Mật ong tự nhiên, quả ngọt, trứng gà luộc, ngô ngọt, cá hấp",
    lifespan: "25 - 35 năm",
    weight: "65 - 150 kg",
    conservation: {
      status: "Nguy cấp",
      code: "EN",
      badgeColor: "#dc2626",
      desc: "Sách đỏ Việt Nam — Bảo vệ đặc biệt",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=1200&q=80",
        caption: "Gấu ngựa với vệt yếm chữ V màu vàng đặc trưng",
      },
      {
        url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80",
        caption: "Gấu trèo cây và thưởng thức hoa quả tươi",
      },
    ],
    characteristics: [
      "Gấu ngựa có vệt lông chữ V màu vàng kem hoặc trắng sáng trước ngực.",
      "Bàn chân có móng vuốt sắc khỏe giúp chúng leo trèo thoăn thoắt trên các cành cây lớn.",
    ],
    funFacts: [
      "Khứu giác của gấu nhạy bén gấp 7 lần loài chó săn tinh nhuệ nhất.",
      "Gấu chó là loài gấu nhỏ nhất thế giới nhưng có chiếc lưỡi dài tới 25cm.",
    ],
  },

  rhino_hippo: {
    scientificName: "Hippopotamus amphibius",
    commonName: "Hà Mã Châu Phi",
    origin: "Đầm lầy & sông ngòi Châu Phi cận Sahara",
    habitat: "Môi trường bán thủy sinh ven sông suối",
    diet: "Cỏ tươi mọc sát đất, rơm nén, bí đỏ, dưa hấu thanh mát (~40kg/ngày)",
    lifespan: "40 - 50 năm",
    weight: "1.300 - 1.800 kg",
    conservation: {
      status: "Sắp nguy cấp",
      code: "VU",
      badgeColor: "#d97706",
      desc: "IUCN Vulnerable",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80",
        caption: "Hà mã ngâm mình giải nhiệt trong hồ nước",
      },
      {
        url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80",
        caption: "Chú hà mã ngoi lên đùa giỡn cùng làn nước mát",
      },
    ],
    characteristics: [
      "Da hà mã tiết ra một chất dịch màu đỏ tự nhiên giúp chống nắng và kháng khuẩn hiệu quả.",
      "Có thể nín thở dưới mặt nước liên tục 5 - 8 phút.",
    ],
    funFacts: [
      "Dù thân hình tròn trịa nặng hàng tấn, hà mã có thể chạy nước rút đạt 30km/h trên cạn.",
      "Hà mã thực chất không biết bơi mà thường di chuyển bằng cách đi bộ hoặc nhảy đẩy dưới đáy nước.",
    ],
  },

  crocodile: {
    scientificName: "Crocodylus siamensis",
    commonName: "Cá Sấu Xiêm (Nước Ngọt)",
    origin: "Đông Nam Á & Lưu vực sông Mekong",
    habitat: "Đầm lầy nước ngọt chảy chậm, cửa sông",
    diet: "Cá tươi nguyên con, thịt gà sống, tôm cá nhỏ",
    lifespan: "50 - 70 năm",
    weight: "150 - 350 kg",
    conservation: {
      status: "Cực kỳ nguy cấp",
      code: "CR",
      badgeColor: "#b91c1c",
      desc: "Sách đỏ IUCN mức cực kỳ nguy cấp",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1520542383737-936530dc378c?auto=format&fit=crop&w=1200&q=80",
        caption: "Cá sấu xiêm phơi mình đón nhiệt lượng trên mỏm đất",
      },
      {
        url: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80",
        caption: "Đôi mắt tinh anh rình mồi của loài bò sát cổ đại",
      },
    ],
    characteristics: [
      "Loài bò sát cổ đại đã tồn tại từ thời kỳ khủng long hơn 80 triệu năm trước.",
      "Có màng bảo vệ trong suốt trên mắt giúp chúng quan sát rõ ràng ngay cả khi lặn dưới nước.",
    ],
    funFacts: [
      "Cá sấu mở miệng khi tắm nắng không phải để đe dọa mà là cách để điều hòa thân nhiệt.",
      "Lực cắn của cá sấu thuộc nhóm mạnh nhất hành tinh, có thể nghiền nát mai rùa cứng.",
    ],
  },

  birds_lake: {
    scientificName: "Phoenicopterus roseus",
    commonName: "Hồng Hạc & Thủy Cầm",
    origin: "Châu Phi, Nam Âu & Tây Á",
    habitat: "Hồ nước nông, đầm phá ngập mặn",
    diet: "Tảo lục, giáp xác nhỏ, phù du giàu sắc tố carotenoid",
    lifespan: "30 - 45 năm",
    weight: "2.5 - 4 kg",
    conservation: {
      status: "Ít quan tâm",
      code: "LC",
      badgeColor: "#16a34a",
      desc: "Quần thể ổn định",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        caption: "Đàn hồng hạc khoe sắc rực rỡ bên mặt hồ",
      },
      {
        url: "https://images.unsplash.com/photo-1497206365907-f5e630693df0?auto=format&fit=crop&w=1200&q=80",
        caption: "Tư thế đứng một chân trứ danh của chim hồng hạc",
      },
    ],
    characteristics: [
      "Bộ lông màu hồng cánh sen quý phái do hấp thụ sắc tố hữu cơ từ thức ăn tôm nhỏ.",
      "Chiếc mỏ cong đặc biệt hoạt động như một cái rây lọc bùn cát để giữ lại vi sinh vật.",
    ],
    funFacts: [
      "Hồng hạc thường đứng một chân để giảm thiểu sự mất nhiệt của cơ thể vào nước.",
      "Cả chim bố và mẹ đều có thể tiết ra 'sữa diều' màu hồng bổ dưỡng để mớm cho con non.",
    ],
  },

  monkey_primate: {
    scientificName: "Nomascus leucogenys",
    commonName: "Vượn Đen Má Trắng & Linh Trưởng",
    origin: "Việt Nam, Lào & Nam Trung Quốc",
    habitat: "Rừng mưa nhiệt đới nguyên sinh nhiều tầng",
    diet: "Trái cây chín mọng, lá non, hoa quả dại, côn trùng",
    lifespan: "28 - 35 năm",
    weight: "6 - 9 kg",
    conservation: {
      status: "Cực kỳ nguy cấp",
      code: "CR",
      badgeColor: "#b91c1c",
      desc: "Biểu tượng bảo tồn linh trưởng quý hiếm",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1200&q=80",
        caption: "Vượn đen má trắng chuyền cành điệu nghệ trên đảo khỉ",
      },
      {
        url: "https://images.unsplash.com/photo-1567270671170-fdc10a5bf831?auto=format&fit=crop&w=1200&q=80",
        caption: "Ánh mắt thông minh và cử chỉ thân thiện với con người",
      },
    ],
    characteristics: [
      "Con đực trưởng thành có màu lông đen tuyền với hai mảng má trắng nổi bật.",
      "Cánh tay dài vượt trội giúp chúng di chuyển bằng phương thức đu chuyền cành thoăn thoắt.",
    ],
    funFacts: [
      "Vượn hót song ca vào buổi sáng sớm để đánh dấu chủ quyền lãnh thổ gia đình.",
      "Vượn sống chung thủy theo chế độ một vợ một chồng suốt đời.",
    ],
  },

  deer_area: {
    scientificName: "Rucervus eldii / Cervus nippon",
    commonName: "Nai Cà Tông & Hươu Sao",
    origin: "Đông Dương & Việt Nam",
    habitat: "Rừng khộp, thung lũng cỏ thấp",
    diet: "Cỏ ngọt, cành lá non, cà rốt, khoai lang ngọt",
    lifespan: "18 - 22 năm",
    weight: "80 - 150 kg",
    conservation: {
      status: "Nguy cấp",
      code: "EN",
      badgeColor: "#dc2626",
      desc: "Sách đỏ Việt Nam",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=1200&q=80",
        caption: "Chú nai đực với cặp sừng phân nhánh tuyệt đẹp",
      },
      {
        url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
        caption: "Bầy hươu sao gặm cỏ thanh bình bên suối nhân tạo",
      },
    ],
    characteristics: [
      "Nai cà tông có cặp sừng uốn cong hình cánh cung rất độc đáo ở con đực.",
      "Bản tính hiền lành, thân thiện với trẻ em và du khách tham quan.",
    ],
    funFacts: [
      "Nhung hươu rụng và mọc lại hàng năm với tốc độ phát triển mô sụn nhanh nhất giới động vật.",
      "Hươu sao có thị giác ban đêm rất tốt để phát hiện kẻ thù săn mồi từ xa.",
    ],
  },

  botanical_garden: {
    scientificName: "Orchidaceae & Cactaceae Collection",
    commonName: "Vườn Phong Lan & Cây Cổ Thụ",
    origin: "Việt Nam & Khí hậu nhiệt đới",
    habitat: "Nhà kính ẩm & Vườn thực vật ngoài trời",
    diet: "Chăm sóc bằng phân bón vi sinh & sương ẩm tự nhiên",
    lifespan: "Nhiều cây cổ thụ > 150 tuổi",
    conservation: {
      status: "Di sản xanh",
      code: "HERITAGE",
      badgeColor: "#059669",
      desc: "Bảo tồn di sản xanh 160 năm lịch sử",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80",
        caption: "Muôn sắc hoa lan khoe sắc rực rỡ trong nhà kính",
      },
      {
        url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
        caption: "Cây cổ thụ tỏa bóng mát xum xuê giữa lòng Sài Gòn",
      },
    ],
    characteristics: [
      "Hơn 2.000 cá thể cây cổ thụ quý hiếm, trong đó nhiều cây được trồng từ năm 1864 thời Pháp.",
      "Khu trưng bày xương rồng sa mạc và hàng trăm giống lan rừng đặc hữu Đông Nam Á.",
    ],
    funFacts: [
      "Thảo Cầm Viên Sài Gòn từng do nhà thực vật học người Pháp Jean Baptiste Louis Pierre làm giám đốc đầu tiên.",
      "Nơi đây được mệnh danh là 'lá phổi xanh khổng lồ' điều hòa vi khí hậu cho cả trung tâm Quận 1.",
    ],
  },

  den_hung: {
    scientificName: "Hung Kings Memorial Temple",
    commonName: "Đền Thờ Vua Hùng & Bảo Tàng Lịch Sử",
    origin: "Xây dựng năm 1926",
    habitat: "Khuôn viên di tích văn hóa lịch sử",
    conservation: {
      status: "Di tích lịch sử",
      code: "HISTORIC",
      badgeColor: "#e11d48",
      desc: "Di tích cấp Thành phố",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
        caption: "Kiến trúc mái ngói cung đình truyền thống thâm nghiêm",
      },
      {
        url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80",
        caption: "Không gian trầm mặc cổ kính gợi nhớ nguồn cội dân tộc",
      },
    ],
    characteristics: [
      "Kiến trúc mang đậm phong cách cung đình triều Nguyễn với rồng chầu mặt nguyệt tinh xảo.",
      "Nơi tổ chức Đại lễ Giỗ Tổ Hùng Vương (10/3 Âm lịch) trang trọng hàng năm của TP.HCM.",
    ],
    funFacts: [
      "Nguyên thủy đền có tên gọi là Kỷ niệm Đài (Temple du Souvenir) xây dựng vào năm 1926.",
      "Bên trong đền lưu giữ chiếc trống đồng Đông Sơn cổ và các bức hoành phi sơn son thiếp vàng.",
    ],
  },
};

// Hàm lấy thông tin chi tiết đầy đủ với fallback thông minh
export function getMarkerDetails(marker) {
  if (!marker) return null;

  const existing = MARKER_DETAILS[marker.id];
  if (existing) {
    return {
      ...marker,
      ...existing,
      images: existing.images || [],
    };
  }

  // Fallback thông minh theo type nếu chưa có chi tiết chuyên biệt
  const categoryImages = {
    animal: [
      {
        url: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80",
        caption: `Khu vực nuôi dưỡng ${marker.name}`,
      },
      {
        url: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80",
        caption: "Khuôn viên sinh thái mô phỏng môi trường tự nhiên",
      },
    ],
    plant: [
      {
        url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80",
        caption: `${marker.name} — Không gian xanh mát`,
      },
    ],
    entertainment: [
      {
        url: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80",
        caption: `Khu vui chơi giải trí ${marker.name}`,
      },
    ],
    building: [
      {
        url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
        caption: `${marker.name} — Công trình lịch sử Thảo Cầm Viên`,
      },
    ],
    restaurant: [
      {
        url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        caption: "Không gian ẩm thực & cà phê giải khát râm mát",
      },
    ],
    service: [
      {
        url: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80",
        caption: `Dịch vụ tiện ích phục vụ khách tham quan`,
      },
    ],
  };

  return {
    ...marker,
    scientificName: marker.type === "animal" ? `${marker.name} (Specimen)` : undefined,
    origin: "Đông Nam Á & Thảo Cầm Viên Sài Gòn",
    habitat: marker.zone || "Khuôn viên Thảo Cầm Viên",
    diet: marker.feedingTime ? `Chế độ dinh dưỡng khoa học (Giờ cho ăn: ${marker.feedingTime})` : undefined,
    images: categoryImages[marker.type] || categoryImages.animal,
    characteristics: [
      marker.desc,
      "Được chăm sóc theo quy chuẩn vườn thú chuẩn quốc tế WAZA và SEAZA.",
    ],
    funFacts: marker.funFact ? [marker.funFact] : ["Thảo Cầm Viên là một trong những vườn thú lâu đời nhất trên thế giới."],
  };
}
