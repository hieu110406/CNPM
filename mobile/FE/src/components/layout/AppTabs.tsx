import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '@/components/ui/AppIcon';

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  return <Tabs style={styles.root}>
    <TabSlot style={{ flex: 1 }} />
    <TabList style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <TabTrigger name="home" href="/" asChild><Button icon="home" label="Trang chủ" /></TabTrigger>
      <TabTrigger name="explore" href="/explore" asChild><Button icon="explore" label="Khám phá" /></TabTrigger>
      <TabTrigger name="map" href="/map" asChild><Button icon="map" label="Bản đồ" /></TabTrigger>
    </TabList>
  </Tabs>;
}
function Button({ icon, label, isFocused, ...props }: TabTriggerSlotProps & { icon: 'home' | 'explore' | 'map'; label: string }) {
  return <Pressable {...props} accessibilityRole="tab" accessibilityState={{ selected: isFocused }}
    style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}>
    <View style={[styles.icon, isFocused && styles.active]}><AppIcon name={icon} color={isFocused ? '#285A46' : '#7B837C'} /></View>
    <Text style={[styles.label, isFocused && { color: '#1E5A4E', fontWeight: '600' }]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  bar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E8EBE8', paddingTop: 6 },
  button: { flex: 1, alignItems: 'center', gap: 4, minHeight: 52 },
  icon: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 2 }, active: { backgroundColor: '#F0F4F0' },
  symbol: { fontSize: 21, color: '#285A46' }, label: { color: '#737B75', fontSize: 11 },
});
