// src/screens/DetailScreen.js
// Màn hình chi tiết cho mỗi điểm tham quan / động vật
// Hiển thị: emoji hero, mô tả, fun fact, giờ ăn, giờ mở cửa, thuyết minh audio

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS } from "../styles/theme";
import { TYPE_META, MARKERS } from "../data/mapData";

export default function DetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { marker } = route.params;
  const meta = TYPE_META[marker.type] || {};
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in content
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Tìm các địa điểm gần (cùng zone)
  const nearbyMarkers = MARKERS.filter(
    (m) => m.zone === marker.zone && m.id !== marker.id
  ).slice(0, 3);

  // Giả lập giờ hiện tại
  const currentHour = new Date().getHours();
  const isOpen =
    marker.openingHours && currentHour >= 7 && currentHour < 18;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={meta.color || COLORS.emerald900} />

      {/* ====== HERO HEADER ====== */}
      <View style={[styles.hero, { backgroundColor: meta.color || COLORS.emerald800 }]}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Emoji lớn */}
        <View style={styles.heroEmoji}>
          <Text style={styles.heroEmojiText}>{marker.emoji}</Text>
        </View>

        <Text style={styles.heroName}>{marker.name}</Text>
        <View style={styles.heroZoneRow}>
          <View style={styles.heroZoneDot} />
          <Text style={styles.heroZone}>{marker.zone}</Text>
        </View>

        {/* Type label */}
        <View style={styles.heroTypeBadge}>
          <Text style={styles.heroTypeText}>{meta.label || marker.type}</Text>
        </View>
      </View>

      {/* ====== NỘI DUNG ====== */}
      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Mô tả */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Giới thiệu</Text>
          <Text style={styles.descText}>{marker.desc}</Text>
        </View>

        {/* Thẻ thông tin nhanh */}
        <View style={styles.infoGrid}>
          {marker.openingHours && (
            <View style={[styles.infoGridItem, styles.infoGridHours]}>
              <Ionicons name="time-outline" size={20} color={COLORS.info} />
              <Text style={styles.infoGridLabel}>Giờ mở cửa</Text>
              <Text style={styles.infoGridValue}>{marker.openingHours}</Text>
              {isOpen !== undefined && (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOpen ? COLORS.success : COLORS.danger },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {isOpen ? "Đang mở" : "Đã đóng"}
                  </Text>
                </View>
              )}
            </View>
          )}

          {marker.feedingTime && (
            <View style={[styles.infoGridItem, styles.infoGridFeeding]}>
              <Text style={{ fontSize: 20 }}>🍽</Text>
              <Text style={styles.infoGridLabel}>Giờ cho ăn</Text>
              <Text style={styles.infoGridValue}>{marker.feedingTime}</Text>
            </View>
          )}

          {marker.audioAvailable && (
            <View style={[styles.infoGridItem, styles.infoGridAudio]}>
              <Ionicons name="headset" size={20} color={COLORS.emerald600} />
              <Text style={styles.infoGridLabel}>Thuyết minh</Text>
              <Text style={styles.infoGridValue}>Có sẵn audio</Text>
            </View>
          )}
        </View>

        {/* Fun Fact */}
        {marker.funFact && (
          <View style={styles.funFactCard}>
            <View style={styles.funFactHeader}>
              <Text style={{ fontSize: 18 }}>💡</Text>
              <Text style={styles.funFactTitle}>Bạn có biết?</Text>
            </View>
            <Text style={styles.funFactText}>{marker.funFact}</Text>
          </View>
        )}

        {/* Audio Player (nếu có) */}
        {marker.audioAvailable && (
          <View style={styles.audioSection}>
            <Text style={styles.sectionTitle}>🎧 Nghe Thuyết Minh</Text>
            <View style={styles.audioCard}>
              <View style={styles.audioInfo}>
                <Text style={styles.audioEmoji}>{marker.emoji}</Text>
                <View>
                  <Text style={styles.audioTitle}>{marker.name}</Text>
                  <Text style={styles.audioDuration}>
                    {isAudioPlaying ? "Đang phát..." : "Nhấn để nghe"} • ~2:20
                  </Text>
                </View>
              </View>

              {/* Thanh progress */}
              <View style={styles.audioProgressBg}>
                <View
                  style={[
                    styles.audioProgressFill,
                    { width: `${audioProgress}%` },
                  ]}
                />
              </View>

              {/* Controls */}
              <View style={styles.audioControls}>
                <TouchableOpacity style={styles.audioSkipBtn}>
                  <Ionicons name="play-back" size={18} color={COLORS.slate500} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.audioPlayBtn}
                  onPress={() => setIsAudioPlaying(!isAudioPlaying)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isAudioPlaying ? "pause" : "play"}
                    size={24}
                    color={COLORS.white}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.audioSkipBtn}>
                  <Ionicons
                    name="play-forward"
                    size={18}
                    color={COLORS.slate500}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Địa điểm gần */}
        {nearbyMarkers.length > 0 && (
          <View style={styles.nearbySection}>
            <Text style={styles.sectionTitle}>📍 Gần đây</Text>
            {nearbyMarkers.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.nearbyCard}
                onPress={() =>
                  navigation.push("Detail", { marker: m })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.nearbyEmoji}>{m.emoji}</Text>
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyName}>{m.name}</Text>
                  <Text style={styles.nearbyZone}>{m.zone}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.slate300}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  /* ===== HERO ===== */
  hero: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xxxl,
    paddingBottom: SIZES.xxl,
    borderBottomLeftRadius: SIZES.radiusXl,
    borderBottomRightRadius: SIZES.radiusXl,
    alignItems: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: SIZES.md,
    left: SIZES.base,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  shareBtn: {
    position: "absolute",
    top: SIZES.md,
    right: SIZES.base,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.md,
  },
  heroEmojiText: {
    fontSize: 42,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  heroZoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  heroZoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  heroZone: {
    fontSize: SIZES.body,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  heroTypeBadge: {
    marginTop: SIZES.md,
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  heroTypeText: {
    fontSize: SIZES.small,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* ===== CONTENT ===== */
  content: {
    flex: 1,
    marginTop: -SIZES.md,
  },
  contentInner: {
    paddingTop: SIZES.xl,
    paddingHorizontal: SIZES.base,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.title,
    fontWeight: "800",
    color: COLORS.slate900,
    marginBottom: SIZES.md,
  },
  descText: {
    fontSize: SIZES.body,
    color: COLORS.slate700,
    lineHeight: 22,
  },

  /* ===== INFO GRID ===== */
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  infoGridItem: {
    flex: 1,
    minWidth: "45%",
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    ...SHADOWS.sm,
  },
  infoGridHours: {},
  infoGridFeeding: {},
  infoGridAudio: {},
  infoGridLabel: {
    fontSize: SIZES.caption,
    color: COLORS.slate500,
    fontWeight: "500",
    marginTop: SIZES.sm,
  },
  infoGridValue: {
    fontSize: SIZES.body,
    fontWeight: "700",
    color: COLORS.slate900,
    marginTop: 2,
  },
  statusDot: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
    marginTop: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* ===== FUN FACT ===== */
  funFactCard: {
    backgroundColor: "#fffbeb",
    borderRadius: SIZES.radiusMd,
    padding: SIZES.base,
    marginBottom: SIZES.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber400,
  },
  funFactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  funFactTitle: {
    fontSize: SIZES.subtitle,
    fontWeight: "700",
    color: COLORS.amber500,
  },
  funFactText: {
    fontSize: SIZES.body,
    color: COLORS.slate700,
    lineHeight: 21,
  },

  /* ===== AUDIO ===== */
  audioSection: {
    marginBottom: SIZES.lg,
  },
  audioCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.base,
    borderWidth: 1.5,
    borderColor: COLORS.emerald200,
    ...SHADOWS.md,
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  audioEmoji: {
    fontSize: 28,
  },
  audioTitle: {
    fontSize: SIZES.body,
    fontWeight: "700",
    color: COLORS.slate900,
  },
  audioDuration: {
    fontSize: SIZES.small,
    color: COLORS.slate500,
    marginTop: 2,
  },
  audioProgressBg: {
    height: 4,
    backgroundColor: COLORS.slate100,
    borderRadius: 2,
    marginBottom: SIZES.md,
    overflow: "hidden",
  },
  audioProgressFill: {
    height: "100%",
    backgroundColor: COLORS.emerald500,
    borderRadius: 2,
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.xl,
  },
  audioSkipBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.slate50,
    alignItems: "center",
    justifyContent: "center",
  },
  audioPlayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.emerald600,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.lg,
  },

  /* ===== NEARBY ===== */
  nearbySection: {
    marginBottom: SIZES.lg,
  },
  nearbyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    ...SHADOWS.sm,
  },
  nearbyEmoji: {
    fontSize: 22,
    marginRight: SIZES.md,
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyName: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.slate900,
  },
  nearbyZone: {
    fontSize: SIZES.small,
    color: COLORS.slate500,
    marginTop: 2,
  },
});
