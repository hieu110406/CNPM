import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen, Heading, ui } from '@/components/ui/MobileUI';
import { destinations } from '@/data/destinations';
import AnimalThumbnail from '@/components/ui/AnimalThumbnail';
import AppIcon from '@/components/ui/AppIcon';
import { useI18n, type TranslationKey } from '@/context/I18nContext';

const zones: { value: string; key: TranslationKey }[] = [
  { value: 'Tất cả', key: 'all' },
  { value: 'Thú lớn', key: 'largeAnimals' },
  { value: 'Chim', key: 'birds' },
  { value: 'Linh trưởng', key: 'primates' },
] ;
const destinationKeys: Record<string, { title: TranslationKey; subtitle: TranslationKey; description: TranslationKey }> = {
  giraffe: { title: 'giraffeTitle', subtitle: 'giraffeSubtitle', description: 'giraffeDescription' },
  birds_lake: { title: 'birds_lakeTitle', subtitle: 'birds_lakeSubtitle', description: 'birds_lakeDescription' },
  monkey_primate: { title: 'monkey_primateTitle', subtitle: 'monkey_primateSubtitle', description: 'monkey_primateDescription' },
  tiger: { title: 'tigerTitle', subtitle: 'tigerSubtitle', description: 'tigerDescription' },
};

export default function ExploreScreen() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('Tất cả');
  const [selected, setSelected] = useState<(typeof destinations)[number] | null>(null);
  const items = destinations.filter(item => (zone === 'Tất cả' || item.zone === zone) &&
    t(destinationKeys[item.id].title).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <Screen>
    <Heading title={t('explore')} subtitle={t('exploreSubtitle')} />
    <Text style={styles.preview}>{t('preview')}</Text>
    <TextInput accessibilityLabel={t('searchPlacesLabel')} placeholder={t('searchPlaces')} value={query} onChangeText={setQuery} style={styles.input} placeholderTextColor="#71867C" />
    <View style={styles.filters}>{zones.map(({ value, key }) =>
      <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: value === zone }} onPress={() => setZone(value)} style={[styles.chip, value === zone && styles.active]}>
        <Text style={{ color: value === zone ? '#FFF' : '#1E5A4E' }}>{t(key)}</Text>
      </Pressable>)}</View>
    {items.map(item => <Pressable accessibilityRole="button" key={item.id} onPress={() => setSelected(item)} style={styles.row}>
      <AnimalThumbnail id={item.id} emoji={item.emoji} />
      <View style={{ flex: 1, gap: 6 }}><Text style={styles.name}>{t(destinationKeys[item.id].title)}</Text><Text style={ui.subtitle}>{t(destinationKeys[item.id].subtitle)}</Text></View>
      <AppIcon name="chevron" size={18} color="#8A928B" />
    </Pressable>)}
    {!items.length && <Text style={ui.subtitle}>{t('noPlaces')}</Text>}
    <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
      <View style={styles.overlay}><View style={[ui.card, styles.dialog]}>
        {selected && <AnimalThumbnail id={selected.id} emoji={selected.emoji} width={112} height={88} />}<Text style={styles.name}>{selected && t(destinationKeys[selected.id].title)}</Text>
        <Text style={ui.subtitle}>{selected && t(destinationKeys[selected.id].description)}</Text>
        <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={ui.button}><Text style={ui.buttonText}>{t('continueExploring')}</Text></Pressable>
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
