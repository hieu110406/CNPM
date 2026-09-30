// src/components/AudioMiniPlayer.js
// Thanh mini player thuyết minh (Audio Guide) — neo dưới đáy màn hình trên mobile

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../styles/theme";

export default function AudioMiniPlayer({
  track,
  isPlaying = false,
  progress = 0,
  onTogglePlay,
  onExpand,
  onClose,
}) {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (track) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [track]);

  if (!track) return null;

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ translateY: slideAnim }] }]}
    >
      {/* Thanh tiến trình mỏng trên đầu */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <TouchableOpacity
        style={styles.container}
        onPress={onExpand}
        activeOpacity={0.9}
      >
        {/* Emoji & hiệu ứng sóng */}
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>{track.emoji || "🎧"}</Text>
          {isPlaying && <View style={styles.pulseRing} />}
        </View>

        {/* Thông tin bài */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {track.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {isPlaying ? "Đang thuyết minh..." : "Tạm dừng"} •{" "}
            {track.zone || "Thảo Cầm Viên"}
          </Text>
        </View>

        {/* Nút điều khiển */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={onTogglePlay}
            style={styles.playBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={COLORS.slate400} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 90,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    ...SHADOWS.xl,
  },
  progressBg: {
    height: 3,
    backgroundColor: COLORS.slate100,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.emerald500,
    borderRadius: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.base,
    gap: SIZES.md,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.emerald50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarEmoji: {
    fontSize: 22,
  },
  pulseRing: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.emerald400,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.body,
    fontWeight: "700",
    color: COLORS.slate900,
  },
  subtitle: {
    fontSize: SIZES.small,
    color: COLORS.slate500,
    marginTop: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.emerald600,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
});
