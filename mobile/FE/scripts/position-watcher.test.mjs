import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPositionWatcher } from '../src/utils/positionWatcher.ts';

test('delivers successive fixes and suppresses callbacks after stop', async () => {
  let emit, removed = 0;
  const received = [];
  const watcher = createPositionWatcher(async callback => { emit = callback; return { remove: () => removed++ }; });
  await watcher.start(value => received.push(value), assert.fail);
  emit({ latitude: 10.7873 }); emit({ latitude: 10.7874 });
  assert.equal(received.length, 2);
  watcher.stop(); emit({ latitude: 10.7875 });
  assert.equal(received.length, 2); assert.equal(removed, 1);
});
test('subscription resolving after cancellation is removed immediately', async () => {
  let resolve, removed = 0;
  const watcher = createPositionWatcher(() => new Promise(done => { resolve = done; }));
  const pending = watcher.start(assert.fail, assert.fail);
  watcher.stop(); resolve({ remove: () => removed++ });
  await pending; assert.equal(removed, 1);
});
test('restart replaces old subscription and ignores its late fixes', async () => {
  const emitters = []; let removed = 0; const received = [];
  const watcher = createPositionWatcher(async callback => { emitters.push(callback); return { remove: () => removed++ }; });
  await watcher.start(value => received.push(value), assert.fail);
  await watcher.start(value => received.push(value), assert.fail);
  emitters[0]('old'); emitters[1]('new');
  assert.deepEqual(received, ['new']); assert.equal(removed, 1); watcher.stop();
});
test('subscription failure is reported', async () => {
  const errors = [];
  const watcher = createPositionWatcher(async () => { throw new Error('GPS unavailable'); });
  await watcher.start(assert.fail, error => errors.push(error));
  assert.deepEqual(errors, ['GPS unavailable']);
});
test('late errors from a stopped subscription are ignored', async () => {
  let fail;
  const watcher = createPositionWatcher(async (_callback, onError) => { fail = onError; return { remove() {} }; });
  await watcher.start(assert.fail, assert.fail); watcher.stop(); fail('late error');
});
