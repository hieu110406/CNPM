// src/components/FilterChips.js
// Thanh lọc danh mục phân loại dạng chip ngang cuộn được — Mobile UI

import React, { useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { COLORS, SIZES, SHADOWS } from "../styles/theme";

export default function FilterChips({
  categories = [],
  activeKey = "all",
  onSelect,
}) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isActive = activeKey === cat.key;
          return (
            <FilterChip
              key={cat.key}
              label={cat.label}
              icon={cat.icon}
              isActive={isActive}
              onPress={() => onSelect?.(cat.key)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

function FilterChip({ label, icon, isActive, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
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
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={[styles.chip, isActive && styles.chipActive]}
      >
        <Text style={styles.chipIcon}>{icon}</Text>
        <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SIZES.md,
  },
  scrollContent: {
    paddingHorizontal: SIZES.base,
    gap: SIZES.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    gap: 6,
    ...SHADOWS.sm,
  },
  chipActive: {
    backgroundColor: COLORS.emerald50,
    borderColor: COLORS.emerald400,
    ...SHADOWS.md,
  },
  chipIcon: {
    fontSize: 15,
  },
  chipLabel: {
    fontSize: SIZES.small,
    fontWeight: "600",
    color: COLORS.slate600,
  },
  chipLabelActive: {
    color: COLORS.emerald700,
  },
});
