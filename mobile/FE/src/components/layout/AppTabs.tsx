import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pressable from '@/components/ui/AnimatedPressable';
import PageTransition from './PageTransition';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '@/components/ui/AppIcon';
import { useI18n } from '@/context/I18nContext';

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return <Tabs style={styles.root}>
    <PageTransition><TabSlot style={{ flex: 1 }} /></PageTransition>
    <TabList style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <TabTrigger name="home" href="/" asChild><Button icon="home" label={t('home')} /></TabTrigger>
      <TabTrigger name="explore" href="/explore" asChild><Button icon="explore" label={t('explore')} /></TabTrigger>
      <TabTrigger name="map" href="/map" asChild><Button icon="map" label={t('map')} /></TabTrigger>
    </TabList>
  </Tabs>;
}
function Button({ icon, label, isFocused, ...props }: Omit<TabTriggerSlotProps, 'ref'> & Pick<ComponentProps<typeof Pressable>, 'ref'> & { icon: 'home' | 'explore' | 'map'; label: string }) {
  return <Pressable {...props} accessibilityRole="tab" accessibilityState={{ selected: isFocused }}
    style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}>
    <View style={[styles.icon, isFocused && styles.active]}><AppIcon name={icon} color={isFocused ? '#285A46' : '#7B837C'} /></View>
    <Text style={[styles.label, isFocused && { color: '#1E5A4E', fontWeight: '600' }]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F0' },
  bar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E5E0D3', paddingTop: 8 },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 60, paddingVertical: 4 },
  icon: { borderRadius: 24, paddingHorizontal: 20, paddingVertical: 6 }, active: { backgroundColor: '#DCECDD' },
  symbol: { fontSize: 21, color: '#285A46' }, label: { color: '#626D63', fontSize: 12 },
});
