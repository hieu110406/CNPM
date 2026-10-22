import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { destinations } from '@/data/destinations';
import AppIcon from '@/components/ui/AppIcon';
import AnimalThumbnail from '@/components/ui/AnimalThumbnail';

const zones = ['Tất cả', 'Thú lớn', 'Chim', 'Linh trưởng'];

const highlights = destinations;

const feedingTimes = [
  { time: '09:30', animal: 'Hà mã', place: 'Hồ nước ngọt', emoji: '🦛' },
  { time: '10:15', animal: 'Hổ Bengal', place: 'Khu thú lớn', emoji: '🐅' },
];

export default function HomeScreen() {
  const [selectedZone, setSelectedZone] = useState('Tất cả');

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>THẢO CẦM VIÊN · SAIGON ZOO</Text>
              <Text style={styles.greeting}>Chào bạn!</Text>
            </View>
            <View style={styles.avatar}><AppIcon name="leaf" size={22} /></View>
          </View>

          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Hôm nay, khám phá gì?</Text>
              <Text style={styles.heroDescription}>
                Gặp gỡ những cư dân của khu vườn.
              </Text>
              <Pressable accessibilityRole="button" style={styles.heroButton} onPress={() => router.navigate('/explore')}>
                <Text style={styles.heroButtonText}>Bắt đầu khám phá</Text>
              </Pressable>
            </View>
            
          </View>

          <Text style={styles.preview}>Bản xem trước · Dữ liệu minh họa</Text>
          {/* Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <AppIcon name="sun" size={20} />
              <View>
                <Text style={styles.infoLabel}>Thời tiết</Text>
                <Text style={styles.infoValue}>28° · Quang mây</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <AppIcon name="clock" size={20} />
              <View>
                <Text style={styles.infoLabel}>Giờ mở cửa</Text>
                <Text style={styles.infoValue}>08:00 – 18:00</Text>
              </View>
            </View>
          </View>

          {/* Zones */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khám phá theo khu vực</Text>
            <Pressable accessibilityRole="button" onPress={() => router.navigate('/map')}><Text style={styles.seeAll}>Xem bản đồ →</Text></Pressable>
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
            {highlights.filter(item => selectedZone === 'Tất cả' || item.zone === selectedZone).map((item) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                onPress={() => router.navigate('/explore')}
                style={[styles.destinationCard, { backgroundColor: '#F4F5F3' }]}>
                <AnimalThumbnail id={item.id} emoji={item.emoji} width={148} height={96} />
                <Text style={styles.destinationTitle}>{item.title}</Text>
                <Text style={styles.destinationSubtitle}>{item.subtitle}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Feeding schedule */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch cho ăn tham khảo</Text>
          </View>
          <View style={styles.scheduleCard}>
            {feedingTimes.map((item, index) => (
              <View
                key={item.time}
                style={[styles.scheduleRow, index === 0 && styles.scheduleFirst]}>
                <Text style={styles.scheduleEmoji}>{item.emoji}</Text>
                <View style={styles.scheduleTime}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.upcoming}>Lịch mẫu</Text>
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
  preview: { color: '#8A928B', fontSize: 11, marginTop: 12 },
  screen: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
  },
  date: { color: '#7A867D', fontSize: 10, fontWeight: '500', letterSpacing: 0.6 },
  greeting: { color: '#183A35', fontSize: 20, fontWeight: '600', marginTop: 4, flexShrink: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#F1F5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF8E9', fontSize: 17, fontWeight: '600' },

  heroCard: {
    minHeight: 0,
    borderRadius: 10,
    backgroundColor: '#F3F5F2',
    padding: 18,
    overflow: 'hidden',
  },
  heroCopy: { width: '100%' },
  heroTitle: { color: '#202823', fontSize: 21, lineHeight: 28, fontWeight: '600' },
  heroDescription: { color: '#6D756F', fontSize: 13, lineHeight: 19, marginTop: 9 },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#285A46',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    marginTop: 17,
  },
  heroButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  heroAnimal: { position: 'absolute', right: 10, bottom: 8, fontSize: 104 },

  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  infoCard: {
    flex: 1,
    minWidth: 145,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EAEDE5',
  },
  infoIcon: { fontSize: 20 },
  infoLabel: { color: '#91A39D', fontSize: 11, fontWeight: '600' },
  infoValue: { color: '#254A43', fontSize: 12, fontWeight: '500', marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 11,
  },
  sectionTitle: { color: '#1F413A', fontSize: 16, fontWeight: '600' },
  seeAll: { color: '#4B8A7D', fontSize: 12, fontWeight: '500' },

  chips: { gap: 8 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#E9EFEB',
  },
  chipActive: { backgroundColor: '#1E5A4E' },
  chipText: { color: '#6E847D', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },

  destinationList: { gap: 12 },
  destinationCard: { width: 172, borderRadius: 12, padding: 12, gap: 8 },
  destinationEmoji: { fontSize: 30, marginBottom: 12 },
  destinationTitle: { color: '#26463E', fontSize: 14, fontWeight: '600' },
  destinationSubtitle: { color: '#6C817A', fontSize: 11, marginTop: 4 },

  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
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
  timeText: { color: '#26463E', fontSize: 14, fontWeight: '600' },
  upcoming: { color: '#D6853E', fontSize: 11, fontWeight: '500', marginTop: 2 },
  scheduleDetail: { flex: 1 },
  animalText: { color: '#27463F', fontSize: 13, fontWeight: '600' },
  placeText: { color: '#83938D', fontSize: 11, marginTop: 2 },
});
