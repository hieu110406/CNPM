import { useState } from 'react';
import { Image, Modal, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pressable from '@/components/ui/AnimatedPressable';
import { slideIn } from '@/components/ui/motion';
import AppIcon from '@/components/ui/AppIcon';
import AnimalThumbnail from '@/components/ui/AnimalThumbnail';
import PoiAudioControl from '@/components/audio/PoiAudioControl';
import { useI18n } from '@/context/I18nContext';
import type { AnimalPoi } from '@/api/pois';

export default function AnimalDetailPopup({ poi, onClose }: { poi: AnimalPoi; onClose: () => void }) {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [imageIndex, setImageIndex] = useState(0);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const images = [...new Set([poi.imageUrl, ...(poi.imageUrls ?? [])].filter((url): url is string => !!url))];
  const imageUrl = images[imageIndex] ?? poi.imageUrl;
  const compact = width < 600;
  const imageHeight = Math.min(280, Math.max(160, height * 0.3));
  return <Modal visible transparent animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={onClose}>
    <View style={[styles.overlay, compact && styles.mobileOverlay]}>
      <Pressable motion={false} accessibilityRole="button" accessibilityLabel={t('close')} onPress={onClose} style={StyleSheet.absoluteFill} />
      <Animated.View entering={slideIn} accessibilityViewIsModal style={[
        styles.dialog,
        { maxHeight: compact ? height - insets.top - 16 : height * 0.9 },
        compact && styles.mobileDialog,
      ]}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.hero, { height: imageHeight }]}>
            {imageUrl && failedUrl !== imageUrl ? <Image source={{ uri: imageUrl }} resizeMode="contain"
              style={StyleSheet.absoluteFill} accessibilityLabel={poi.name} onError={() => setFailedUrl(imageUrl)} /> :
              <Text style={styles.placeholder}>{poi.emoji}</Text>}
            {!!poi.zone && <View style={styles.zoneBadge}><AppIcon name="map" size={13} color="#205C48" /><Text style={styles.zone}>{poi.zone}</Text></View>}
          </View>
          <View style={styles.content}>
            {images.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
              {images.map((url, index) => <Pressable key={url} accessibilityRole="button" accessibilityLabel={`${poi.name} · ${index + 1}/${images.length}`}
                accessibilityState={{ selected: imageIndex === index }} onPress={() => setImageIndex(index)}
                style={[styles.galleryItem, imageIndex === index && styles.gallerySelected]}>
                <AnimalThumbnail id={poi.id} emoji={poi.emoji} imageUrl={url} width={58} height={46} radius={7} />
              </Pressable>)}
            </ScrollView>}
            <Text accessibilityRole="header" style={styles.title}>{poi.name}</Text>
            <View style={styles.description}>
              <Text style={styles.label}>{t('poiShortDescription')}</Text>
              <Text style={styles.body}>{poi.shortDesc || t('poiDescriptionMissing')}</Text>
            </View>
            <View style={styles.description}>
              <Text style={styles.label}>{t('poiDetailDescription')}</Text>
              <Text style={styles.body}>{poi.detailDesc || t('poiDescriptionMissing')}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: compact ? Math.max(insets.bottom, 20) : 24 }]}>
          <PoiAudioControl poiId={poi.id} />
        </View>
        <View pointerEvents="none" style={styles.handleArea}><View style={styles.handle} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </Animated.View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  gallery: { gap: 8 }, galleryItem: { padding: 3, borderRadius: 11, borderWidth: 1, borderColor: '#E5E0D3' }, gallerySelected: { borderColor: '#205E48', backgroundColor: '#E3EDE1' },
  overlay: { flex: 1, backgroundColor: '#101A15A6', justifyContent: 'center', alignItems: 'center', padding: 24 },
  mobileOverlay: { justifyContent: 'flex-end', padding: 0 },
  dialog: { backgroundColor: '#FAF7EF', width: '100%', maxWidth: 440, borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: '#D9DED0' },
  mobileDialog: { maxWidth: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0 },
  scrollContent: { flexGrow: 1 },
  hero: { backgroundColor: '#4B6855', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  placeholder: { fontSize: 64, opacity: 0.85 },
  handleArea: { position: 'absolute', top: 9, left: 0, right: 0, alignItems: 'center' },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#FFFFFFB3' },
  close: { position: 'absolute', top: 18, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FAF7EFF2', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 25, lineHeight: 29, color: '#233B30', fontWeight: '400' },
  zoneBadge: { position: 'absolute', left: 22, bottom: 14, right: 22, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E6EFE3F2', borderRadius: 18, paddingHorizontal: 11, paddingVertical: 6 },
  zone: { color: '#205C48', fontSize: 11, lineHeight: 16, flexShrink: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, gap: 22 },
  title: { color: '#172B22', fontSize: 28, lineHeight: 35, fontWeight: '700', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }) },
  description: { gap: 8 },
  label: { color: '#21634E', fontSize: 11, lineHeight: 16, letterSpacing: 1, fontWeight: '600', textTransform: 'uppercase' },
  body: { color: '#46574D', fontSize: 14, lineHeight: 24 },
  footer: { backgroundColor: '#FAF7EF', paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E9E5D9' },
});
