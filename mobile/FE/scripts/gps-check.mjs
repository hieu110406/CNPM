import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { gpsToMapCoordinates } from '../src/utils/gpsMapCalibration.ts';
import { buildGraph, shortestPath, EDGES } from '../../../app/FE/src/components/map/mapGraph.js';

const results = [];
async function check(id, name, run) {
  try { const detail = await run(); results.push({ id, name, status: 'PASS', detail: detail || '' }); }
  catch (error) { results.push({ id, name, status: 'FAIL', detail: error.message }); }
}
const anchors = [
  { latitude: 10, longitude: 106, x: 0, y: 0 },
  { latitude: 10, longitude: 107, x: 100, y: 0 },
  { latitude: 11, longitude: 106, x: 0, y: 100 },
  { latitude: 11, longitude: 107, x: 100, y: 100 },
];
await check('GPS-01', 'Known GPS maps to expected image center (synthetic fixture)', () => {
  const point = gpsToMapCoordinates(10.5, 106.5, anchors);
  assert.ok(point && Math.abs(point.x - 50) < 1e-7 && Math.abs(point.y - 50) < 1e-7);
});
await check('GPS-02', 'Reject non-finite GPS coordinates', () => {
  for (const value of [NaN, Infinity, -Infinity]) assert.equal(gpsToMapCoordinates(value, 106, anchors), null);
});
await check('GPS-03', 'Reject insufficient calibration points', () => assert.equal(gpsToMapCoordinates(10.5, 106.5, anchors.slice(0, 2)), null));
await check('GPS-04', 'Reject collinear calibration points', () => assert.equal(gpsToMapCoordinates(10, 106, anchors.map((a, i) => ({ ...a, latitude: 10 + i, longitude: 106 + i }))), null));
await check('GPS-05', 'Reject point projected outside image', () => assert.equal(gpsToMapCoordinates(20, 110, anchors), null));
await check('GPS-06', 'Reject invalid calibration values', () => assert.equal(gpsToMapCoordinates(10, 106, anchors.map(a => ({ ...a, x: NaN }))), null));
buildGraph([]);
const route = shortestPath('w47', 'w16');
await check('MAP-01', 'Waypoint route exists and uses connected graph edges', () => {
  assert.ok(route && route.path.length > 2);
  for (let i = 1; i < route.path.length; i++) assert.ok(EDGES.some(([a,b]) => a === route.path[i-1].id && b === route.path[i].id || b === route.path[i-1].id && a === route.path[i].id));
  return `${route.stepsCount} connected segments`;
});
await check('MAP-02', 'Unknown route endpoint returns null', () => assert.equal(shortestPath('missing', 'w16'), null));
let pois = [];
for (const [id, name, url] of [
  ['HTTP-01','Backend health','http://localhost:5000/api/health'],
  ['HTTP-02','Mobile map HTML (not interactive UI)','http://localhost:8081/map'],
  ['HTTP-03','Web frontend HTML','http://127.0.0.1:5173'],
  ['HTTP-04','Public POI API','http://localhost:5000/api/pois/public?lang=vi'],
]) await check(id, name, async () => {
  const response = await fetch(url, {signal:AbortSignal.timeout(20000)});
  assert.equal(response.status,200);
  if (id === 'HTTP-04') { pois = await response.json(); assert.ok(Array.isArray(pois) && pois.length); return `${pois.length} POIs`; }
});
await check('CAL-01', 'Configured anchor fit within provisional QA tolerance of 1 image percentage point', () => {
  const zebra = pois.find(p => p.name.toLowerCase().includes('vằn') || p.name.toLowerCase().includes('zebra'));
  assert.ok(zebra, 'Missing zebra calibration POI');
  const liveAnchors = [
    {latitude:10.787343,longitude:106.705036,x:41.5,y:91.5},
    {latitude:10.78894312781009,longitude:106.70714945167893,x:57.3,y:40.1},
    {latitude:10.788099697238112,longitude:106.70601961019264,x:43.9,y:64.2},
    {latitude:10.78869726716698,longitude:106.70467729870951,x:Number(zebra.x),y:Number(zebra.y)},
  ];
  const errors = liveAnchors.map(a => { const p = gpsToMapCoordinates(a.latitude,a.longitude,liveAnchors); return p ? Math.hypot(p.x-a.x,p.y-a.y) : Infinity; });
  assert.ok(Math.max(...errors) <= 1, `Anchor residuals: ${errors.map(e=>e.toFixed(3)).join(', ')} percentage points. This is image error, not meters; tolerance is provisional.`);
});
for (const [id,name,detail] of [
 ['UI-01','Click GPS and permission flow','BLOCKED: Edge not connected to automation'],
 ['UI-02','Visible map, zoom, pan and marker interaction','BLOCKED: no controllable browser/device'],
 ['GPS-07','Live location updates while walking','BLOCKED: watchPositionAsync implemented; real-device/UI movement test still requires a connected device'],
 ['GPS-08','Device GPS accuracy on site','BLOCKED: no phone/emulator or surveyed ground truth'],
]) results.push({id,name,status:'BLOCKED',detail});
const report = ['# GPS test execution report','',`Executed: ${new Date().toISOString()}`,'','Automated function/API checks were executed. No UI interaction or real device GPS was verified.','', '| ID | Test | Result | Evidence |','|---|---|---|---|',...results.map(r=>`| ${r.id} | ${r.name} | ${r.status} | ${r.detail.replaceAll('|','/').replaceAll('\n',' ')} |`),'','Calibration fit is not a field accuracy measurement. Fixing the data needs surveyed, matching image/GPS landmarks.','GPS-07 requires a device execution; subscription lifecycle is tested separately in position-watcher.test.mjs.',''].join('\n');
await writeFile(new URL('../../GPS_TEST_REPORT.md',import.meta.url),report);
console.table(results);
console.log(JSON.stringify(results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{})));
process.exitCode = results.some(r=>r.status==='FAIL') ? 1 : 0;
