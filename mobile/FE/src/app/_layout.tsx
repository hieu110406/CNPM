import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppTabs from '@/components/layout/AppTabs';

export default function Layout() {
  return <SafeAreaProvider><StatusBar style="dark" /><AppTabs /></SafeAreaProvider>;
}
