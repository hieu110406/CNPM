import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { pingOnlineSession, removeOnlineSession } from '@/api/analytics';
import { useI18n } from '@/context/I18nContext';
import { createPresenceHeartbeat, presenceDevice } from '@/utils/presenceHeartbeat';

export default function PresenceTracker() {
  const { language } = useI18n();
  const [sessionId] = useState(() => `m_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}`);
  // Keep language updates in the same tracker/session rather than deleting and recreating it.
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language, languageRef]);

  useEffect(() => {
    const browser = Platform.OS === 'web' && typeof document !== 'undefined';
    const device = presenceDevice(Platform.OS, browser ? navigator.userAgent : '');
    let warned = false;
    const heartbeat = createPresenceHeartbeat({
      active: browser ? document.visibilityState !== 'hidden' : AppState.currentState == null || AppState.currentState === 'active',
      ping: () => pingOnlineSession(sessionId, languageRef.current, device),
      remove: () => removeOnlineSession(sessionId),
      onError: error => {
        if (warned) return;
        warned = true;
        console.warn('[Presence] Could not update online session; retrying next heartbeat.', error instanceof Error ? error.message : 'NETWORK_ERROR');
      },
    });
    // Web visibility events are authoritative; RN web AppState can emit extra transitions.
    const subscription = !browser ? AppState.addEventListener('change', state => heartbeat.setActive(state === 'active')) : null;
    const onVisibility = () => heartbeat.setActive(document.visibilityState !== 'hidden');
    const onPageHide = () => heartbeat.close();
    const onPageShow = () => heartbeat.setActive(document.visibilityState !== 'hidden');
    if (browser) {
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pagehide', onPageHide);
      window.addEventListener('pageshow', onPageShow);
      window.addEventListener('online', heartbeat.ping);
    }
    return () => {
      subscription?.remove();
      if (browser) {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
        window.removeEventListener('pageshow', onPageShow);
        window.removeEventListener('online', heartbeat.ping);
      }
      heartbeat.dispose();
    };
  }, [sessionId, languageRef]);
  return null;
}
