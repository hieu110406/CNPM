// src/components/ZoneHighlight.js
// Card khu vực nổi bật — hiện trên tab Khám phá

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

export default function ZoneHighlight({ group, isSelected, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress?.(group)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        {/* Emoji lớn */}
        <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
          <Text style={styles.emoji}>{group.emoji}</Text>
        </View>

        {/* Nội dung */}
        <View style={styles.body}>
          <Text style={[styles.title, isSelected && styles.titleSelected]}>
            {group.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {group.subtitle}
          </Text>
        </View>

        {/* Badge & chevron */}
        <View style={styles.right}>
          <View style={[styles.badge, isSelected && styles.badgeSelected]}>
            <Text
              style={[styles.badgeText, isSelected && styles.badgeTextSelected]}
            >
              {group.badge}
            </Text>
          </View>
          <Ionicons
            name={isSelected ? "chevron-down" : "chevron-forward"}
            size={16}
            color={isSelected ? COLORS.emerald600 : COLORS.slate400}
          />
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
    marginBottom: SIZES.sm,
    borderWidth: 1.5,
    borderColor: COLORS.slate100,
    ...SHADOWS.sm,
  },
  cardSelected: {
    backgroundColor: COLORS.emerald50,
    borderColor: COLORS.emerald300,
    ...SHADOWS.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.slate50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.md,
  },
  iconBoxSelected: {
    backgroundColor: COLORS.emerald100,
  },
  emoji: {
    fontSize: 24,
  },
  body: {
    flex: 1,
    marginRight: SIZES.sm,
  },
  title: {
    fontSize: SIZES.body,
    fontWeight: "700",
    color: COLORS.slate900,
    marginBottom: 2,
  },
  titleSelected: {
    color: COLORS.emerald800,
  },
  subtitle: {
    fontSize: SIZES.small,
    color: COLORS.slate500,
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.slate100,
  },
  badgeSelected: {
    backgroundColor: COLORS.emerald200,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate600,
  },
  badgeTextSelected: {
    color: COLORS.emerald800,
  },
});
