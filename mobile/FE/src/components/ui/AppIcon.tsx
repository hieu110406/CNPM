import { SymbolView, type SymbolViewProps } from 'expo-symbols';

const names = {
  home: { ios: 'house', android: 'home', web: 'home' },
  explore: { ios: 'safari', android: 'explore', web: 'explore' },
  map: { ios: 'map', android: 'map', web: 'map' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  leaf: { ios: 'leaf', android: 'eco', web: 'eco' },
  sun: { ios: 'sun.max', android: 'light_mode', web: 'light_mode' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
} satisfies Record<string, SymbolViewProps['name']>;

export default function AppIcon({ name, size = 22, color = '#285A46' }: {
  name: keyof typeof names; size?: number; color?: string;
}) {
  return <SymbolView name={names[name]} size={size} tintColor={color} />;
}
