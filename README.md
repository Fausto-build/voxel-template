# Rabbit 3D Adventure Template

A lightweight 3D adventure game template designed for AI-powered remixing.

## Run Locally

```bash
npm install
npm run dev
```

## What This Is

This is a config-driven 3D game template for Rabbit.

Most of the game world is controlled from JSON files so AI agents can safely modify the game without changing core engine code.

## Main Files To Edit

- `src/game/config/worlds/fantasy-island.json`
- `src/game/config/missions.config.json`
- `src/game/config/vehicles.config.json`
- `src/game/config/npcs.config.json`
- `src/game/config/objects.config.json`
- `src/game/config/theme.config.json`

## Example Changes

- Add a tree
- Add a car
- Change the island theme
- Create a new mission
- Add a new NPC
- Add more gems
- Turn the island into a snow world

## Controls

- WASD / Arrow Keys: move
- Mouse: rotate camera
- Space: jump
- Shift: run
- E: interact / drive / exit vehicle
- Esc: pause

## Architecture

The template keeps gameplay data and engine code separate:

- `src/game/config` stores AI-editable JSON files.
- `src/game/types` defines the TypeScript contracts for those files.
- `src/game/core` owns player movement, input, camera, physics, and state.
- `src/game/systems` turns config into gameplay systems.
- `src/game/components` contains low-poly generated scene primitives.
- `src/game/utils` contains validation, loading, IDs, and math helpers.

## First World

`src/game/config/worlds/fantasy-island.json` loads a small fantasy island with:

- Island terrain and water
- Trees, rocks, a bridge, a castle, a sign, and a chest
- Five collectible gems
- Wizard Milo
- A collect-and-return mission
- A simple red drivable car

## Replit

The project includes a `.replit` file. In Replit, install dependencies and run the project with:

```bash
npm install
npm run dev
```
