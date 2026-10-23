import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Pressable from '@/components/ui/AnimatedPressable';
import AnimalThumbnail from '@/components/ui/AnimalThumbnail';
import { getMostListenedPois, type PopularPoi } from '@/api/analytics';
import { useI18n } from '@/context/I18nContext';
import { appearance as a } from '@/constants/appearance';

export default function MostListenedPois() {
  const { language, t } = useI18n();
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(148, (Math.min(width, 680) - 54) / 2);
  const [pois, setPois] = useState<PopularPoi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestVersion = useRef(0);
  const load = useCallback(() => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError(false);
    getMostListenedPois(language).then(result => {
      if (requestVersion.current === version) setPois(result);
    }).catch(() => {
      if (requestVersion.current === version) setError(true);
    }).finally(() => {
      if (requestVersion.current === version) setLoading(false);
    });
  }, [language]);
  useFocusEffect(useCallback(() => {
    load();
    return () => { requestVersion.current++; };
  }, [load]));

  return <View style={styles.section}>
    <View style={styles.header}>
      <Text style={styles.title}>{t('mostListened')}</Text>
      <Pressable accessibilityRole="button" onPress={() => router.navigate('/map')}><Text style={styles.link}>{t('seeMap')}</Text></Pressable>
    </View>
    {loading ? <ActivityIndicator color="#285A46" accessibilityLabel={t('popularLoading')} style={styles.status} /> : error ?
      <View style={styles.status}><Text style={styles.caption}>{t('popularError')}</Text>
        <Pressable accessibilityRole="button" onPress={load} style={styles.retry}><Text style={styles.link}>{t('popularRetry')}</Text></Pressable>
      </View> : !pois.length ? <Text style={[styles.caption, styles.status]}>{t('popularEmpty')}</Text> :
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {pois.map(poi => <Pressable key={poi.id} accessibilityRole="button"
          accessibilityLabel={poi.name}
          onPress={() => router.navigate({ pathname: '/map', params: { poiId: poi.id } })} style={[styles.card, { width: cardWidth }]}>
          <AnimalThumbnail id={poi.id} emoji={poi.emoji} imageUrl={poi.imageUrl} width={cardWidth - 2} height={cardWidth * 0.58} radius={0} />
          <View style={styles.cardBody}><Text style={styles.name}>{poi.name}</Text>
          {!!poi.zone && <Text style={styles.caption}>{poi.zone}</Text>}</View>
        </Pressable>)}
      </ScrollView>}
  </View>;
}

const styles = StyleSheet.create({
  section: { marginTop: 20, gap: 12 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, color: a.ink, fontSize: 23, fontWeight: '700', fontFamily: a.serif }, link: { color: a.forest, fontSize: 13, fontWeight: '600' },
  caption: { color: a.muted, fontSize: 12, lineHeight: 19 }, status: { paddingVertical: 16, gap: 8 }, retry: { paddingVertical: 10, alignSelf: 'flex-start' },
  list: { gap: 12 }, card: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: a.border, backgroundColor: '#FFF' },
  cardBody: { padding: 12, gap: 5 }, name: { color: a.ink, fontSize: 15, lineHeight: 21, fontWeight: '600' },
});
