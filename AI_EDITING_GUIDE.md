# AI Editing Guide

This project is designed to be modified by AI agents.

## Codex Skill

This repo includes a project-local skill at `.agents/skills/rabbit-3d-adventure-template/SKILL.md`.

Use the skill as the short workflow entry point, then use this guide as the detailed reference.

## Main Rule

Edit config files first. Avoid changing core engine files unless necessary.

## Safe Files To Edit First

- `/src/game/config/worlds/*.json`
- `/src/game/config/objects.config.json`
- `/src/game/config/missions.config.json`
- `/src/game/config/npcs.config.json`
- `/src/game/config/vehicles.config.json`
- `/src/game/config/theme.config.json`

## Avoid Editing Unless Necessary

- `/src/game/core/PlayerController.tsx`
- `/src/game/core/CameraController.tsx`
- `/src/game/core/PhysicsWorld.tsx`
- `/src/game/systems/WorldLoader.tsx`
- `/src/game/systems/VehicleSystem.tsx`

## When Adding New World Objects

Prefer using existing object types:

- `tree`
- `rock`
- `castle`
- `house`
- `bridge`
- `fence`
- `sign`
- `chest`
- `tower`

If a new object type is needed, add it first to `objects.config.json`, then add a matching renderer in `src/game/components/ObjectRenderer.tsx`.

## When Adding Collectibles

Use the world file's `collectibles` array.

Keep IDs unique, use a simple type such as `gem`, and place collectibles with numeric `[x, y, z]` positions.

## When Adding NPCs

Use the world file's `npcs` array.

If an NPC starts or completes a mission, make sure its `missionId` exists in `missions.config.json`.

## When Adding Missions

Prefer these mission types:

- `collect`
- `reach_location`
- `talk_to_npc`

Keep missions short and easy for kids to understand.

For collect missions, make sure the requested collectible type exists in the active world.

## When Changing The World Theme

Prefer editing `theme.config.json` or the world config `theme` field.

Existing starter themes:

- `fantasy`
- `snow`
- `desert`

## When Adding Vehicles

Use `vehicles.config.json` and the world file's `vehicles` array.

Vehicles need:

- `id`
- `type`
- `position`
- `speed`
- `turnSpeed`
- `canDrive`

Optional handling fields include `acceleration`, `brakePower`, `reverseSpeed`, `steeringSmoothing`, `handbrakeDrift`, `wheelVisuals`, and `cameraMode`.

Do not replace the lightweight kinematic vehicle controller with advanced vehicle physics unless specifically requested.

## When Adding NPC Movement

NPCs can optionally use `behavior` values:

- `idle`
- `wander`
- `patrol`
- `followPlayer`

For `patrol`, add a matching path to the world file's `paths` array and set the NPC's `pathId`.

## AI World Editing API

`src/game/systems/AIWorldEditingAPI.ts` exposes runtime edit helpers:

- `addObject`
- `removeObject`
- `updateObject`
- `addCollectible`
- `removeCollectible`
- `addNPC`
- `updateNPC`
- `addVehicle`
- `updateVehicle`
- `addPath`
- `updatePath`
- `removePath`
- `createMission`
- `updateMission`
- `changeTheme`
- `switchWorld`

These helpers validate common mistakes such as duplicate IDs, unknown object types, broken mission references, and vehicles missing movement values.

## When Adding New Gameplay Mechanics

If the requested change cannot be done through config, create a new system in `/src/game/systems` and keep it modular.

Avoid mixing new mechanics into player, camera, or world loading code unless the mechanic directly belongs there.
