import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { pingOnlineSession, removeOnlineSession } from '@/api/analytics';
import { useI18n } from '@/context/I18nContext';

const HEARTBEAT_MS = 30_000;

// One anonymous session per running app/tab, shared by all mobile screens.
// A new app launch gets a new ID; settings and route changes don't add users.
export default function PresenceTracker() {
  const { language } = useI18n();
  const [sessionId] = useState(() => `m_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}`);
  // Serialize ping/remove, so a slow ping can't recreate a removed session.
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let disposed = false;
    let active = AppState.currentState == null || AppState.currentState === 'active';
    const browser = Platform.OS === 'web' && typeof document !== 'undefined';
    if (browser) active = document.visibilityState !== 'hidden';
    let timer: ReturnType<typeof setInterval> | undefined;
    let pingQueued = false;

    function ping() {
      if (disposed || !active || pingQueued) return;
      pingQueued = true;
      queue.current = queue.current.catch(() => {}).then(async () => {
        if (!disposed && active) await pingOnlineSession(sessionId, language, Platform.OS === 'web' ? 'web' : 'mobile');
      }).catch(() => {
        // Network failures must not interrupt navigation; retry next heartbeat.
      }).finally(() => { pingQueued = false; });
    }
    function remove() {
      queue.current = queue.current.catch(() => {}).then(() => removeOnlineSession(sessionId)).catch(() => {
        // Forced exits/offline sessions are also covered by the backend's TTL.
      }).finally(() => {
        // Handle a quick background -> foreground transition while requests run.
        if (!disposed && active) ping();
      });
    }
    function stopTimer() { clearInterval(timer); timer = undefined; }
    function startTimer() {
      stopTimer();
      ping();
      timer = setInterval(ping, HEARTBEAT_MS);
    }
    function setActive(next: boolean) {
      if (next === active || disposed) return;
      active = next;
      if (active) startTimer();
      else { stopTimer(); remove(); }
    }

    if (active) startTimer();
    const subscription = AppState.addEventListener('change', state => {
      setActive(state === 'active' && (!browser || document.visibilityState !== 'hidden'));
    });
    const onVisibility = () => setActive(document.visibilityState !== 'hidden');
    const onPageHide = () => setActive(false);
    const onPageShow = () => setActive(document.visibilityState !== 'hidden');
    if (browser) {
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pagehide', onPageHide);
      window.addEventListener('pageshow', onPageShow);
      window.addEventListener('online', ping);
    }
    return () => {
      disposed = true;
      stopTimer();
      subscription.remove();
      if (browser) {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
        window.removeEventListener('pageshow', onPageShow);
        window.removeEventListener('online', ping);
      }
      remove();
    };
  }, [sessionId, language]);

  return null;
}
