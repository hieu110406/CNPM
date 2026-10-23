import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Pressable from '@/components/ui/AnimatedPressable';
import { Screen, Heading, ui } from '@/components/ui/MobileUI';
import AnimalThumbnail from '@/components/ui/AnimalThumbnail';
import AppIcon from '@/components/ui/AppIcon';
import AnimalDetailPopup from './AnimalDetailPopup';
import { getAnimalPois, type AnimalPoi } from '@/api/pois';
import { useI18n } from '@/context/I18nContext';
import { normalizeSearch } from '@/utils/search';
import { appearance as a } from '@/constants/appearance';

export default function ExploreScreen() {
  const { language, t } = useI18n();
  const [pois, setPois] = useState<AnimalPoi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const version = useRef(0);
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState<string | null>(null);
  const [selected, setSelected] = useState<AnimalPoi | null>(null);
  const load = useCallback(() => {
    const current = ++version.current;
    setLoading(true);
    setError(false);
    getAnimalPois(language).then(result => {
      if (current === version.current) { setPois(result); setZone(null); }
    }).catch(() => { if (current === version.current) setError(true); })
      .finally(() => { if (current === version.current) setLoading(false); });
  }, [language]);
  useFocusEffect(useCallback(() => {
    load();
    return () => { version.current++; setSelected(null); };
  }, [load]));
  const zones = [...new Set(pois.map(poi => poi.zone).filter(Boolean))];
  const items = pois.filter(item => (zone === null || item.zone === zone) &&
    normalizeSearch(`${item.name} ${item.zone}`).includes(normalizeSearch(query)));
  return <Screen>
    <Heading title={t('explore')} subtitle={t('exploreSubtitle')} />
    <View style={styles.search}>
      <AppIcon name="search" size={23} color={a.muted} />
      <TextInput accessibilityLabel={t('searchPlacesLabel')} placeholder={t('searchPlaces')} value={query} onChangeText={setQuery} style={styles.input} placeholderTextColor="#71867C" autoCorrect={false} returnKeyType="search" onSubmitEditing={() => Keyboard.dismiss()} />
      {!!query && <Pressable accessibilityRole="button" accessibilityLabel={t('clearSearch')} onPress={() => setQuery('')} style={styles.clear}><Text style={styles.name}>×</Text></Pressable>}
    </View>
    {!loading && !error && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{[null, ...zones].map(value =>
      <Pressable key={value ?? 'all'} accessibilityRole="button" accessibilityState={{ selected: value === zone }} onPress={() => setZone(value)} style={[styles.chip, value === zone && styles.active]}>
        <Text style={{ color: value === zone ? '#FFF' : '#1E5A4E', fontSize: 13 }}>{value ?? t('all')}</Text>
      </Pressable>)}</ScrollView>}
    {loading ? <ActivityIndicator color="#285A46" accessibilityLabel={t('poiLoading')} style={styles.empty} /> : error ? <View style={styles.empty}>
      <Text style={ui.subtitle}>{t('poiLoadError')}</Text><Pressable accessibilityRole="button" onPress={load} style={ui.button}><Text style={ui.buttonText}>{t('retry')}</Text></Pressable>
    </View> : <>
      {items.map(item => <Pressable accessibilityRole="button" key={item.id} onPress={() => { Keyboard.dismiss(); setSelected(item); }} style={styles.row}>
        <AnimalThumbnail id={item.id} emoji={item.emoji} imageUrl={item.imageUrl} width={64} height={64} radius={15} />
        <View style={{ flex: 1, gap: 6 }}><Text style={styles.name}>{item.name}</Text><Text style={styles.zone}>{item.zone}</Text></View>
        <AppIcon name="chevron" size={18} color="#8A928B" />
      </Pressable>)}
      {!items.length && <View style={styles.empty}><Text style={ui.subtitle}>{pois.length ? t('noPlaces') : t('poiEmpty')}</Text>
        {!!pois.length && <Pressable accessibilityRole="button" onPress={() => { setQuery(''); setZone(null); Keyboard.dismiss(); }} style={ui.button}><Text style={ui.buttonText}>{t('clearFilters')}</Text></Pressable>}
      </View>}
    </>}
    {selected && <AnimalDetailPopup key={`${selected.id}:${language}`} poi={selected} onClose={() => setSelected(null)} />}
  </Screen>;
}
const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: a.border, backgroundColor: '#FFF', borderRadius: 32, paddingLeft: 18, minHeight: 54 },
  input: { flex: 1, minWidth: 0, padding: 16, fontSize: 15, color: a.ink },
  clear: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, empty: { gap: 16, paddingVertical: 24 },
  filters: { gap: 8, paddingVertical: 2 }, chip: { backgroundColor: a.pale, borderRadius: 28, paddingHorizontal: 16, paddingVertical: 13 }, active: { backgroundColor: a.forest },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderWidth: 1, borderColor: a.border, backgroundColor: '#FFF', borderRadius: 24, minHeight: 100 },
  name: { color: a.ink, fontSize: 15, lineHeight: 22, fontWeight: '600' }, zone: { color: a.forest, fontSize: 12, lineHeight: 19 },
});
