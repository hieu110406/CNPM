import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPresenceHeartbeat, presenceDevice } from '../src/utils/presenceHeartbeat.ts';
function setup(extra = {}) {
 const calls = []; let tick = () => {}; let cancellations = 0;
 const tracker = createPresenceHeartbeat({active:true,ping:async()=>{calls.push('ping');},remove:async()=>{calls.push('remove');},
 schedule: callback => { tick = callback; return () => cancellations++; },...extra});
 return {tracker,calls,tick:()=>tick(),cancellations:()=>cancellations};
}
test('initial ping and periodic heartbeat', async()=>{
 const s=setup();await s.tracker.idle();s.tick();await s.tracker.idle();assert.deepEqual(s.calls,['ping','ping']);s.tracker.dispose();await s.tracker.idle();
});
test('switching to Neon/admin tab does not delete online session',async()=>{
 const s=setup();await s.tracker.idle();s.tracker.setActive(false);s.tick();await s.tracker.idle();assert.deepEqual(s.calls,['ping']);assert.equal(s.cancellations(),1);
 s.tracker.setActive(true);await s.tracker.idle();assert.deepEqual(s.calls,['ping','ping']);s.tracker.dispose();await s.tracker.idle();
});
test('page exit removes session after an in-flight ping',async()=>{
 let finish, started;const pendingStart=new Promise(resolve=>{started=resolve;});const calls=[];const s=setup({ping:()=>{calls.push('ping');started();return new Promise(resolve=>{finish=resolve;});},remove:async()=>{calls.push('remove');}});
 await pendingStart;s.tracker.close();assert.deepEqual(calls,['ping']);finish();await s.tracker.idle();assert.deepEqual(calls,['ping','remove']);
});
test('initially hidden page waits until visible',async()=>{
 const s=setup({active:false});await s.tracker.idle();assert.deepEqual(s.calls,[]);s.tracker.setActive(true);await s.tracker.idle();assert.deepEqual(s.calls,['ping']);s.tracker.dispose();await s.tracker.idle();
});
test('failed ping retries next heartbeat',async()=>{
 let attempts=0;const errors=[];const s=setup({ping:async()=>{if(++attempts===1)throw Error('offline');},onError:e=>errors.push(e.message)});
 await s.tracker.idle();s.tick();await s.tracker.idle();assert.equal(attempts,2);assert.deepEqual(errors,['offline']);s.tracker.dispose();await s.tracker.idle();
});
test('disposal stops all future heartbeats',async()=>{
 const s=setup();await s.tracker.idle();s.tracker.dispose();await s.tracker.idle();s.tracker.setActive(true);s.tick();await s.tracker.idle();assert.deepEqual(s.calls,['ping','remove']);
});
test('phone browser classified as mobile',()=>{
 assert.equal(presenceDevice('web','Mozilla iPhone Safari'),'mobile');assert.equal(presenceDevice('web','Mozilla Android Chrome'),'mobile');assert.equal(presenceDevice('ios'),'mobile');assert.equal(presenceDevice('web','Windows Edge'),'web');
});
