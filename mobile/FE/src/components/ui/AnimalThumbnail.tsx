import { useState } from 'react';
import { Image, Text, View } from 'react-native';

// Reuse the illustrative photos already selected for the web application.
const photos: Record<string, string> = {
  giraffe: 'photo-1547721064-da6cfb341d50',
  birds: 'photo-1518709268805-4e9042af9f23',
  monkeys: 'photo-1540573133985-87b6da6d54a9',
  tiger: 'photo-1561731216-c3a4d99437d5',
};
export default function AnimalThumbnail({ id, emoji, width = 64, height = 72 }: {
  id: string; emoji: string; width?: number; height?: number;
}) {
  const [failed, setFailed] = useState(false);
  return <View style={{ width, height, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F2F4F0', alignItems: 'center', justifyContent: 'center' }}>
    {!failed && photos[id] ? <Image source={{ uri: `https://images.unsplash.com/${photos[id]}?auto=format&fit=crop&w=400&q=75` }}
      resizeMode="cover" style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} /> : <Text style={{ fontSize: 26 }}>{emoji}</Text>}
  </View>;
}
