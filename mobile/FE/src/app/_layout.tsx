import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppTabs from '@/components/layout/AppTabs';
import { I18nProvider } from '@/context/I18nContext';

export default function Layout() {
  return <I18nProvider><SafeAreaProvider><StatusBar style="dark" /><AppTabs /></SafeAreaProvider></I18nProvider>;
}
