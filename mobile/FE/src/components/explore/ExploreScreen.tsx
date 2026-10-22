import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen, Heading, ui } from '@/components/ui/MobileUI';
import { destinations } from '@/data/destinations';
import AnimalThumbnail from '@/components/ui/AnimalThumbnail';
import AppIcon from '@/components/ui/AppIcon';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('Tất cả');
  const [selected, setSelected] = useState<(typeof destinations)[number] | null>(null);
  const items = destinations.filter(item => (zone === 'Tất cả' || item.zone === zone) &&
    item.title.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')));
  return <Screen>
    <Heading title="Khám phá" subtitle="Tìm hiểu các loài động vật và điểm tham quan." />
    <Text style={styles.preview}>Bản xem trước · Dữ liệu minh họa</Text>
    <TextInput accessibilityLabel="Tìm địa điểm" placeholder="Tìm động vật, địa điểm…" value={query} onChangeText={setQuery} style={styles.input} placeholderTextColor="#71867C" />
    <View style={styles.filters}>{['Tất cả', 'Thú lớn', 'Chim', 'Linh trưởng'].map(value =>
      <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: value === zone }} onPress={() => setZone(value)} style={[styles.chip, value === zone && styles.active]}>
        <Text style={{ color: value === zone ? '#FFF' : '#1E5A4E' }}>{value}</Text>
      </Pressable>)}</View>
    {items.map(item => <Pressable accessibilityRole="button" key={item.id} onPress={() => setSelected(item)} style={styles.row}>
      <AnimalThumbnail id={item.id} emoji={item.emoji} />
      <View style={{ flex: 1, gap: 6 }}><Text style={styles.name}>{item.title}</Text><Text style={ui.subtitle}>{item.subtitle}</Text></View>
      <AppIcon name="chevron" size={18} color="#8A928B" />
    </Pressable>)}
    {!items.length && <Text style={ui.subtitle}>Chưa tìm thấy địa điểm. Hãy thử từ khóa hoặc khu vực khác.</Text>}
    <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
      <View style={styles.overlay}><View style={[ui.card, styles.dialog]}>
        {selected && <AnimalThumbnail id={selected.id} emoji={selected.emoji} width={112} height={88} />}<Text style={styles.name}>{selected?.title}</Text>
        <Text style={ui.subtitle}>{selected?.description}</Text>
        <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={ui.button}><Text style={ui.buttonText}>Tiếp tục khám phá</Text></Pressable>
      </View></View>
    </Modal>
  </Screen>;
}
const styles = StyleSheet.create({
  preview: { color: '#8A928B', fontSize: 11 },
  input: { padding: 16, borderWidth: 1, borderColor: '#DCE5DA', backgroundColor: '#FFFFFF', borderRadius: 8, color: '#183A35' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { backgroundColor: '#E7EEE5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11 }, active: { backgroundColor: '#1E5A4E' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEF0EC' },
  emoji: { fontSize: 30 }, name: { color: '#183A35', fontSize: 15, fontWeight: '600' }, link: { color: '#43806B', fontSize: 12, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: '#102D29AA', alignItems: 'center', justifyContent: 'center', padding: 24 }, dialog: { width: '100%', maxWidth: 440, gap: 20 },
});
