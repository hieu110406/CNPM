import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/context/I18nContext';
import { appearance as a } from '@/constants/appearance';

export function Screen({ children }: PropsWithChildren) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={ui.screen}>
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={ui.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">{children}</ScrollView>
  </SafeAreaView>;
}
export function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  const { t } = useI18n();
  return <><Text style={ui.eyebrow}>{t('brand')}</Text><Text style={ui.title}>{title}</Text><Text style={ui.subtitle}>{subtitle}</Text></>;
}
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: a.background },
  content: { padding: 20, paddingBottom: 32, width: '100%', maxWidth: 680, alignSelf: 'center', gap: 16 },
  eyebrow: { color: a.muted, fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
  title: { color: a.ink, fontSize: 32, lineHeight: 40, fontWeight: '700', fontFamily: a.serif },
  subtitle: { color: a.muted, lineHeight: 23, fontSize: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, gap: 10, borderWidth: 1, borderColor: '#E8EBE8', minWidth: 0 },
  button: { backgroundColor: '#285A46', borderRadius: 8, padding: 14, alignItems: 'center', minHeight: 48 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
