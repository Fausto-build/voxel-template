# Three.js Improvement Implementation Plan

This plan translates the diagnostic of the current voxel-template into concrete, phased work. The architecture is a solid config-driven V1, but the game currently reads more like a sparse prototype than a polished island. Terrain, water, lighting, materials, and world density are all basic, and a few correctness bugs exist in missions and rendering.

The plan is organized in five phases, from correctness fixes to gameplay expansion. Each phase lists goals, concrete changes with file references, and acceptance criteria.

---

## Phase 1 — Fix Visual and Logical Correctness

Goal: fix real bugs that make the current demo feel broken before adding polish.

### 1.1 Mission markers follow live NPC position
- Problem: mission markers use static NPC config position, so a patrolling NPC can move while the return marker stays behind.
- Files:
  - [src/game/systems/MissionSystem.tsx:22](src/game/systems/MissionSystem.tsx#L22)
  - [src/game/components/NPC.tsx:124](src/game/components/NPC.tsx#L124)
- Change:
  - Read the NPC's live runtime position (from gameStore or an NPC registry), not the config spawn position, when computing the marker target.
  - If NPC runtime state is not yet centralized, expose a minimal `npcPositions` map in `gameStore` keyed by NPC id.
- Acceptance:
  - Marker visually tracks a patrolling NPC each frame.
  - No regressions for stationary NPCs.

### 1.2 Remove duplicated water surface
- Problem: terrain renders its own water geometry and [src/game/components/Water.tsx:22](src/game/components/Water.tsx#L22) renders another large transparent water surface, causing transparency sorting artifacts and flat visuals.
- Change:
  - Make `Water.tsx` the single source of truth for the water plane. Terrain should only render the land/shoreline, not a water disk.
  - Terrain exposes shoreline radius/bounds so `Water.tsx` can size itself.
  - Ensure one water mesh, `transparent`, `depthWrite: false`, rendered after opaque geometry.
- Acceptance:
  - No z-fighting or sort flicker around the shoreline.
  - Only one water mesh in the scene graph (verified by scene inspector).

### 1.3 Dynamic (or honest static) contact shadows
- Problem: [src/game/core/GameLoop.tsx:32](src/game/core/GameLoop.tsx#L32) uses `ContactShadows` with `frames={1}` at [src/game/core/GameLoop.tsx:38](src/game/core/GameLoop.tsx#L38), so shadows are effectively static and misalign with moving player / NPCs / vehicles.
- Change:
  - For moving entities: use `frames={Infinity}` (or a modest number) and constrain the shadow area to active entities.
  - For static props (trees, rocks, buildings): keep a cheaper static contact shadow bake or vertex-blob shadow under each.
  - Consider a shared soft shadow plane per dynamic entity instead of one giant contact shadow pass, if perf is a concern.
- Acceptance:
  - Shadows visibly track the player, vehicle, and NPCs at 60 fps on a mid laptop.
  - No visible shadow "ghosting" on movement.

### 1.4 Terrain respects `TerrainConfig` type, height, and size
- Problem: `TerrainConfig` supports `island`, `flat`, `city`, `sandbox`, but [src/game/components/Terrain.tsx:13](src/game/components/Terrain.tsx#L13) always renders the same circular island + water setup. This breaks remixability for [src/game/config/worlds/city-island.json:10](src/game/config/worlds/city-island.json#L10) and sandbox worlds.
- Change:
  - Branch by `terrain.type`:
    - `island`: current circular landmass, water from 1.2.
    - `flat`: rectangular plane, no water unless explicitly enabled.
    - `city`: flat plane with a grid-aware ground (darker asphalt palette, subtle tiling).
    - `sandbox`: minimal flat plane, no water.
  - Honor `terrain.size` (vec2 or number) for non-square worlds and `terrain.height`/`amplitude` for gentle vertex displacement.
  - Keep collision geometry in sync with the rendered terrain type.
- Acceptance:
  - All three worlds ([src/game/config/worlds/city-island.json](src/game/config/worlds/city-island.json), [src/game/config/worlds/fantasy-island.json](src/game/config/worlds/fantasy-island.json), [src/game/config/worlds/empty-sandbox.json](src/game/config/worlds/empty-sandbox.json)) render visibly different terrain.
  - Non-square `size` values render correctly.

---

## Phase 2 — Look and Feel Without Heavy Assets

Goal: make the island feel like a polished world using only config, shared materials, and composition. No new 3D assets.

### 2.1 Shared material and color palette
- Introduce `src/game/render/palette.ts` exporting themed material sets (grass, sand, rock, water, wood, metal, foliage, road).
- Replace per-mesh `new MeshStandardMaterial(...)` usages in:
  - [src/game/systems/ObjectRenderer.tsx:74](src/game/systems/ObjectRenderer.tsx#L74)
  - [src/game/components/Vehicle.tsx:181](src/game/components/Vehicle.tsx#L181)
  - [src/game/components/NPC.tsx](src/game/components/NPC.tsx)
  - [src/game/components/Player.tsx](src/game/components/Player.tsx)
- Materials are cached per theme, shared between meshes.
- Acceptance:
  - Scene has a small, consistent set of materials (verified via renderer stats).
  - Swapping `theme` in a world JSON visibly retints grass/sand/rock/water.

### 2.2 Renderer tone mapping and color tuning
- In [src/game/core/GameLoop.tsx](src/game/core/GameLoop.tsx), set:
  - `gl.toneMapping = ACESFilmicToneMapping`
  - `gl.outputColorSpace = SRGBColorSpace`
  - Modest `toneMappingExposure` per theme.
- Acceptance:
  - Images feel less washed out; highlights on water and vehicles hold up.

### 2.3 Per-theme sun, fog, and sky
- Drive `directionalLight`, `ambientLight`, fog color/density, and background/sky tint from `world.theme` (fantasy, city, sandbox).
- Add a simple gradient sky (vertex-colored sphere or `<Sky>`-style shader) for non-city themes.
- Acceptance:
  - Fantasy island feels warm, city-island feels cooler/grayer, sandbox feels neutral.

### 2.4 Richer terrain layers and paths
- Add a procedural detail layer to terrain:
  - Subtle vertex noise for hills (amplitude from config).
  - A second "beach ring" material blend near shoreline.
  - Optional baked dirt paths / roads driven by a `paths: [{ from, to, width }]` world config.
- Acceptance:
  - Island clearly has beach, grass, and at least one path or landmark axis.

### 2.5 Flora clusters and landmark composition around spawn
- Add a config-driven prop scatter: `props: [{ kind, count, area, jitter }]` expanded at world load.
- Hand-place 3–5 landmark objects near spawn to frame the camera (arch, signpost, big tree, collectible cluster).
- Acceptance:
  - First frame after loading any world shows a composed, readable scene.

---

## Phase 3 — Lightweight Three.js Polish

Goal: small, self-contained visual upgrades that noticeably lift perceived quality.

### 3.1 Animated water shader
- Replace flat water material in [src/game/components/Water.tsx](src/game/components/Water.tsx) with a custom `ShaderMaterial`:
  - Gerstner or simple sine-sum vertex displacement.
  - Fresnel-tinted color blend, animated specular highlights.
  - Uniforms: `uTime`, `uShallowColor`, `uDeepColor`, `uFresnelPower`.
- Drive `uTime` from `useFrame`.
- Acceptance:
  - Water visibly moves, shimmers, and blends shoreline vs deep color.

### 3.2 Optional toon / outline pass from `theme.style.outline`
- When `theme.style.outline` is truthy, apply an outline effect:
  - Cheapest: inverted-hull outline on key meshes (player, vehicle, NPCs, collectibles).
  - Fallback: post-processing outline pass if already using `@react-three/postprocessing`.
- Acceptance:
  - Enabling `outline` in a theme adds clean outlines without breaking transparency (water).

### 3.3 Collectible glow and pickup burst
- Collectibles: add emissive pulse (sinusoidal emissive intensity) and a soft billboard sprite halo.
- On pickup: spawn a short-lived particle burst (pooled `Points` or instanced quads) and fade it out over ~400ms.
- Acceptance:
  - Collectibles read as interactable from far away.
  - Pickup feels responsive.

### 3.4 Vehicle skid dust and NPC animation
- Vehicle: emit pooled dust particles behind wheels when `speed > threshold` and on sharp turns.
- NPC: add idle sway and walk bob procedurally (position/rotation sine on hips and arms) in [src/game/components/NPC.tsx](src/game/components/NPC.tsx).
- Acceptance:
  - Vehicle motion feels weighty, NPCs no longer look frozen.

### 3.5 Camera spring and soft collision
- In [src/game/core/CameraController.tsx](src/game/core/CameraController.tsx), replace hard-follow with a critically-damped spring on position and lookAt (use [src/game/utils/spring.ts](src/game/utils/spring.ts)).
- Add a short raycast from target to desired camera position; if blocked, pull camera in along the ray.
- Acceptance:
  - Camera feels cinematic, never clips into terrain or buildings.

---

## Phase 4 — Scale the Renderer

Goal: make the engine ready for denser worlds and a smaller production bundle.

### 4.1 Instanced renderers for repeated objects
- Problem: every object creates its own mesh/material, e.g. [src/game/systems/ObjectRenderer.tsx:74](src/game/systems/ObjectRenderer.tsx#L74) and [src/game/components/Vehicle.tsx:181](src/game/components/Vehicle.tsx#L181).
- Change:
  - Add `InstancedObjectRenderer` that groups objects by `(kind, material)` and renders with `InstancedMesh`.
  - Route common kinds (trees, rocks, fences, collectibles, lamps) through it.
  - Per-instance color via `instanceColor` where useful.
- Acceptance:
  - Draw-call count for a tree-heavy world drops by at least an order of magnitude.
  - Visual parity with pre-instanced version.

### 4.2 Centralize collision metadata with object definitions
- Move collision shape/size out of per-component code into [src/game/config/objects.config.json](src/game/config/objects.config.json).
- World loader constructs colliders from config; renderers never own collider logic.
- Acceptance:
  - Adding a new prop is a config-only change for both visuals and collision.

### 4.3 Reduce per-frame Zustand writes
- Problem: player, vehicle, and NPC write every frame at [src/game/core/PlayerController.tsx:127](src/game/core/PlayerController.tsx#L127), [src/game/components/Vehicle.tsx:126](src/game/components/Vehicle.tsx#L126), and [src/game/components/NPC.tsx:124](src/game/components/NPC.tsx#L124).
- Change:
  - Keep per-frame transforms in mutable refs (vectors/quaternions) shared via a small `EntityRegistry` module.
  - Write to Zustand only on meaningful state changes (zone entered, mission progress, vehicle mount/dismount).
  - Systems that need positions (MissionSystem, UI) read from the registry, not the store.
- Acceptance:
  - Chrome performance profile shows no React re-renders tied to frame ticks.
  - Mission markers and UI still update correctly.

### 4.4 Code-split Three and Rapier
- Problem: production build emits a 3.12 MB JS chunk.
- Change:
  - Lazy-load the game scene (`React.lazy` + `Suspense`) so the shell/menu loads fast.
  - Split Rapier and postprocessing into their own dynamic chunks.
  - Verify `vite.config` manualChunks if needed.
- Acceptance:
  - Initial JS under ~1 MB gzipped (target, not hard requirement).
  - No runtime regressions; the chunk warning from `npm run build` goes away.

---

## Phase 5 — Expand Gameplay

Goal: use the existing mission scaffolding to deliver richer gameplay.

### 5.1 Implement `reach_location` and `talk_to_npc` missions
- Problem: types declare these in [src/game/types/mission.types.ts:1](src/game/types/mission.types.ts#L1) but [src/game/core/gameStore.ts:60](src/game/core/gameStore.ts#L60) only handles `collect`.
- Change:
  - Extend `MissionSystem` with handlers per mission type.
  - `reach_location`: success when player enters a radius around a target point (config-driven).
  - `talk_to_npc`: success on interact with a specific NPC id; integrates with [src/game/systems/InteractionSystem.tsx](src/game/systems/InteractionSystem.tsx).
  - UI copy and marker style differ per mission type.
- Acceptance:
  - All three mission types are authorable from JSON and testable in-game.

### 5.2 Waypoints and checkpoints
- Add an optional `waypoints: [{ pos, radius }]` array to missions.
- Render animated rings at each waypoint and advance them as the player reaches each.
- Acceptance:
  - A multi-step "reach A then B then C" mission works end-to-end from config.

### 5.3 World registry via `import.meta.glob`
- Replace hard-coded world JSON imports in [src/game/systems/WorldLoader.tsx](src/game/systems/WorldLoader.tsx) with a registry:
  - `const worlds = import.meta.glob('../config/worlds/*.json', { eager: true })`.
  - Expose a `listWorlds()` helper and a `loadWorld(id)` path.
- Acceptance:
  - Dropping a new `worlds/*.json` file makes the world selectable without code changes.

### 5.4 Cleaner support for new world types
- Generalize theme handling so adding a new theme (e.g. `desert`, `snow`) is config + palette only.
- Document the minimum fields a world JSON must define.
- Acceptance:
  - A new theme can be added in under ~30 lines of code + a palette entry.

---

## Cross-Cutting Concerns

- Performance budgets per phase: target 60 fps on a 2021 MacBook Air M1 at 1440×900.
- Visual regression: capture a small set of reference screenshots per world after Phase 1 and re-check after each later phase.
- Typecheck and build must remain green: `npm run typecheck` and `npm run build`.
- No new documentation files are introduced by this plan beyond this file.

## Rollout Order and Risk

1. Phase 1 is required before anything else — it fixes user-visible bugs.
2. Phase 2 is low-risk and high-impact; ship incrementally.
3. Phase 3 is self-contained; each item can land independently.
4. Phase 4 is the riskiest (touches state and bundling); do it behind feature branches with perf snapshots before/after.
5. Phase 5 depends on Phase 4.3 (registry) and Phase 1.1 (live NPC positions) being in place.

## Verification Checklist (per phase)

- `npm run typecheck` passes.
- `npm run build` passes with no new warnings.
- Manual playthrough in all three worlds:
  - Player moves, camera follows cleanly.
  - Vehicle mount / drive / dismount works.
  - NPC interaction works.
  - Missions progress and complete.
  - No console errors, no Three.js warnings.
