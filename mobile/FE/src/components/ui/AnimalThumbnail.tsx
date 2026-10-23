import { useState } from 'react';
import { Image, Text, View } from 'react-native';

// Reuse the illustrative photos already selected for the web application.
const photos: Record<string, string> = {
  giraffe: 'photo-1547721064-da6cfb341d50',
  birds: 'photo-1518709268805-4e9042af9f23',
  monkeys: 'photo-1540573133985-87b6da6d54a9',
  tiger: 'photo-1561731216-c3a4d99437d5',
};
export default function AnimalThumbnail({ id, emoji, imageUrl, width = 64, height = 72, radius = 10 }: {
  id: string; emoji: string; imageUrl?: string | null; width?: number; height?: number; radius?: number;
}) {
  // Explicit null means the database has no image; don't substitute a stock photo.
  const uri = imageUrl === undefined
    ? (photos[id] ? `https://images.unsplash.com/${photos[id]}?auto=format&fit=crop&w=400&q=75` : null)
    : imageUrl;
  const [failedUri, setFailedUri] = useState<string | null>(null);
  return <View style={{ width, height, flexShrink: 0, borderRadius: radius, overflow: 'hidden', backgroundColor: '#E3EDE1', alignItems: 'center', justifyContent: 'center' }}>
    {uri && failedUri !== uri ? <Image source={{ uri }}
      resizeMode="contain" style={{ width, height }} onError={() => setFailedUri(uri)} /> : <Text style={{ fontSize: 26 }}>{emoji}</Text>}
  </View>;
}
