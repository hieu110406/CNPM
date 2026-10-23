import { Platform } from 'react-native';

export const appearance = {
  background: '#FAF8F0',
  forest: '#205E48',
  ink: '#1B2B23',
  muted: '#667268',
  border: '#E5E0D3',
  pale: '#E3EDE1',
  serif: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
};
