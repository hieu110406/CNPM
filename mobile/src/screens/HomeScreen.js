// src/screens/HomeScreen.js
// Màn hình chính (Trang chủ) — Mobile Thảo Cầm Viên Sài Gòn
// Hiển thị Hero banner, tìm kiếm nhanh, khu vực nổi bật & thông tin giờ mở cửa

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS } from "../styles/theme";
import { MARKERS, HIGHLIGHT_GROUPS, FILTER_CATEGORIES } from "../data/mapData";
import SearchBar from "../components/SearchBar";
import ZoneHighlight from "../components/ZoneHighlight";

const { width: SCREEN_W } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Parallax cho hero
  const heroTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [50, 0, -60],
    extrapolate: "clamp",
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  function handleMarkerSelect(marker) {
    navigation.navigate("Detail", { marker });
  }

  function handleGroupPress(group) {
    if (selectedGroupId === group.id) {
      setSelectedGroupId(null);
    } else {
      setSelectedGroupId(group.id);
    }
  }

  // Lấy danh sách thú trong group đang chọn
  const selectedGroup = HIGHLIGHT_GROUPS.find((g) => g.id === selectedGroupId);
  const groupMembers = selectedGroup
    ? MARKERS.filter((m) => selectedGroup.memberIds.includes(m.id))
    : [];

  // Quick stats
  const animalCount = MARKERS.filter((m) => m.type === "animal").length;
  const totalPoints = MARKERS.length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.emerald950} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ====== HERO BANNER ====== */}
        <Animated.View
          style={[
            styles.heroBanner,
            {
              transform: [{ translateY: heroTranslateY }],
              opacity: heroOpacity,
            },
          ]}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroLogoRow}>
              <Text style={styles.heroEmoji}>🐅</Text>
              <View style={styles.heroLiveDot}>
                <View style={styles.heroLiveDotInner} />
              </View>
            </View>

            <Text style={styles.heroTitle}>Thảo Cầm Viên</Text>
            <Text style={styles.heroSubtitle}>
              Saigon Zoo & Botanical Gardens
            </Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Est. 1864</Text>
            </View>

            {/* Thông tin nhanh */}
            <View style={styles.heroInfoRow}>
              <View style={styles.heroInfoChip}>
                <Ionicons name="time-outline" size={14} color={COLORS.emerald300} />
                <Text style={styles.heroInfoText}>07:00 - 18:30</Text>
              </View>
              <View style={styles.heroInfoChip}>
                <Ionicons name="partly-sunny-outline" size={14} color={COLORS.amber300} />
                <Text style={styles.heroInfoText}>TP.HCM 31°C</Text>
              </View>
            </View>
          </View>

          {/* Nút mua vé */}
          <TouchableOpacity style={styles.ticketBtn} activeOpacity={0.85}>
            <Ionicons name="ticket-outline" size={18} color={COLORS.white} />
            <Text style={styles.ticketBtnText}>Mua vé online</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ====== NỘI DUNG CHÍNH ====== */}
        <View style={styles.mainContent}>
          {/* Thanh tìm kiếm */}
          <View style={styles.searchSection}>
            <SearchBar markers={MARKERS} onSelectMarker={handleMarkerSelect} />
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🦁</Text>
              <Text style={styles.statValue}>{animalCount}</Text>
              <Text style={styles.statLabel}>Loài động vật</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📍</Text>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Điểm tham quan</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🌳</Text>
              <Text style={styles.statValue}>20</Text>
              <Text style={styles.statLabel}>Hecta xanh</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎧</Text>
              <Text style={styles.statValue}>Audio</Text>
              <Text style={styles.statLabel}>Thuyết minh</Text>
            </View>
          </View>

          {/* ====== KHU VỰC NỔI BẬT ====== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🧭 Khám Phá Khu Vực</Text>
              <Text style={styles.sectionCount}>
                {HIGHLIGHT_GROUPS.length} khu vực
              </Text>
            </View>

            {HIGHLIGHT_GROUPS.map((group) => (
              <View key={group.id}>
                <ZoneHighlight
                  group={group}
                  isSelected={selectedGroupId === group.id}
                  onPress={handleGroupPress}
                />

                {/* Hiện danh sách thú khi chọn group */}
                {selectedGroupId === group.id && groupMembers.length > 0 && (
                  <View style={styles.groupExpanded}>
                    {groupMembers.map((marker) => (
                      <TouchableOpacity
                        key={marker.id}
                        style={styles.memberRow}
                        onPress={() => handleMarkerSelect(marker)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.memberEmoji}>{marker.emoji}</Text>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{marker.name}</Text>
                          <Text style={styles.memberZone}>{marker.zone}</Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={COLORS.slate300}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* ====== BANNER TOUR XE ĐIỆN ====== */}
          <TouchableOpacity
            style={styles.tourBanner}
            activeOpacity={0.85}
            onPress={() => {
              const tram = MARKERS.find((m) => m.id === "tram_station");
              if (tram) handleMarkerSelect(tram);
            }}
          >
            <View style={styles.tourBannerHead}>
              <Text style={styles.tourBannerEmoji}>🚂</Text>
              <View>
                <Text style={styles.tourBannerTitle}>
                  Tour Xe Điện Khám Phá
                </Text>
                <Text style={styles.tourBannerDesc}>
                  Dạo quanh 20 hecta vườn thú với lời bình audio
                </Text>
              </View>
            </View>
            <View style={styles.tourBannerFoot}>
              <Text style={styles.tourBannerPrice}>20.000đ / vé</Text>
              <View style={styles.tourBannerLink}>
                <Text style={styles.tourBannerLinkText}>Xem vị trí ga</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={COLORS.emerald600}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Spacer cho bottom tab */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.emerald950,
  },

  /* ===== HERO ===== */
  heroBanner: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxl,
    backgroundColor: COLORS.emerald950,
  },
  heroContent: {
    marginBottom: SIZES.lg,
  },
  heroLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroLiveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(16,185,129,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SIZES.sm,
  },
  heroLiveDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emerald400,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.emerald300,
    marginTop: 4,
    fontWeight: "500",
  },
  heroBadge: {
    alignSelf: "flex-start",
    marginTop: SIZES.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    backgroundColor: "rgba(16,185,129,0.15)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emerald400,
    letterSpacing: 0.5,
  },
  heroInfoRow: {
    flexDirection: "row",
    marginTop: SIZES.base,
    gap: SIZES.md,
  },
  heroInfoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroInfoText: {
    fontSize: SIZES.small,
    color: COLORS.emerald200,
    fontWeight: "600",
  },
  ticketBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.sm,
    backgroundColor: COLORS.emerald600,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.lg,
  },
  ticketBtnText: {
    fontSize: SIZES.subtitle,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* ===== MAIN CONTENT ===== */
  mainContent: {
    backgroundColor: COLORS.bgScreen,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    marginTop: -SIZES.base,
    paddingTop: SIZES.lg,
    minHeight: 600,
  },
  searchSection: {
    paddingHorizontal: SIZES.base,
    marginBottom: SIZES.lg,
    zIndex: 100,
  },

  /* ===== STATS ===== */
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: SIZES.base,
    gap: SIZES.sm,
    marginBottom: SIZES.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    ...SHADOWS.sm,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.title,
    fontWeight: "800",
    color: COLORS.emerald700,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.slate500,
    fontWeight: "500",
    marginTop: 2,
  },

  /* ===== SECTIONS ===== */
  section: {
    paddingHorizontal: SIZES.base,
    marginBottom: SIZES.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.heading,
    fontWeight: "800",
    color: COLORS.slate900,
  },
  sectionCount: {
    fontSize: SIZES.small,
    color: COLORS.slate500,
    fontWeight: "500",
  },

  /* ===== GROUP EXPANDED ===== */
  groupExpanded: {
    marginBottom: SIZES.sm,
    marginLeft: SIZES.xl,
    paddingLeft: SIZES.md,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.emerald200,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusSm,
    marginBottom: 6,
    ...SHADOWS.sm,
  },
  memberEmoji: {
    fontSize: 20,
    marginRight: SIZES.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.slate900,
  },
  memberZone: {
    fontSize: SIZES.caption,
    color: COLORS.slate500,
  },

  /* ===== TOUR BANNER ===== */
  tourBanner: {
    marginHorizontal: SIZES.base,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.base,
    borderWidth: 1.5,
    borderColor: COLORS.emerald200,
    ...SHADOWS.md,
  },
  tourBannerHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  tourBannerEmoji: {
    fontSize: 32,
  },
  tourBannerTitle: {
    fontSize: SIZES.subtitle,
    fontWeight: "700",
    color: COLORS.slate900,
  },
  tourBannerDesc: {
    fontSize: SIZES.small,
    color: COLORS.slate600,
    marginTop: 2,
  },
  tourBannerFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  tourBannerPrice: {
    fontSize: SIZES.subtitle,
    fontWeight: "800",
    color: COLORS.emerald700,
  },
  tourBannerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tourBannerLinkText: {
    fontSize: SIZES.small,
    fontWeight: "600",
    color: COLORS.emerald600,
  },
});
