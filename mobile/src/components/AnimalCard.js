// src/components/AnimalCard.js
// Thẻ hiển thị thông tin điểm/động vật — dạng Card có animation nhấn

import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../styles/theme";
import { TYPE_META } from "../data/mapData";

export default function AnimalCard({ marker, onPress, style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const meta = TYPE_META[marker.type] || {};

  function handlePressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={() => onPress?.(marker)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.card}
      >
        {/* Emoji avatar lớn */}
        <View style={[styles.emojiBox, { backgroundColor: meta.bgLight }]}>
          <Text style={styles.emoji}>{marker.emoji}</Text>
          {marker.audioAvailable && (
            <View style={styles.audioBadge}>
              <Ionicons name="headset" size={10} color={COLORS.white} />
            </View>
          )}
        </View>

        {/* Nội dung */}
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {marker.name}
            </Text>
          </View>

          <View style={styles.zoneRow}>
            <View style={[styles.typeDot, { backgroundColor: meta.color }]} />
            <Text style={styles.zone} numberOfLines={1}>
              {marker.zone}
            </Text>
          </View>

          <Text style={styles.desc} numberOfLines={2}>
            {marker.desc}
          </Text>

          {/* Thẻ thông tin phụ */}
          <View style={styles.tagsRow}>
            {marker.feedingTime && (
              <View style={[styles.tag, styles.tagFeeding]}>
                <Text style={styles.tagText}>🍽 {marker.feedingTime}</Text>
              </View>
            )}
            {marker.openingHours && (
              <View style={[styles.tag, styles.tagHours]}>
                <Text style={styles.tagText}>🕐 {marker.openingHours}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Mũi tên điều hướng */}
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={18} color={COLORS.slate300} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    ...SHADOWS.md,
  },
  emojiBox: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.md,
    position: "relative",
  },
  emoji: {
    fontSize: 28,
  },
  audioBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.emerald500,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  body: {
    flex: 1,
    marginRight: SIZES.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    fontSize: SIZES.subtitle,
    fontWeight: "700",
    color: COLORS.slate900,
    flex: 1,
  },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  zone: {
    fontSize: SIZES.small,
    color: COLORS.slate500,
    fontWeight: "500",
  },
  desc: {
    fontSize: SIZES.small,
    color: COLORS.slate600,
    lineHeight: 17,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusFull,
  },
  tagFeeding: {
    backgroundColor: "#fef3c7",
  },
  tagHours: {
    backgroundColor: "#dbeafe",
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slate700,
  },
  chevron: {
    paddingLeft: 4,
  },
});
