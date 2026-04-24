---
name: rabbit-3d-adventure-template
description: Use when editing, extending, debugging, or remixing this Rabbit config-driven 3D adventure template built with Vite, React, TypeScript, React Three Fiber, Drei, Rapier, and Zustand. Prefer JSON/config changes before engine code.
---

# Rabbit 3D Adventure Template

This skill is for working in this repository's Rabbit 3D adventure template.

## First Step

Read `AI_EDITING_GUIDE.md` before making changes. Treat it as the detailed project contract for AI-safe edits.

## Core Rule

Prefer config-first changes. Try to satisfy world, object, mission, NPC, vehicle, collectible, and theme requests through JSON files before editing engine code.

## Safe Files To Check First

- `src/game/config/worlds/*.json`
- `src/game/config/objects.config.json`
- `src/game/config/missions.config.json`
- `src/game/config/npcs.config.json`
- `src/game/config/vehicles.config.json`
- `src/game/config/theme.config.json`

## Engine Files To Avoid First

Avoid changing these unless the request cannot be handled through config:

- `src/game/core/PlayerController.tsx`
- `src/game/core/CameraController.tsx`
- `src/game/core/PhysicsWorld.tsx`
- `src/game/systems/WorldLoader.tsx`
- `src/game/systems/VehicleSystem.tsx`

## Editing Workflow

1. Read the relevant config file and the matching type definition in `src/game/types`.
2. Make the smallest config change that satisfies the request.
3. If config is not enough, add or adjust a focused system in `src/game/systems`.
4. Only touch core player, camera, or physics code when the behavior directly requires it.
5. Keep generated geometry lightweight and avoid external runtime assets unless explicitly requested.

## Validation

Run these after code or config changes:

```bash
npm run typecheck
npm run build
```

For gameplay changes, also run:

```bash
npm run dev
```

Then manually check the relevant behavior in the browser preview when possible.
