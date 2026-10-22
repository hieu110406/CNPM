import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapCanvas, { type MapCanvasHandle } from './MapCanvas';
import { destinations } from '@/data/destinations';

export default function ZooMap() {
  const insets = useSafeAreaInsets();
  const map = useRef<MapCanvasHandle>(null);
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('Tất cả');
  const [selected, setSelected] = useState<(typeof destinations)[number] | null>(null);
  const [expanded, setExpanded] = useState(true);
  useFocusEffect(useCallback(() => {
    setExpanded(true);
  }, []));
  const items = destinations.filter(item => (zone === 'Tất cả' || item.zone === zone) &&
    item.title.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')));
  return <View style={styles.screen}>
    <MapCanvas ref={map} />

    <View pointerEvents="box-none" style={[styles.top, { top: insets.top + 12 }]}>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput style={styles.input} value={query} onChangeText={value => { setQuery(value); setSelected(null); setExpanded(true); }}
          placeholder="Tìm trong Thảo Cầm Viên" placeholderTextColor="#777E78" accessibilityLabel="Tìm địa điểm trên bản đồ" />
        {query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm" onPress={() => setQuery('')} style={styles.clear}><Text>×</Text></Pressable>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} keyboardShouldPersistTaps="handled">
        {['Tất cả', 'Thú lớn', 'Chim', 'Linh trưởng'].map(value => <Pressable key={value} accessibilityRole="button"
          accessibilityState={{ selected: zone === value }} onPress={() => { setZone(value); setSelected(null); setExpanded(true); }}
          style={[styles.chip, zone === value && styles.chipActive]}>
          <Text style={[styles.chipText, zone === value && styles.chipTextActive]}>{value}</Text>
        </Pressable>)}
      </ScrollView>
    </View>

    <View style={[styles.tools, { top: insets.top + 140 }]}>
      <Control label="Phóng to bản đồ" symbol="+" onPress={() => map.current?.zoomBy(0.5)} />
      <Control label="Thu nhỏ bản đồ" symbol="−" onPress={() => map.current?.zoomBy(-0.5)} />
      <Control label="Đặt lại góc nhìn" symbol="↺" onPress={() => map.current?.reset()} />
    </View>

    <View style={[styles.sheet, expanded && { height: '45%' }]}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={expanded ? 'Thu gọn danh sách' : 'Mở rộng danh sách'} onPress={() => setExpanded(value => !value)} style={styles.sheetToggle}>
        <View style={styles.handleArea}>
        <View style={styles.handle} />
        </View>
        <View style={styles.sheetHeader}>
          <Text style={styles.title}>{selected ? selected.title : 'Khám phá khu vườn'}</Text>
          <Text style={styles.caption}>{expanded ? '⌄' : '⌃'}</Text>
        </View>
        <Text style={styles.caption}>Bản đồ tham khảo · Dữ liệu mẫu</Text>
      </Pressable>
      {expanded && <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {selected && <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={{ paddingVertical: 8 }}><Text style={styles.body}>‹ Quay lại danh sách</Text></Pressable>}
        {selected ? <View style={styles.detail}><Text style={styles.body}>{selected.subtitle}</Text><Text style={styles.body}>{selected.description}</Text></View> : <>
          {items.map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => setSelected(item)} style={styles.place}>
            <View style={styles.placeIcon}><Text style={{ fontSize: 23 }}>{item.emoji}</Text></View>
            <View style={{ flex: 1, gap: 4 }}><Text style={styles.placeTitle}>{item.title}</Text><Text style={styles.caption}>{item.subtitle}</Text></View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>)}
          {!items.length && <Text style={styles.body}>Không có địa điểm phù hợp. Thử từ khóa hoặc khu vực khác.</Text>}
        </>}
      </ScrollView>}
    </View>
  </View>;
}
function Control({ label, symbol, onPress, disabled }: { label: string; symbol: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.control, (pressed || disabled) && { opacity: 0.45 }]}><Text style={styles.controlText}>{symbol}</Text></Pressable>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8EDDF', overflow: 'hidden' }, canvas: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  top: { position: 'absolute', left: 16, right: 16, gap: 12 },
  search: { flexDirection: 'row', alignItems: 'center', minHeight: 52, backgroundColor: '#FFF', borderRadius: 28, paddingHorizontal: 16, elevation: 3, shadowColor: '#15251A', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  searchIcon: { fontSize: 28, color: '#285A46', marginRight: 10 }, input: { flex: 1, minWidth: 0, color: '#202823', fontSize: 14, paddingVertical: 12 }, clear: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: 8, paddingBottom: 4 }, chip: { backgroundColor: '#FFF', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, elevation: 2 }, chipActive: { backgroundColor: '#285A46' }, chipText: { color: '#343D36', fontSize: 13 }, chipTextActive: { color: '#FFF' },
  tools: { position: 'absolute', right: 16, gap: 10 }, control: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 2 }, controlText: { color: '#285A46', fontSize: 26 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 6, shadowColor: '#15251A', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -3 } },
  handleArea: { alignItems: 'center', paddingVertical: 8 }, handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CDD2CD' },
  sheetToggle: { paddingHorizontal: 20, paddingBottom: 10, gap: 3 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 }, sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, title: { flex: 1, fontSize: 17, color: '#202823', fontWeight: '600' },
  caption: { fontSize: 11, color: '#788078' }, place: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EFF1EE' }, placeIcon: { width: 44, height: 44, backgroundColor: '#F4F6F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, placeTitle: { fontSize: 14, color: '#202823', fontWeight: '500' }, arrow: { fontSize: 24, color: '#788078' }, detail: { gap: 12, paddingTop: 8 }, body: { fontSize: 13, lineHeight: 21, color: '#626D63' },
});
