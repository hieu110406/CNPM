// src/components/SearchBar.js
// Thanh tìm kiếm địa điểm trong Thảo Cầm Viên — Mobile UI

import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../styles/theme";
import { TYPE_META } from "../data/mapData";

export default function SearchBar({ markers = [], onSelectMarker }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const results = query.trim()
    ? markers
        .filter(
          (m) =>
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            (m.zone && m.zone.toLowerCase().includes(query.toLowerCase())) ||
            (m.desc && m.desc.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  function handleFocus() {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  }

  function handleBlur() {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  function handleSelect(marker) {
    setQuery("");
    setIsFocused(false);
    onSelectMarker?.(marker);
  }

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={isFocused ? COLORS.emerald600 : COLORS.slate400}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Tìm kiếm địa điểm, động vật..."
          placeholderTextColor={COLORS.slate400}
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={COLORS.slate400} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Kết quả tìm kiếm */}
      {isFocused && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const meta = TYPE_META[item.type];
              return (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.resultEmoji,
                      { backgroundColor: meta?.bgLight || COLORS.slate100 },
                    ]}
                  >
                    <Text style={styles.resultEmojiText}>{item.emoji}</Text>
                  </View>
                  <View style={styles.resultText}>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.resultZone} numberOfLines={1}>
                      {item.zone}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.slate300}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {isFocused && query.trim() && results.length === 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.emptyResult}>
            <Text style={styles.emptyText}>
              Không tìm thấy "{query}" trong Thảo Cầm Viên
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 100,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    height: 46,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    ...SHADOWS.sm,
  },
  containerFocused: {
    borderColor: COLORS.emerald400,
    ...SHADOWS.md,
  },
  icon: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.slate900,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  resultsContainer: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    maxHeight: 280,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  resultEmoji: {
    width: 38,
    height: 38,
    borderRadius: SIZES.radiusSm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.md,
  },
  resultEmojiText: {
    fontSize: 18,
  },
  resultText: {
    flex: 1,
    marginRight: SIZES.sm,
  },
  resultName: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.slate900,
  },
  resultZone: {
    fontSize: SIZES.small,
    color: COLORS.slate500,
    marginTop: 2,
  },
  emptyResult: {
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.base,
    alignItems: "center",
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.slate500,
    textAlign: "center",
  },
});
