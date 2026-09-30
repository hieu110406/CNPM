// src/screens/MapScreen.js
// Bản đồ tương tác Thảo Cầm Viên trên mobile
// Hỗ trợ: pan/zoom ảnh bản đồ, filter chip, marker overlay, info card

import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS } from "../styles/theme";
import {
  MARKERS,
  FILTER_CATEGORIES,
  TYPE_META,
} from "../data/mapData";
import FilterChips from "../components/FilterChips";
import SearchBar from "../components/SearchBar";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// Kích thước bản đồ gốc (zoo_map.png)
const MAP_W = 1371;
const MAP_H = 875;
const MAP_RATIO = MAP_H / MAP_W;
const DISPLAY_W = SCREEN_W;
const DISPLAY_H = DISPLAY_W * MAP_RATIO;

export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const selectedMarker = useMemo(
    () => MARKERS.find((m) => m.id === selectedId),
    [selectedId]
  );

  const filteredMarkers = useMemo(() => {
    if (typeFilter === "all") return MARKERS;
    return MARKERS.filter((m) => m.type === typeFilter);
  }, [typeFilter]);

  function selectMarker(marker) {
    setSelectedId(marker.id);
    setShowInfoModal(true);
  }

  function goToDetail(marker) {
    setShowInfoModal(false);
    navigation.navigate("Detail", { marker });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgScreen} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="map" size={22} color={COLORS.emerald600} />
          <Text style={styles.headerTitle}>Bản Đồ</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{filteredMarkers.length} điểm</Text>
        </View>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchArea}>
        <SearchBar markers={MARKERS} onSelectMarker={selectMarker} />
      </View>

      {/* Filter chip bar */}
      <FilterChips
        categories={FILTER_CATEGORIES}
        activeKey={typeFilter}
        onSelect={setTypeFilter}
      />

      {/* Bản đồ với markers */}
      <ScrollView
        style={styles.mapScroll}
        contentContainerStyle={styles.mapContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.mapInner}
        >
          <View style={styles.mapWrapper}>
            {/* Ảnh bản đồ - placeholder vì ảnh nằm ở thư mục web */}
            <View style={[styles.mapImage, { width: DISPLAY_W * 1.3, height: DISPLAY_H * 1.3 }]}>
              {/* Grid pattern giả lập bản đồ */}
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map-outline" size={48} color={COLORS.emerald300} />
                <Text style={styles.mapPlaceholderText}>
                  Bản đồ Thảo Cầm Viên
                </Text>
                <Text style={styles.mapPlaceholderHint}>
                  Thêm ảnh zoo_map.png vào assets để hiển thị
                </Text>
              </View>

              {/* Markers overlay */}
              {filteredMarkers.map((marker) => {
                const meta = TYPE_META[marker.type];
                const isSelected = selectedId === marker.id;
                const left = (marker.x / 100) * (DISPLAY_W * 1.3);
                const top = (marker.y / 100) * (DISPLAY_H * 1.3);

                return (
                  <TouchableOpacity
                    key={marker.id}
                    style={[
                      styles.marker,
                      {
                        left: left - 16,
                        top: top - 16,
                        backgroundColor: isSelected
                          ? meta?.color || COLORS.emerald600
                          : COLORS.white,
                        borderColor: meta?.color || COLORS.emerald600,
                      },
                      isSelected && styles.markerSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => selectMarker(marker)}
                  >
                    <Text
                      style={[
                        styles.markerEmoji,
                        isSelected && { fontSize: 16 },
                      ]}
                    >
                      {marker.emoji}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      {/* Nút điều khiển góc phải */}
      <View style={[styles.mapControls, { bottom: insets.bottom + 90 }]}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            setTypeFilter("all");
            setSelectedId(null);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color={COLORS.slate700} />
        </TouchableOpacity>
      </View>

      {/* ====== MODAL INFO CARD ====== */}
      <Modal
        visible={showInfoModal && !!selectedMarker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowInfoModal(false)}
        >
          <View style={styles.modalEmpty} />
        </TouchableOpacity>

        {selectedMarker && (
          <View style={[styles.infoCard, { paddingBottom: insets.bottom + SIZES.base }]}>
            {/* Drag handle */}
            <View style={styles.dragHandleRow}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.infoHeader}>
              <View
                style={[
                  styles.infoEmoji,
                  {
                    backgroundColor:
                      TYPE_META[selectedMarker.type]?.bgLight || COLORS.slate100,
                  },
                ]}
              >
                <Text style={styles.infoEmojiText}>{selectedMarker.emoji}</Text>
              </View>
              <View style={styles.infoHeaderText}>
                <Text style={styles.infoName}>{selectedMarker.name}</Text>
                <View style={styles.infoZoneRow}>
                  <View
                    style={[
                      styles.infoZoneDot,
                      {
                        backgroundColor:
                          TYPE_META[selectedMarker.type]?.color ||
                          COLORS.emerald600,
                      },
                    ]}
                  />
                  <Text style={styles.infoZone}>{selectedMarker.zone}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.infoClose}
                onPress={() => setShowInfoModal(false)}
              >
                <Ionicons name="close" size={20} color={COLORS.slate400} />
              </TouchableOpacity>
            </View>

            {/* Mô tả */}
            <Text style={styles.infoDesc}>{selectedMarker.desc}</Text>

            {/* Tags thông tin */}
            <View style={styles.infoTags}>
              {selectedMarker.feedingTime && (
                <View style={[styles.infoTag, { backgroundColor: "#fef3c7" }]}>
                  <Text style={styles.infoTagText}>
                    🍽 Giờ ăn: {selectedMarker.feedingTime}
                  </Text>
                </View>
              )}
              {selectedMarker.openingHours && (
                <View style={[styles.infoTag, { backgroundColor: "#dbeafe" }]}>
                  <Text style={styles.infoTagText}>
                    🕐 {selectedMarker.openingHours}
                  </Text>
                </View>
              )}
              {selectedMarker.audioAvailable && (
                <View style={[styles.infoTag, { backgroundColor: COLORS.emerald50 }]}>
                  <Text style={styles.infoTagText}>🎧 Có thuyết minh audio</Text>
                </View>
              )}
            </View>

            {/* Fun fact */}
            {selectedMarker.funFact && (
              <View style={styles.funFactBox}>
                <Text style={styles.funFactLabel}>💡 Bạn có biết?</Text>
                <Text style={styles.funFactText}>{selectedMarker.funFact}</Text>
              </View>
            )}

            {/* Nút xem chi tiết */}
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => goToDetail(selectedMarker)}
              activeOpacity={0.85}
            >
              <Text style={styles.detailBtnText}>Xem chi tiết</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
  },
  headerTitle: {
    fontSize: SIZES.heading,
    fontWeight: "800",
    color: COLORS.slate900,
  },
  headerBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.emerald50,
    borderWidth: 1,
    borderColor: COLORS.emerald200,
  },
  headerBadgeText: {
    fontSize: SIZES.small,
    fontWeight: "700",
    color: COLORS.emerald700,
  },
  searchArea: {
    paddingHorizontal: SIZES.base,
    marginBottom: SIZES.md,
    zIndex: 100,
  },

  /* ===== MAP ===== */
  mapScroll: {
    flex: 1,
  },
  mapContainer: {
    minHeight: DISPLAY_H * 1.3 + 40,
  },
  mapInner: {
    minWidth: DISPLAY_W * 1.3,
  },
  mapWrapper: {
    position: "relative",
  },
  mapImage: {
    backgroundColor: "#dff5e4",
    borderRadius: SIZES.radiusMd,
    overflow: "hidden",
    position: "relative",
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
  mapPlaceholderText: {
    fontSize: SIZES.subtitle,
    fontWeight: "600",
    color: COLORS.emerald700,
    marginTop: SIZES.sm,
  },
  mapPlaceholderHint: {
    fontSize: SIZES.small,
    color: COLORS.emerald600,
    marginTop: 4,
  },

  /* ===== MARKERS ===== */
  marker: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    ...SHADOWS.md,
  },
  markerSelected: {
    width: 38,
    height: 38,
    borderRadius: 19,
    ...SHADOWS.lg,
    zIndex: 10,
  },
  markerEmoji: {
    fontSize: 14,
  },

  /* ===== MAP CONTROLS ===== */
  mapControls: {
    position: "absolute",
    right: SIZES.base,
    gap: SIZES.sm,
  },
  controlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },

  /* ===== MODAL ===== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.bgOverlay,
  },
  modalEmpty: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    ...SHADOWS.xl,
  },
  dragHandleRow: {
    alignItems: "center",
    paddingVertical: SIZES.sm,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.slate300,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  infoEmoji: {
    width: 52,
    height: 52,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.md,
  },
  infoEmojiText: {
    fontSize: 26,
  },
  infoHeaderText: {
    flex: 1,
  },
  infoName: {
    fontSize: SIZES.title,
    fontWeight: "800",
    color: COLORS.slate900,
  },
  infoZoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  infoZoneDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  infoZone: {
    fontSize: SIZES.small,
    color: COLORS.slate500,
    fontWeight: "500",
  },
  infoClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  infoDesc: {
    fontSize: SIZES.body,
    color: COLORS.slate700,
    lineHeight: 21,
    marginBottom: SIZES.md,
  },
  infoTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  infoTag: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 5,
    borderRadius: SIZES.radiusFull,
  },
  infoTagText: {
    fontSize: SIZES.small,
    fontWeight: "600",
    color: COLORS.slate700,
  },
  funFactBox: {
    backgroundColor: COLORS.amber300 + "18",
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.base,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber400,
  },
  funFactLabel: {
    fontSize: SIZES.small,
    fontWeight: "700",
    color: COLORS.amber500,
    marginBottom: 4,
  },
  funFactText: {
    fontSize: SIZES.body,
    color: COLORS.slate700,
    lineHeight: 20,
  },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.sm,
    backgroundColor: COLORS.emerald600,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.md,
  },
  detailBtnText: {
    fontSize: SIZES.subtitle,
    fontWeight: "700",
    color: COLORS.white,
  },
});
