# FastAPI → js-ballistics Feature Mapping

_Repository branch: `feat/js-ballistics-client`_

This document captures the behaviour currently implemented by the FastAPI+`py-ballisticcalc` service and highlights the equivalent building blocks offered by `js-ballistics`. The goal is to ensure feature parity before swapping the frontend to a pure client-side pathway.

## 1. Current FastAPI behaviour

| Concern | FastAPI implementation | Notes |
| --- | --- | --- |
| Drag model selection | `DragModelEnum` (G1/G7) → `TableG1` / `TableG7` passed into `DragModel` | Defaults to G1 when unspecified. |
| Ammunition | `Ammo` initialised with BC, muzzle velocity, powder temperature from ambient temp. Optional `bullet_weight` stored via `ammo.bullet_weight` | Bullet diameter is defined on the request model but currently unused. |
| Weapon | Sight height and optional twist (inches) applied through `Weapon(...)` | Zero elevation populated later via `set_weapon_zero`. |
| Atmosphere | `Atmo` built with altitude (ft), temp (°F), pressure (inHg), humidity | Powder temperature assumed equal to ambient. |
| Wind | Optional single segment: MPH + o'clock direction → `Wind(...)` list | No support for variable wind profiles yet. |
| Zeroing | `calculator.set_weapon_zero(shot, zero_distance)` returning `Angular` → converted to Mil | No caching between requests. |
| Trajectory | `calculator.fire(...)` with `extra_data=True` | Response filtered to muzzle (0 yd) + multiples of `step_size`. |
| Energy | Use supplied energy when present, otherwise manual kinetic energy: `0.5 * mass(lb) * v^2 / 32.174` | Requires bullet weight. |
| Response units | Distances (yd), drop/windage (in), adjustments (mil), velocity (fps), energy (ft·lb) | Matches UI expectations. |
| Validation endpoints | `/drag-models`, `/validate` perform light checks only | `/validate` ensures `max_range > zero_distance` and reports estimated point count. |

## 2. js-ballistics equivalents

| FastAPI/py-ballisticcalc object | js-ballistics export | Remarks & usage tips |
| --- | --- | --- |
| `DragModelEnum.G1 / G7` | `Table.G1`, `Table.G7` from `drag_tables` | Additional tables (`G2`, `G5`, etc.) available if needed. |
| `DragModel(bc, table)` | `new DragModel({ bc, dragTable: Table.G1 })` | Weight/diameter can be supplied here if we need section density. |
| `Ammo(dm, Velocity.FPS(v), Temperature.Fahrenheit(temp))` | `new Ammo({ dm, mv: Velocity.FPS(v), powderTemp: Temperature.Fahrenheit(temp) })` | `js-ballistics` exposes `calcPowderSens` for temperature curves if we later add them. |
| `Weapon(sight_height=Distance.Inch(h), twist=Distance.Inch(t))` | `new Weapon({ sightHeight: Distance.Inch(h), twist: Distance.Inch(t) })` | Twist can be omitted (null). |
| `Atmo(...)` | `new Atmo({ altitude: Distance.Foot(a), temperature: Temperature.Fahrenheit(t), pressure: Pressure.InHg(p), humidity })` | Humidity is plain number (0–1). |
| `Wind(Velocity.MPH(s), Angular.OClock(dir))` | `new Wind({ velocity: Velocity.MPH(s), directionFrom: Angular.OClock(dir) })` | Accepts `untilDistance` if we ever add segmented wind. |
| `Shot(weapon, ammo, atmo, winds)` | `new Shot({ weapon, ammo, atmo, winds })` | Same semantics; winds array optional. |
| `calculator.set_weapon_zero(...)` | `calculator.setWeaponZero(...)` | Returns `Angular`; convert via `.In(Angular.MIL)` or `angular.to(Angular.MIL)`. |
| `calculator.fire(shot, trajectory_range, trajectory_step, extra_data=True)` | `calculator.fire({ shot, trajectoryRange, trajectoryStep, extraData: true })` | Returns `HitResult` with `.trajectory`. |
| Unit conversions (`Distance.Yard`, etc.) | Same class names in `unit` module | Methods `.In(Unit)` or `<<` style not available; use `.In(Unit)` or `.rawValue`. |
| Manual energy fallback | `calculateEnergy(weightGrain, velocityFps)` from `engines` | Accepts grains + FPS → ft·lb, matching current API. |
| Trajectory filtering | Manual loop on `result.trajectory` | Use `distance.In(Distance.Yard)` to produce yards, filter like today. |
| Drag models list | `Object.keys(Table)` | Returns more than G1/G7; filter if we only support specific ones. |
| Parameter validation | Custom logic (pure TS) | Mirror existing numeric bounds from `settings` or forms. |

## 3. Identified gaps / considerations

1. **Bullet weight storage** – `js-ballistics` expects projectile weight on the `DragModel` (optional). We can still hold the submitted weight separately for energy calculations (via `calculateEnergy`) without mutating the drag model.
2. **Bullet diameter** – Request model allows it but backend ignores it. `DragModel` supports `diameter` and `length`; we can pass it through if/when the UI collects it.
3. **Energy values** – `HitResult` does not include foot-pounds by default. We must continue to compute energy client-side using the exported helper when bullet weight is supplied, otherwise return `null`/`0` like today.
4. **Trajectory flags** – Python relied on `extra_data=True` to expose adjustments (`drop_adj`, `windage_adj`). In `js-ballistics`, those fields appear under the trajectory rows (`dropAdjustment`, `windageAdjustment`, etc.). Confirm naming during wrapper implementation.
5. **Validation logic** – Without FastAPI, the form needs a local equivalent of `/validate` (range > zero distance, bounds from config). We should encode these rules alongside the wrapper helpers.
6. **Multiple drag tables** – `js-ballistics` ships additional tables (G2, G5...). If we keep the UI limited to G1/G7, filter them when exposing `getAvailableDragModels()`.
7. **Zero caching** – Backend instantiates a fresh calculator per request. The new wrapper can memoize drag models or calculators for repeated shots, but ensure state resets between calculations (e.g., zeroElevation on Weapon).
8. **Threading / heavy compute** – Single-threaded browser code may stutter for large ranges. Defer Web Worker work until parity tests pass, per the migration plan.

## 4. Next steps

- Use this mapping while creating `frontend/lib/ballistics.ts` so that helpers mirror the current response structure.
- Port validation limits (`MAX_RANGE_YARDS`, `MAX_STEP_SIZE`, etc.) into a shared config so the frontend enforces the same rules post-migration.
- Prepare sample payloads (existing `/test_request.json`, etc.) for parity tests.

## 5. Outstanding work (2025-10-01)

- [ ] Implement the `js-ballistics` client wrapper (planned `frontend/lib/ballistics.ts`) that mirrors the FastAPI pipeline, including zeroing, trajectory filtering, and energy calculations.
- [ ] Centralise validation limits in a shared module so the frontend enforces the same bounds currently defined in `backend/app/core/config.py`.
- [ ] Capture parity fixtures from the FastAPI service and add tests that compare the new wrapper’s output against those baselines.
- [ ] Scaffold the PWA/offline support (service worker, manifest) referenced in this migration plan.
- [ ] Document the follow-up plan for moving heavy trajectory computation into a Web Worker.
