import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Pressable from '@/components/ui/AnimatedPressable';
import { useI18n } from '@/context/I18nContext';
import { getPoiAudio, type PoiAudio } from '@/api/pois';
import { request } from '@/api/map';
import AppIcon from '@/components/ui/AppIcon';

export default function PoiAudioControl({ poiId }: { poiId: string }) {
  const { language, t } = useI18n();
  const [attempt, setAttempt] = useState(0);
  const key = `${poiId}:${language}:${attempt}`;
  const [result, setResult] = useState<{ key: string; track: PoiAudio | null; error: boolean } | null>(null);
  const loading = result?.key !== key;
  const track = loading ? null : result?.track;
  const error = !loading && result?.error;
  useEffect(() => {
    let active = true;
    getPoiAudio(poiId, language).then(result => {
      if (active) setResult({ key, track: result, error: false });
    }).catch(() => { if (active) setResult({ key, track: null, error: true }); });
    return () => { active = false; };
  }, [poiId, language, key]);
  if (loading) return <View style={styles.container}><View style={[styles.button, styles.buttonLoading]}><ActivityIndicator color="#205E48" /><Text style={[styles.buttonText, styles.loadingText]}>{t('poiAudioLoading')}</Text></View></View>;
  if (error) return <View style={styles.container}><Text style={styles.note}>{t('poiAudioError')}</Text>
    <Pressable accessibilityRole="button" style={styles.button} onPress={() => setAttempt(value => value + 1)}><AppIcon name="replay" color="#FFF" size={20} /><Text style={styles.buttonText}>{t('retry')}</Text></Pressable></View>;
  if (!track) return <View style={styles.container}><View style={[styles.button, styles.buttonUnavailable]} accessibilityRole="button" accessibilityState={{ disabled: true }}><AppIcon name="headphones" color="#87958B" size={20} /><Text style={[styles.buttonText, styles.unavailableText]}>{t('poiListen')}</Text></View><Text style={styles.note}>{t('poiAudioUnavailable')}</Text></View>;
  return <TrackPlayer key={`${poiId}:${track.fileUrl}:${language}:${attempt}`} track={track} poiId={poiId} />;
}

function TrackPlayer({ track, poiId }: { track: PoiAudio; poiId: string }) {
  const { language, t } = useI18n();
  const player = useAudioPlayer(track.fileUrl);
  const status = useAudioPlayerStatus(player);
  const [error, setError] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const logged = useRef(false);
  // Log only after playback actually starts. Pausing/resuming does not add listens.
  useEffect(() => {
    if (!status.playing || logged.current) return;
    logged.current = true;
    void request('/analytics/usage', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poiId, languageCode: track.language, triggerType: 'manual', completed: false }),
    }).catch(() => {});
  }, [status.playing, poiId, track.language]);
  useEffect(() => {
    if (!waiting || status.playing || status.didJustFinish) return;
    const timeout = setTimeout(() => { setError(true); setWaiting(false); player.pause(); }, 20000);
    return () => clearTimeout(timeout);
  }, [waiting, status.playing, status.didJustFinish, player]);
  async function toggle() {
    try {
      setError(false);
      if (status.playing) { player.pause(); setWaiting(false); return; }
      await setAudioModeAsync({ playsInSilentMode: true });
      if (status.didJustFinish) await player.seekTo(0);
      setWaiting(true);
      player.play();
    } catch { setError(true); setWaiting(false); }
  }
  const buffering = !error && (status.isBuffering || (waiting && !status.playing && !status.didJustFinish));
  return <View style={styles.container}>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: buffering, busy: buffering }} disabled={buffering} style={[styles.button, status.playing && styles.buttonPlaying]} onPress={toggle}>
      <View style={styles.iconCircle}>{buffering ? <ActivityIndicator color="#FFF" size="small" /> : <AppIcon name="headphones" color="#FFF" size={20} />}</View>
      <Text style={styles.buttonText}>{buffering ? t('poiAudioLoading') : status.playing ? t('poiPause') : status.didJustFinish ? t('poiReplay') : t('poiListen')}</Text>
      {!buffering && <AppIcon name={status.playing ? 'pause' : status.didJustFinish ? 'replay' : 'play'} size={20} color="#FFF" />}
    </Pressable>
    {status.duration > 0 && <View style={styles.timeline}>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(Math.min(1, Math.max(0, status.currentTime / status.duration)) * 100) }} style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, status.currentTime / status.duration * 100))}%` }]} />
      </View>
      <View style={styles.timeLabels}><Text style={styles.time}>{formatTime(status.currentTime)}</Text><Text style={styles.time}>{formatTime(status.duration)}</Text></View>
    </View>}
    {track.language !== language && <Text style={styles.note}>{t('poiAudioFallback')}</Text>}
    {error && <Text accessibilityRole="alert" style={styles.note}>{t('poiAudioError')}</Text>}
  </View>;
}
function formatTime(seconds: number) {
  const time = Math.max(0, Math.floor(seconds));
  return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
}
const styles = StyleSheet.create({
  container: { gap: 10 },
  button: { backgroundColor: '#205E48', borderRadius: 28, paddingHorizontal: 16, paddingVertical: 10, minHeight: 56, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12 },
  buttonPlaying: { backgroundColor: '#174D3A' },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  buttonLoading: { backgroundColor: '#E5EEE1' }, loadingText: { color: '#205E48' },
  buttonUnavailable: { backgroundColor: '#EBEEE6', borderWidth: 1, borderColor: '#DFE4DA' }, unavailableText: { color: '#87958B' },
  timeline: { gap: 6, paddingHorizontal: 6, paddingTop: 2 },
  progressTrack: { height: 4, backgroundColor: '#DFE5D9', borderRadius: 3, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: '#438567', borderRadius: 3 },
  timeLabels: { flexDirection: 'row', justifyContent: 'space-between' }, time: { color: '#7C887F', fontSize: 10, fontVariant: ['tabular-nums'] },
  note: { color: '#7C887F', fontSize: 12, lineHeight: 18 },
});
