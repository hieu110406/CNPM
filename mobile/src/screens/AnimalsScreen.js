// src/screens/AnimalsScreen.js
// Danh sách động vật & địa điểm — Có filter, search, thẻ card chi tiết

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../styles/theme";
import { MARKERS, FILTER_CATEGORIES } from "../data/mapData";
import FilterChips from "../components/FilterChips";
import SearchBar from "../components/SearchBar";
import AnimalCard from "../components/AnimalCard";

export default function AnimalsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMarkers = useMemo(() => {
    let list = MARKERS;
    if (typeFilter !== "all") {
      list = list.filter((m) => m.type === typeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.zone && m.zone.toLowerCase().includes(q))
      );
    }
    return list;
  }, [typeFilter, searchQuery]);

  function handleMarkerPress(marker) {
    navigation.navigate("Detail", { marker });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgScreen} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="paw" size={22} color={COLORS.emerald600} />
          <Text style={styles.headerTitle}>Danh Sách</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {filteredMarkers.length} địa điểm
          </Text>
        </View>
      </View>

      {/* Tìm kiếm */}
      <View style={styles.searchArea}>
        <SearchBar markers={MARKERS} onSelectMarker={handleMarkerPress} />
      </View>

      {/* Filter */}
      <FilterChips
        categories={FILTER_CATEGORIES}
        activeKey={typeFilter}
        onSelect={setTypeFilter}
      />

      {/* Danh sách */}
      <FlatList
        data={filteredMarkers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AnimalCard marker={item} onPress={handleMarkerPress} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>
              Không tìm thấy địa điểm phù hợp
            </Text>
          </View>
        }
      />
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
  list: {
    paddingHorizontal: SIZES.base,
    paddingBottom: 100,
  },
  empty: {
    alignItems: "center",
    paddingVertical: SIZES.xxxl,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: SIZES.md,
  },
  emptyText: {
    fontSize: SIZES.subtitle,
    color: COLORS.slate500,
    fontWeight: "500",
  },
});
