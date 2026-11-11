export type PositionSubscription = { remove: () => void };
export type PositionSubscribe<T> = (
  onPosition: (position: T) => void,
  onError: (reason: string) => void,
) => Promise<PositionSubscription>;

/** Cancel pending subscriptions and ignore late callbacks after stop/restart. */
export function createPositionWatcher<T>(subscribe: PositionSubscribe<T>) {
  let generation = 0;
  let subscription: PositionSubscription | null = null;
  function stop() {
    generation++;
    subscription?.remove();
    subscription = null;
  }
  async function start(onPosition: (position: T) => void, onError: (reason: string) => void) {
    stop();
    const current = generation;
    try {
      const next = await subscribe(
        position => { if (current === generation) onPosition(position); },
        reason => { if (current === generation) onError(reason); },
      );
      if (current !== generation) next.remove();
      else subscription = next;
    } catch (error) {
      if (current === generation) onError(error instanceof Error ? error.message : String(error));
    }
  }
  return { start, stop };
}
