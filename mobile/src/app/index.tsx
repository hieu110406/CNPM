import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const zones = ['Tất cả', 'Thú lớn', 'Chim', 'Linh trưởng'];

const highlights = [
  { emoji: '🦒', title: 'Vườn hươu cao cổ', subtitle: '12 cá thể · Khu A', color: '#DDF5E8' },
  { emoji: '🦜', title: 'Nhà chim nhiệt đới', subtitle: '18 loài · Khu C', color: '#FFF0D6' },
  { emoji: '🐒', title: 'Đảo linh trưởng', subtitle: '8 cá thể · Khu B', color: '#E8E4FF' },
];

const feedingTimes = [
  { time: '09:30', animal: 'Hà mã', place: 'Hồ nước ngọt', emoji: '🦛' },
  { time: '10:15', animal: 'Hổ Bengal', place: 'Khu thú lớn', emoji: '🐅' },
];

export default function HomeScreen() {
  const [selectedZone, setSelectedZone] = useState('Tất cả');

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>Thứ Bảy, 12 tháng 10</Text>
              <Text style={styles.greeting}>Chào buổi sáng, Hiếu</Text>
            </View>
            <Pressable style={styles.avatar} accessibilityLabel="Hồ sơ">
              <Text style={styles.avatarText}>A</Text>
            </Pressable>
          </View>

          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Một ngày xanh đang chờ bạn.</Text>
              <Text style={styles.heroDescription}>
                Khám phá những cư dân đặc biệt và đừng bỏ lỡ giờ cho ăn.
              </Text>
              <Pressable style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Bắt đầu khám phá</Text>
              </Pressable>
            </View>
            <Text style={styles.heroAnimal}>🦁</Text>
          </View>

          {/* Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>☀️</Text>
              <View>
                <Text style={styles.infoLabel}>Thời tiết</Text>
                <Text style={styles.infoValue}>28° · Quang mây</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🕗</Text>
              <View>
                <Text style={styles.infoLabel}>Giờ mở cửa</Text>
                <Text style={styles.infoValue}>08:00 – 18:00</Text>
              </View>
            </View>
          </View>

          {/* Zones */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khám phá theo khu vực</Text>
            <Text style={styles.seeAll}>Xem bản đồ</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}>
            {zones.map((zone) => {
              const active = selectedZone === zone;
              return (
                <Pressable
                  key={zone}
                  onPress={() => setSelectedZone(zone)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{zone}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Highlights */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Điểm đến nổi bật</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationList}>
            {highlights.map((item) => (
              <Pressable
                key={item.title}
                style={[styles.destinationCard, { backgroundColor: item.color }]}>
                <Text style={styles.destinationEmoji}>{item.emoji}</Text>
                <Text style={styles.destinationTitle}>{item.title}</Text>
                <Text style={styles.destinationSubtitle}>{item.subtitle}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Feeding schedule */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch cho ăn hôm nay</Text>
            <Text style={styles.seeAll}>Xem lịch</Text>
          </View>
          <View style={styles.scheduleCard}>
            {feedingTimes.map((item, index) => (
              <View
                key={item.time}
                style={[styles.scheduleRow, index === 0 && styles.scheduleFirst]}>
                <Text style={styles.scheduleEmoji}>{item.emoji}</Text>
                <View style={styles.scheduleTime}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.upcoming}>{index === 0 ? 'Sắp diễn ra' : 'Tiếp theo'}</Text>
                </View>
                <View style={styles.scheduleDetail}>
                  <Text style={styles.animalText}>{item.animal}</Text>
                  <Text style={styles.placeText}>{item.place}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F6F8F4',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
  },
  date: { color: '#71918A', fontSize: 13, fontWeight: '600' },
  greeting: { color: '#183A35', fontSize: 25, fontWeight: '800', marginTop: 4 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#1D5149',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF8E9', fontSize: 17, fontWeight: '800' },

  heroCard: {
    minHeight: 200,
    borderRadius: 28,
    backgroundColor: '#1E5A4E',
    padding: 22,
    overflow: 'hidden',
  },
  heroCopy: { width: '67%' },
  heroTitle: { color: '#FFFDF5', fontSize: 26, lineHeight: 31, fontWeight: '800' },
  heroDescription: { color: '#D2E8D9', fontSize: 13, lineHeight: 19, marginTop: 9 },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4B76A',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    marginTop: 17,
  },
  heroButtonText: { color: '#4D321A', fontSize: 13, fontWeight: '800' },
  heroAnimal: { position: 'absolute', right: 10, bottom: 8, fontSize: 104 },

  infoRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFDF8',
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EAEDE5',
  },
  infoIcon: { fontSize: 20 },
  infoLabel: { color: '#91A39D', fontSize: 11, fontWeight: '600' },
  infoValue: { color: '#254A43', fontSize: 12, fontWeight: '700', marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 11,
  },
  sectionTitle: { color: '#1F413A', fontSize: 16, fontWeight: '800' },
  seeAll: { color: '#4B8A7D', fontSize: 12, fontWeight: '700' },

  chips: { gap: 8 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#E9EFEB',
  },
  chipActive: { backgroundColor: '#1E5A4E' },
  chipText: { color: '#6E847D', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },

  destinationList: { gap: 12 },
  destinationCard: { width: 160, minHeight: 140, borderRadius: 20, padding: 15 },
  destinationEmoji: { fontSize: 42, marginBottom: 12 },
  destinationTitle: { color: '#26463E', fontSize: 14, fontWeight: '800' },
  destinationSubtitle: { color: '#6C817A', fontSize: 11, marginTop: 4 },

  scheduleCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EAEDE5',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDF0EB',
    gap: 11,
  },
  scheduleFirst: { borderTopWidth: 0 },
  scheduleEmoji: {
    width: 38,
    height: 38,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 38,
    borderRadius: 12,
    backgroundColor: '#EDF6EB',
    fontSize: 21,
    overflow: 'hidden',
  },
  scheduleTime: { width: 72 },
  timeText: { color: '#26463E', fontSize: 14, fontWeight: '800' },
  upcoming: { color: '#D6853E', fontSize: 11, fontWeight: '700', marginTop: 2 },
  scheduleDetail: { flex: 1 },
  animalText: { color: '#27463F', fontSize: 13, fontWeight: '800' },
  placeText: { color: '#83938D', fontSize: 11, marginTop: 2 },
});