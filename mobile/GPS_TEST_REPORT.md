# GPS test execution report

Executed: 2026-10-24T11:25:12.618Z

Automated function/API checks were executed. No UI interaction or real device GPS was verified.

| ID | Test | Result | Evidence |
|---|---|---|---|
| GPS-01 | Known GPS maps to expected image center (synthetic fixture) | PASS |  |
| SIMGPS-01 | Known map center produces expected synthetic latitude and longitude | PASS |  |
| SIMGPS-02 | Reject absent calibration and invalid map input | PASS |  |
| SIMGPS-03 | 401 synthetic GPS fixes use forward projection without changing the route | PASS |  |
| GPS-02 | Reject non-finite GPS coordinates | PASS |  |
| GPS-03 | Reject insufficient calibration points | PASS |  |
| GPS-04 | Reject collinear calibration points | PASS |  |
| GPS-05 | Reject point projected outside image | PASS |  |
| GPS-06 | Reject invalid calibration values | PASS |  |
| MAP-01 | Default simulation route exists and uses real graph edges | PASS | 11 connected segments |
| MAP-02 | Unknown route endpoint returns null | PASS |  |
| SIM-01 | Simulation begins and ends at the route endpoints | PASS |  |
| SIM-02 | 401 samples stay on the route polyline | PASS |  |
| SIM-03 | Movement uses distance rather than vertex count | PASS |  |
| SIM-04 | Empty and zero-length paths handled | PASS |  |
| HTTP-01 | Backend health | PASS |  |
| HTTP-02 | Mobile map HTML (not interactive UI) | PASS |  |
| HTTP-03 | Web frontend HTML | PASS |  |
| HTTP-04 | Public POI API | PASS | 5 POIs |
| CAL-01 | Configured anchor fit within provisional QA tolerance of 1 image percentage point | FAIL | Anchor residuals: 2.053, 1.822, 3.904, 0.029 percentage points. This is image error, not meters; tolerance is provisional. |
| UI-01 | Click GPS and permission flow | BLOCKED | BLOCKED: Edge not connected to automation |
| UI-02 | Visible map, zoom, pan and marker interaction | BLOCKED | BLOCKED: no controllable browser/device |
| UI-03 | Play, pause, reset, close simulation using UI | BLOCKED | BLOCKED: no controllable browser/device |
| GPS-07 | Live location updates while walking | FAIL | NOT IMPLEMENTED: locateMe uses getCurrentPositionAsync once; no location watch |
| GPS-08 | Device GPS accuracy on site | BLOCKED | BLOCKED: no phone/emulator or surveyed ground truth |

Calibration fit is not a field accuracy measurement. Fixing the data needs surveyed, matching image/GPS landmarks.
GPS-07 is based on code inspection, not a device execution.
