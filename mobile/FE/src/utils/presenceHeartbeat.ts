type PresenceOptions = {
  ping: () => Promise<unknown>;
  remove: () => Promise<unknown>;
  active: boolean;
  intervalMs?: number;
  schedule?: (tick: () => void, ms: number) => () => void;
  onError?: (error: unknown) => void;
};

/** Hidden pages pause updates; only actual page exits remove the session. */
export function createPresenceHeartbeat(options: PresenceOptions) {
  let active = options.active;
  let disposed = false;
  let pingQueued = false;
  let queue: Promise<unknown> = Promise.resolve();
  let cancelTimer: (() => void) | undefined;
  const schedule = options.schedule ?? ((tick, ms) => {
    const timer = setInterval(tick, ms);
    return () => clearInterval(timer);
  });
  const report = (error: unknown) => options.onError?.(error);
  function ping() {
    if (disposed || !active || pingQueued) return;
    pingQueued = true;
    queue = queue.catch(() => {}).then(async () => {
      if (!disposed && active) await options.ping();
    }).catch(report).finally(() => { pingQueued = false; });
  }
  function stopTimer() { cancelTimer?.(); cancelTimer = undefined; }
  function startTimer() {
    stopTimer();
    ping();
    cancelTimer = schedule(ping, options.intervalMs ?? 30000);
  }
  function setActive(next: boolean) {
    if (disposed || active === next) return;
    active = next;
    if (active) startTimer();
    else stopTimer();
  }
  function close() {
    setActive(false);
    queue = queue.catch(() => {}).then(options.remove).catch(report).finally(() => {
      if (!disposed && active) ping();
    });
  }
  function dispose() {
    close();
    disposed = true;
    stopTimer();
  }
  if (active) startTimer();
  return { ping, setActive, close, dispose, idle: () => queue };
}

export function presenceDevice(platform: string, userAgent = ''): 'mobile' | 'web' {
  return platform !== 'web' || /Android|iPhone|iPad|iPod/i.test(userAgent) ? 'mobile' : 'web';
}
