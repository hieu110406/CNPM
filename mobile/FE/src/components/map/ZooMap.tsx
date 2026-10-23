import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapCanvas, { type MapCanvasHandle, type MapMarker } from './MapCanvas';
import { destinations, routePoints } from '@/data/destinations';
import { buildGraph, shortestPath, type MapGraphPath } from '../../../../../app/FE/src/components/map/mapGraph';

type RoutePointId = (typeof routePoints)[number]['id'];

const mapMarkers: MapMarker[] = [
  { id: 'gate_main', title: 'Cổng chính', emoji: '🏛️', x: 41.5, y: 91.5, color: '#E11D48' },
  ...destinations.map(item => ({
    id: item.id,
    title: item.title,
    emoji: item.emoji,
    x: item.x,
    y: item.y,
    color: '#059669',
  })),
];

export default function ZooMap() {
  const insets = useSafeAreaInsets();
  const map = useRef<MapCanvasHandle>(null);
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('Tất cả');
  const [selected, setSelected] = useState<(typeof destinations)[number] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [routeMode, setRouteMode] = useState(false);
  const [routeStartId, setRouteStartId] = useState<RoutePointId>('gate_main');
  const [routeEndId, setRouteEndId] = useState<RoutePointId | null>(null);
  const [routeResult, setRouteResult] = useState<MapGraphPath | null>(null);
  const [routeError, setRouteError] = useState('');

  useEffect(() => {
    buildGraph(routePoints);
  }, []);

  useFocusEffect(useCallback(() => {
    setExpanded(false);
  }, []));

  const items = destinations.filter(item => (zone === 'Tất cả' || item.zone === zone) &&
    item.title.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')));

  function startRouteMode() {
    setRouteMode(true);
    setRouteStartId('gate_main');
    setRouteEndId(null);
    setRouteResult(null);
    setRouteError('');
    setExpanded(true);
    map.current?.reset();
  }

  function leaveRouteMode() {
    setRouteMode(false);
    setRouteResult(null);
    setRouteError('');
  }

  function selectRoutePoint(kind: 'start' | 'end', id: RoutePointId) {
    if (kind === 'start') {
      setRouteStartId(id);
      if (id === routeEndId) setRouteEndId(null);
    } else {
      setRouteEndId(id);
      if (id === routeStartId) setRouteStartId('gate_main');
    }
    setRouteResult(null);
    setRouteError('');
  }

  function findRoute() {
    if (!routeStartId || !routeEndId) {
      setRouteError('Hãy chọn điểm xuất phát và điểm đến.');
      return;
    }
    if (routeStartId === routeEndId) {
      setRouteError('Điểm xuất phát và điểm đến phải khác nhau.');
      return;
    }
    const result = shortestPath(routeStartId, routeEndId);
    if (!result || result.path.length < 2) {
      setRouteResult(null);
      setRouteError('Không tìm thấy đường đi giữa hai địa điểm này.');
      return;
    }
    setRouteResult(result);
    setRouteError('');
  }

  function selectMapMarker(id: string) {
    if (routeMode) {
      setRouteEndId(id === routeStartId ? null : id);
      setRouteResult(null);
      setRouteError('');
      return;
    }
    setSelected(destinations.find(item => item.id === id) ?? null);
    setExpanded(true);
  }

  const pathNodes = routeResult?.path ?? [];

  return <View style={styles.screen}>
    <MapCanvas
      ref={map}
      pathNodes={pathNodes}
      routeStartId={routeMode ? routeStartId : null}
      routeEndId={routeMode ? routeEndId : null}
      markers={mapMarkers}
      selectedId={routeMode ? null : selected?.id ?? null}
      onSelectMarker={selectMapMarker}
    />

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
      <Pressable accessibilityRole="button" accessibilityState={{ selected: routeMode }}
        onPress={routeMode ? leaveRouteMode : startRouteMode}
        style={[styles.routeAction, routeMode && styles.routeActionActive]}>
        <Text style={[styles.routeActionIcon, routeMode && styles.routeActionTextActive]}>{routeMode ? '×' : '↗'}</Text>
        <Text style={[styles.routeActionText, routeMode && styles.routeActionTextActive]}>
          {routeMode ? 'Đóng tìm đường' : 'Tìm đường'}
        </Text>
      </Pressable>
    </View>

    <View style={[styles.tools, { top: insets.top + 194 }]}>
      <Control label="Phóng to bản đồ" symbol="+" onPress={() => map.current?.zoomBy(0.5)} />
      <Control label="Thu nhỏ bản đồ" symbol="−" onPress={() => map.current?.zoomBy(-0.5)} />
      <Control label="Hiện toàn bộ bản đồ" symbol="⌖" onPress={() => map.current?.reset()} />
    </View>

    <View style={[styles.sheet, expanded && { height: '45%' }]}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={expanded ? 'Thu gọn danh sách' : 'Mở rộng danh sách'} onPress={() => setExpanded(value => !value)} style={styles.sheetToggle}>
        <View style={styles.handleArea}>
          <View style={styles.handle} />
        </View>
        <View style={styles.sheetHeader}>
          <Text style={styles.title}>{routeMode ? 'Tìm đường' : selected ? selected.title : 'Khám phá khu vườn'}</Text>
          <Text style={styles.caption}>{expanded ? '⌄' : '⌃'}</Text>
        </View>
        <Text style={styles.caption}>{routeMode ? 'Chọn điểm đi và điểm đến trên bản đồ' : 'Bản đồ tham khảo · Dữ liệu mẫu'}</Text>
      </Pressable>
      {expanded && <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {routeMode ? <>
          <RoutePointSelector label="Điểm xuất phát" selectedId={routeStartId}
            onSelect={id => selectRoutePoint('start', id)} disabledId={routeEndId} />
          <RoutePointSelector label="Điểm đến" selectedId={routeEndId}
            onSelect={id => selectRoutePoint('end', id)} disabledId={routeStartId} />
          <Pressable accessibilityRole="button" onPress={findRoute} style={styles.findRoute}>
            <Text style={styles.findRouteText}>Tìm đường ngắn nhất</Text>
          </Pressable>
          {!!routeError && <Text accessibilityRole="alert" style={styles.routeError}>{routeError}</Text>}
          {routeResult && <Text accessibilityRole="summary" style={styles.routeSummary}>
            Đã tìm thấy đường đi · {routeResult.stepsCount} chặng
          </Text>}
        </> : selected ? <>
          <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={{ paddingVertical: 8 }}><Text style={styles.body}>‹ Quay lại danh sách</Text></Pressable>
          <View style={styles.detail}><Text style={styles.body}>{selected.subtitle}</Text><Text style={styles.body}>{selected.description}</Text></View>
        </> : <>
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

function RoutePointSelector({ label, selectedId, onSelect, disabledId }: {
  label: string;
  selectedId: RoutePointId | null;
  onSelect: (id: RoutePointId) => void;
  disabledId: RoutePointId | null;
}) {
  return <View style={styles.routeSelector}>
    <Text style={styles.routeLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeChoices}>
      {routePoints.map(point => {
        const selected = point.id === selectedId;
        const disabled = point.id === disabledId;
        return <Pressable key={point.id} accessibilityRole="button" accessibilityState={{ selected, disabled }}
          disabled={disabled} onPress={() => onSelect(point.id)}
          style={[styles.routeChoice, selected && styles.routeChoiceActive, disabled && styles.routeChoiceDisabled]}>
          <Text numberOfLines={1} style={[styles.routeChoiceText, selected && styles.routeChoiceTextActive]}>{point.title}</Text>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}

function Control({ label, symbol, onPress, disabled }: { label: string; symbol: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.control, (pressed || disabled) && { opacity: 0.45 }]}><Text style={styles.controlText}>{symbol}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8EDDF', overflow: 'hidden' },
  top: { position: 'absolute', left: 16, right: 16, gap: 12 },
  search: { flexDirection: 'row', alignItems: 'center', minHeight: 52, backgroundColor: '#FFF', borderRadius: 28, paddingHorizontal: 16, elevation: 3, shadowColor: '#15251A', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  searchIcon: { fontSize: 28, color: '#285A46', marginRight: 10 },
  input: { flex: 1, minWidth: 0, color: '#202823', fontSize: 14, paddingVertical: 12 },
  clear: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: 8, paddingBottom: 4 },
  chip: { backgroundColor: '#FFF', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, elevation: 2 },
  chipActive: { backgroundColor: '#285A46' },
  chipText: { color: '#343D36', fontSize: 13 },
  chipTextActive: { color: '#FFF' },
  routeAction: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, backgroundColor: '#FFF', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, elevation: 2 },
  routeActionActive: { backgroundColor: '#285A46' },
  routeActionIcon: { color: '#285A46', fontSize: 18, fontWeight: '700' },
  routeActionText: { color: '#285A46', fontSize: 13, fontWeight: '600' },
  routeActionTextActive: { color: '#FFF' },
  tools: { position: 'absolute', right: 16, gap: 10 },
  control: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  controlText: { color: '#285A46', fontSize: 26 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 6, shadowColor: '#15251A', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -3 } },
  handleArea: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CDD2CD' },
  sheetToggle: { paddingHorizontal: 20, paddingBottom: 10, gap: 3 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 17, color: '#202823', fontWeight: '600' },
  caption: { fontSize: 11, color: '#788078' },
  place: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EFF1EE' },
  placeIcon: { width: 44, height: 44, backgroundColor: '#F4F6F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  placeTitle: { fontSize: 14, color: '#202823', fontWeight: '500' },
  arrow: { fontSize: 24, color: '#788078' },
  detail: { gap: 12, paddingTop: 8 },
  body: { fontSize: 13, lineHeight: 21, color: '#626D63' },
  routeSelector: { gap: 8 },
  routeLabel: { color: '#626D63', fontSize: 12, fontWeight: '600' },
  routeChoices: { gap: 8 },
  routeChoice: { maxWidth: 180, backgroundColor: '#F2F5F0', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 },
  routeChoiceActive: { backgroundColor: '#DDF5E8', borderWidth: 1, borderColor: '#285A46' },
  routeChoiceDisabled: { opacity: 0.35 },
  routeChoiceText: { color: '#343D36', fontSize: 12 },
  routeChoiceTextActive: { color: '#285A46', fontWeight: '600' },
  findRoute: { alignItems: 'center', justifyContent: 'center', minHeight: 44, backgroundColor: '#285A46', borderRadius: 22, marginTop: 2 },
  findRouteText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  routeError: { color: '#B42318', fontSize: 12 },
  routeSummary: { color: '#285A46', fontSize: 12, fontWeight: '600' },
});
