# Rabbit 3D Adventure Template — Spec

## 1. Overview

Build a lightweight, web-based 3D game template for **Rabbit**, designed to be easy for AI agents to modify, remix, and extend.

The game should feel like a simple, kid-friendly mix of:

- Roblox-style exploration
- Minecraft-style remixability
- GTA-lite third-person movement and vehicles

The first template should be a **low-poly cartoon fantasy island** where the player can explore, collect objects, complete missions, interact with NPCs, and drive simple vehicles.

The most important goal is not to build a complex game engine. The most important goal is to build a **clean, modular, AI-editable 3D game template**.

Rabbit should eventually be able to use this template to let kids create or remix games through natural language prompts like:

- “Add a red car next to the castle.”
- “Change the island into a snow world.”
- “Add 10 coins around the river.”
- “Create a mission where the player has to find 3 gems and bring them to the wizard.”
- “Replace the castle with a small city.”
- “Add a dragon NPC near the mountain.”
- “Turn this into a volcano island.”
- “Add a race track around the island.”

---

## 2. Product Goal

Create a reusable game template that Rabbit can use as a starting point for AI-generated games.

The template should allow future AI agents to safely modify:

- World layout
- Theme
- Objects
- NPCs
- Vehicles
- Missions
- Dialogue
- Collectibles
- Colors
- Basic game rules

Most changes should happen through JSON/config files instead of requiring direct edits to the core game engine.

---

## 3. Target User

The template is intended for kids, approximately ages 6–13, using Rabbit to create or remix their own games with AI.

The experience should be:

- Friendly
- Visual
- Easy to understand
- Playable quickly
- Safe for AI to modify
- Fun enough to demo in a workshop

This template will likely be used in workshops, especially in Replit, so it must be easy to run and modify.

---

## 4. Core Design Principles

### 4.1 Config-first architecture

The game should be designed so that AI agents can make most changes by editing config files.

Safe-to-edit files should include:

```txt
/src/game/config/worlds/*.json
/src/game/config/objects.config.json
/src/game/config/missions.config.json
/src/game/config/npcs.config.json
/src/game/config/vehicles.config.json
/src/game/config/theme.config.json
```

The core engine should remain stable.

### 4.2 Lightweight first

The template should avoid unnecessary complexity.

Avoid:

- Large 3D assets
- Complex shaders
- Multiplayer
- Procedural infinite terrain
- Heavy post-processing
- Advanced AI behavior
- Complex driving physics
- Large dependency chains

Prefer:

- Generated low-poly geometry
- Simple reusable primitives
- Config-driven objects
- Small worlds
- Simple physics
- Simple missions
- Fast iteration

### 4.3 AI-editable, not AI-fragile

The structure should make it easy for an AI coding agent to understand where to make changes.

The code should be modular, typed, clearly named, and documented.

Future AI agents should be guided toward editing config files first and core files only when needed.

### 4.4 Kid-friendly

The visual style should be low-poly cartoon, colorful, simple, and readable.

The first world should feel playful and imaginative, not realistic.

---

## 5. Recommended Stack

Use:

- Vite
- React
- TypeScript
- React Three Fiber
- Drei
- Rapier physics
- Zustand for game state
- JSON/config-driven world generation

The project should be runnable in Replit with:

```bash
npm install
npm run dev
```

It should also be deployable later to Vercel.

---

## 6. First Game Template

### Name

`Rabbit 3D Adventure Template`

### First Demo World

`Fantasy Island Adventure`

### Visual Style

Low-poly cartoon.

### Game Type

Third-person exploration + simple missions + simple vehicles.

### Player Experience

The player spawns on a small fantasy island. The island includes:

- Grass terrain
- Beach
- Water around the island
- Trees
- Rocks
- A small castle
- A bridge
- A river or lake
- A wizard NPC
- Collectible gems
- A simple red car
- Mission markers
- Simple UI showing progress

The first mission is:

> Collect 5 magic gems and return to Wizard Milo.

The player can:

- Walk
- Run
- Jump
- Rotate camera
- Collect gems
- Talk to the wizard
- Enter and drive a simple car
- Exit the car
- Complete the mission

---

## 7. Desired File Structure

```txt
/src
  /app
    App.tsx
    main.tsx

  /game
    /core
      GameCanvas.tsx
      GameLoop.tsx
      PhysicsWorld.tsx
      CameraController.tsx
      PlayerController.tsx
      InputManager.ts
      constants.ts

    /systems
      WorldLoader.tsx
      ObjectFactory.tsx
      MissionSystem.tsx
      NPCSystem.tsx
      VehicleSystem.tsx
      CollectibleSystem.tsx
      InteractionSystem.tsx
      UIManager.tsx

    /components
      Player.tsx
      Terrain.tsx
      Sky.tsx
      Water.tsx
      ObjectRenderer.tsx
      NPC.tsx
      Vehicle.tsx
      Collectible.tsx
      MissionMarker.tsx

    /config
      game.config.json
      theme.config.json
      objects.config.json
      npcs.config.json
      vehicles.config.json
      missions.config.json

      /worlds
        fantasy-island.json
        empty-sandbox.json
        city-island.json

    /utils
      math.ts
      ids.ts
      validators.ts
      configLoader.ts

    /types
      game.types.ts
      world.types.ts
      mission.types.ts
      object.types.ts

AI_EDITING_GUIDE.md
README.md
package.json
vite.config.ts
tsconfig.json
```

---

## 8. Core Game Features

### 8.1 Third-person player controller

The player should be controlled in third person.

Controls:

```txt
WASD / Arrow Keys = move
Mouse = rotate camera
Space = jump
Shift = run
E = interact / enter vehicle / exit vehicle
Esc = pause
```

Player behavior:

- Walk
- Run
- Jump
- Collide with world objects
- Collect items by touching them
- Interact with nearby NPCs or vehicles

The movement should feel simple and responsive. It does not need to be perfect.

### 8.2 Camera system

Use a third-person follow camera.

Requirements:

- Camera follows player smoothly
- Mouse can rotate camera around player
- Camera follows vehicle when player is driving
- Avoid overly complex camera collision in V1

### 8.3 World loading

The world should be loaded from JSON config files.

`WorldLoader.tsx` should read a world config and render:

- Terrain
- Water
- Static objects
- NPCs
- Collectibles
- Vehicles
- Mission markers

### 8.4 Terrain

V1 terrain can be simple.

For the fantasy island, use:

- A flat or slightly raised island base
- Grass center
- Sand/beach edges
- Water plane surrounding the island

Do not overbuild procedural terrain in V1.

### 8.5 Objects

Objects should be generated from reusable low-poly primitives.

Object examples:

- Tree
- Rock
- Castle
- House
- Bridge
- Fence
- Sign
- Chest
- Tower
- Car

Objects should be defined by type and properties in JSON.

### 8.6 Collectibles

Collectibles should be simple objects the player can pick up.

Examples:

- Gems
- Coins
- Stars
- Keys

V1 collectible behavior:

- Rotates or floats slightly
- Disappears when collected
- Updates mission progress
- Updates UI counter

### 8.7 NPCs

NPCs should be simple characters with dialogue.

V1 NPC behavior:

- Stands in place
- Shows interaction prompt when player is nearby
- Opens dialogue when player presses `E`
- Can be linked to a mission

No advanced AI movement is required in V1.

### 8.8 Missions

Mission system should be JSON-driven.

V1 mission types:

- `collect`
- `reach_location`
- `talk_to_npc`

Mission system should support:

- Mission title
- Description
- Progress counter
- Completion condition
- Reward message

### 8.9 Vehicles

Add simple vehicles, starting with one car.

V1 vehicle behavior:

- Player can approach vehicle
- UI shows “Press E to drive”
- Player presses `E` to enter
- Player controls vehicle with WASD/arrows
- Camera follows vehicle
- Player presses `E` again to exit
- Vehicle has simple movement and turning

Do not build realistic vehicle physics. Keep it simple and fun.

### 8.10 UI

Create a simple, kid-friendly UI.

UI should show:

- Current mission title
- Mission progress
- Interaction prompts
- Dialogue boxes
- Completion messages
- Collectible counter

Example:

```txt
Mission: Find the Magic Gems
Gems: 2 / 5
```

When near NPC:

```txt
Press E to talk to Wizard Milo
```

When near car:

```txt
Press E to drive
```

When mission complete:

```txt
Mission Complete! You saved the island!
```

---

## 9. Config System

### 9.1 World config

Each world should be defined in a JSON file.

Example: `/src/game/config/worlds/fantasy-island.json`

```json
{
  "id": "fantasy-island",
  "name": "Fantasy Island",
  "theme": "fantasy",
  "spawnPoint": {
    "position": [0, 2, 0],
    "rotation": [0, 0, 0]
  },
  "terrain": {
    "type": "island",
    "size": [80, 80],
    "height": 1,
    "groundColor": "#7FD36B",
    "sandColor": "#F4D58D",
    "waterColor": "#4DB7E5"
  },
  "objects": [
    {
      "id": "castle_01",
      "type": "castle",
      "position": [15, 0, -10],
      "rotation": [0, 0, 0],
      "scale": [1.5, 1.5, 1.5],
      "color": "#C9C9C9"
    },
    {
      "id": "tree_01",
      "type": "tree",
      "position": [-10, 0, 8],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    },
    {
      "id": "bridge_01",
      "type": "bridge",
      "position": [0, 0, -15],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    }
  ],
  "collectibles": [
    {
      "id": "gem_01",
      "type": "gem",
      "position": [3, 1, 5],
      "value": 1
    },
    {
      "id": "gem_02",
      "type": "gem",
      "position": [-8, 1, 12],
      "value": 1
    },
    {
      "id": "gem_03",
      "type": "gem",
      "position": [10, 1, 3],
      "value": 1
    },
    {
      "id": "gem_04",
      "type": "gem",
      "position": [20, 1, -8],
      "value": 1
    },
    {
      "id": "gem_05",
      "type": "gem",
      "position": [-18, 1, -10],
      "value": 1
    }
  ],
  "npcs": [
    {
      "id": "wizard_01",
      "name": "Wizard Milo",
      "type": "wizard",
      "position": [20, 0, -12],
      "rotation": [0, 0, 0],
      "dialogue": [
        "Welcome to the island!",
        "Can you find 5 magic gems for me?"
      ],
      "missionId": "collect_gems"
    }
  ],
  "vehicles": [
    {
      "id": "car_01",
      "type": "car",
      "label": "Red Island Car",
      "position": [5, 0, 12],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "color": "#FF4D4D",
      "speed": 12,
      "turnSpeed": 2,
      "canDrive": true
    }
  ]
}
```

### 9.2 Object config

Example: `/src/game/config/objects.config.json`

```json
{
  "tree": {
    "label": "Tree",
    "category": "nature",
    "primitive": "low_poly_tree",
    "editableFields": ["position", "rotation", "scale", "color"]
  },
  "castle": {
    "label": "Castle",
    "category": "building",
    "primitive": "low_poly_castle",
    "editableFields": ["position", "rotation", "scale", "color"]
  },
  "rock": {
    "label": "Rock",
    "category": "nature",
    "primitive": "low_poly_rock",
    "editableFields": ["position", "rotation", "scale", "color"]
  },
  "bridge": {
    "label": "Bridge",
    "category": "structure",
    "primitive": "low_poly_bridge",
    "editableFields": ["position", "rotation", "scale", "color"]
  },
  "car": {
    "label": "Car",
    "category": "vehicle",
    "primitive": "low_poly_car",
    "editableFields": ["position", "rotation", "scale", "color", "speed", "turnSpeed"]
  },
  "gem": {
    "label": "Gem",
    "category": "collectible",
    "primitive": "low_poly_gem",
    "editableFields": ["position", "scale", "color", "value"]
  }
}
```

### 9.3 Mission config

Example: `/src/game/config/missions.config.json`

```json
[
  {
    "id": "collect_gems",
    "title": "Find the Magic Gems",
    "description": "Collect 5 magic gems and return to Wizard Milo.",
    "type": "collect",
    "target": {
      "collectibleType": "gem",
      "count": 5
    },
    "completion": {
      "returnToNpcId": "wizard_01"
    },
    "reward": {
      "points": 100,
      "message": "You saved the island!"
    }
  }
]
```

### 9.4 NPC config

Example: `/src/game/config/npcs.config.json`

```json
{
  "wizard": {
    "label": "Wizard",
    "primitive": "low_poly_wizard",
    "defaultDialogue": [
      "Hello, adventurer!"
    ],
    "editableFields": ["name", "position", "rotation", "dialogue", "missionId", "color"]
  },
  "villager": {
    "label": "Villager",
    "primitive": "low_poly_villager",
    "defaultDialogue": [
      "Nice to meet you!"
    ],
    "editableFields": ["name", "position", "rotation", "dialogue", "missionId", "color"]
  }
}
```

### 9.5 Vehicle config

Example: `/src/game/config/vehicles.config.json`

```json
{
  "car": {
    "label": "Car",
    "primitive": "low_poly_car",
    "defaultSpeed": 12,
    "defaultTurnSpeed": 2,
    "canDrive": true,
    "editableFields": ["position", "rotation", "scale", "color", "speed", "turnSpeed"]
  },
  "kart": {
    "label": "Kart",
    "primitive": "low_poly_kart",
    "defaultSpeed": 15,
    "defaultTurnSpeed": 2.5,
    "canDrive": true,
    "editableFields": ["position", "rotation", "scale", "color", "speed", "turnSpeed"]
  }
}
```

### 9.6 Theme config

Example: `/src/game/config/theme.config.json`

```json
{
  "themes": {
    "fantasy": {
      "id": "fantasy",
      "skyColor": "#87CEEB",
      "groundColor": "#7FD36B",
      "sandColor": "#F4D58D",
      "waterColor": "#4DB7E5",
      "fogColor": "#CDEFFF",
      "lighting": {
        "ambientIntensity": 0.7,
        "sunIntensity": 1.2
      },
      "style": {
        "visualStyle": "low-poly-cartoon",
        "outline": false,
        "shadows": true
      }
    },
    "snow": {
      "id": "snow",
      "skyColor": "#DCEEFF",
      "groundColor": "#FFFFFF",
      "sandColor": "#D9F2FF",
      "waterColor": "#9DD9F3",
      "fogColor": "#EEF8FF",
      "lighting": {
        "ambientIntensity": 0.8,
        "sunIntensity": 1.0
      },
      "style": {
        "visualStyle": "low-poly-cartoon",
        "outline": false,
        "shadows": true
      }
    },
    "desert": {
      "id": "desert",
      "skyColor": "#FFDFA3",
      "groundColor": "#E6B566",
      "sandColor": "#F7D98B",
      "waterColor": "#4DB7E5",
      "fogColor": "#FFE6B8",
      "lighting": {
        "ambientIntensity": 0.75,
        "sunIntensity": 1.4
      },
      "style": {
        "visualStyle": "low-poly-cartoon",
        "outline": false,
        "shadows": true
      }
    }
  }
}
```

---

## 10. AI World Editing API

Create a simple world editing layer so Rabbit can eventually call functions like:

```ts
addObject(worldId, object)
removeObject(worldId, objectId)
updateObject(worldId, objectId, patch)
addCollectible(worldId, collectible)
removeCollectible(worldId, collectibleId)
addNPC(worldId, npc)
updateNPC(worldId, npcId, patch)
addVehicle(worldId, vehicle)
updateVehicle(worldId, vehicleId, patch)
createMission(mission)
updateMission(missionId, patch)
changeTheme(themeId)
switchWorld(worldId)
```

V1 does not need a backend.

For now, these functions can update local game state or be used internally. The structure should make it clear how Rabbit could later call these actions.

### Example API file

Create:

```txt
/src/game/systems/AIWorldEditingAPI.ts
```

It should expose functions that operate on typed world objects.

### Important

The API should validate changes when possible.

For example:

- Do not allow duplicate IDs
- Do not allow unknown object types
- Do not allow broken mission references
- Do not allow NPCs linked to non-existing missions
- Do not allow vehicles without required movement fields

---

## 11. Type Definitions

Create clear TypeScript types.

Example: `/src/game/types/world.types.ts`

```ts
export type Vector3Tuple = [number, number, number];

export type WorldConfig = {
  id: string;
  name: string;
  theme: string;
  spawnPoint: SpawnPoint;
  terrain: TerrainConfig;
  objects: WorldObjectConfig[];
  collectibles: CollectibleConfig[];
  npcs: NPCConfig[];
  vehicles: VehicleConfig[];
};

export type SpawnPoint = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
};

export type TerrainConfig = {
  type: "island" | "flat" | "city" | "sandbox";
  size: [number, number];
  height: number;
  groundColor?: string;
  sandColor?: string;
  waterColor?: string;
};

export type WorldObjectConfig = {
  id: string;
  type: string;
  position: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  color?: string;
};

export type CollectibleConfig = {
  id: string;
  type: string;
  position: Vector3Tuple;
  value?: number;
  missionId?: string;
};

export type NPCConfig = {
  id: string;
  name: string;
  type: string;
  position: Vector3Tuple;
  rotation?: Vector3Tuple;
  dialogue: string[];
  missionId?: string;
};

export type VehicleConfig = {
  id: string;
  type: string;
  label?: string;
  position: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  color?: string;
  speed: number;
  turnSpeed: number;
  canDrive: boolean;
};
```

Example: `/src/game/types/mission.types.ts`

```ts
export type MissionType = "collect" | "reach_location" | "talk_to_npc";

export type MissionConfig = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: MissionTarget;
  completion?: MissionCompletion;
  reward?: MissionReward;
};

export type MissionTarget = {
  collectibleType?: string;
  count?: number;
  locationId?: string;
  npcId?: string;
};

export type MissionCompletion = {
  returnToNpcId?: string;
  reachLocationId?: string;
};

export type MissionReward = {
  points?: number;
  message?: string;
};
```

---

## 12. Generated Low-poly Objects

Do not use heavy GLB assets in V1 unless absolutely necessary.

Build low-poly objects with simple geometry:

### Tree

- Cylinder trunk
- Cone or sphere foliage

### Rock

- Low-poly sphere or dodecahedron
- Gray material

### Castle

- Box base
- Tower cylinders or boxes
- Cone roofs
- Simple gate

### Bridge

- Box planks
- Small railings

### Car

- Box body
- Smaller box cabin
- Cylinder wheels
- Simple color material

### Wizard NPC

- Capsule/body shape
- Cone hat
- Simple face or color indicator

### Gem

- Octahedron or low-poly shape
- Emissive or bright material
- Rotate animation

This makes the template lightweight and easier for AI to modify.

---

## 13. State Management

Use Zustand for simple global game state.

State should include:

- Active world ID
- Player mode: walking or driving
- Current vehicle ID
- Collected item IDs
- Active mission ID
- Mission progress
- Dialogue state
- Nearby interactable
- Completion state

Example state shape:

```ts
type GameState = {
  activeWorldId: string;
  playerMode: "walking" | "driving";
  currentVehicleId: string | null;
  collectedIds: string[];
  activeMissionId: string | null;
  missionProgress: Record<string, number>;
  nearbyInteractable: NearbyInteractable | null;
  dialogue: DialogueState | null;
  completedMissions: string[];
};
```

---

## 14. Interaction System

The interaction system should detect when the player is near:

- NPCs
- Vehicles
- Mission markers
- Collectibles

When near an interactable, show a prompt.

Examples:

```txt
Press E to talk to Wizard Milo
Press E to drive
Press E to exit car
```

Interactions:

- NPC: open dialogue
- Vehicle: enter or exit
- Collectible: collect automatically on touch
- Mission marker: trigger reach_location mission progress

---

## 15. Mission System Details

V1 mission: `collect_gems`

Flow:

1. Player talks to Wizard Milo.
2. Wizard asks player to collect 5 gems.
3. UI shows mission progress.
4. Player collects gems around island.
5. Once 5 gems are collected, UI says return to Wizard Milo.
6. Player returns to Wizard Milo and presses `E`.
7. Mission complete message appears.

Mission states:

```txt
not_started
active
ready_to_complete
completed
```

---

## 16. Vehicle System Details

### V1 goal

Create a simple, fun car interaction.

### Entering vehicle

When the player is near a car:

```txt
Press E to drive
```

When the player presses `E`:

- Hide or disable player model
- Set player mode to `driving`
- Attach camera target to vehicle
- Enable vehicle controls

### Driving

Controls:

```txt
W / Arrow Up = accelerate
S / Arrow Down = reverse / brake
A / Arrow Left = turn left
D / Arrow Right = turn right
E = exit vehicle
```

### Exiting vehicle

When player presses `E` while driving:

- Place player next to car
- Show player again
- Set player mode to `walking`
- Camera follows player again

### Physics

Use simple movement.

Do not implement advanced suspension, wheel colliders, drifting, or realistic physics in V1.

---

## 17. Replit Requirements

The project must be easy to run in Replit.

Requirements:

- No native dependencies that break Replit
- No complex setup
- No paid APIs
- No external asset downloads required at runtime
- Should run with `npm install` and `npm run dev`
- Should work in the Replit browser preview

Add a `.replit` file if needed.

---

## 18. Performance Requirements

The game should run smoothly in a browser preview.

Target:

- Small world size
- Minimal draw calls where possible
- Simple materials
- Generated geometry
- No large textures
- No post-processing in V1
- No multiplayer in V1
- No realistic terrain generation in V1

The first world should be small enough to load fast.

---

## 19. Accessibility and Kid-friendly UX

Keep instructions simple.

Use short UI text.

Good examples:

- “Find 5 gems.”
- “Talk to Wizard Milo.”
- “Press E to drive.”
- “Mission complete!”

Avoid long text blocks.

Dialogue should be simple and encouraging.

---

## 20. AI Editing Guide

Create a file:

```txt
AI_EDITING_GUIDE.md
```

It should include:

```md
# AI Editing Guide

This project is designed to be modified by AI agents.

## Main rule

Edit config files first. Avoid changing core engine files unless necessary.

## Safe files to edit first

- `/src/game/config/worlds/*.json`
- `/src/game/config/objects.config.json`
- `/src/game/config/missions.config.json`
- `/src/game/config/npcs.config.json`
- `/src/game/config/vehicles.config.json`
- `/src/game/config/theme.config.json`

## Avoid editing unless necessary

- `/src/game/core/PlayerController.tsx`
- `/src/game/core/CameraController.tsx`
- `/src/game/core/PhysicsWorld.tsx`
- `/src/game/systems/WorldLoader.tsx`
- `/src/game/systems/VehicleSystem.tsx`

## When adding new world objects

Prefer using existing object types:

- tree
- rock
- castle
- house
- bridge
- car
- gem
- npc

If a new object type is needed, add it first to `objects.config.json`.

## When adding missions

Prefer these mission types:

- collect
- reach_location
- talk_to_npc

Keep missions short and easy for kids to understand.

## When changing the world theme

Prefer editing `theme.config.json` or the world config `theme` field.

## When adding vehicles

Use `vehicles.config.json` and the world file's `vehicles` array.

Do not add advanced vehicle physics unless specifically requested.

## When adding new gameplay mechanics

If the requested change cannot be done through config, create a new system in `/src/game/systems` and keep it modular.
```

---

## 21. README Requirements

Create a `README.md` with:

```md
# Rabbit 3D Adventure Template

A lightweight 3D adventure game template designed for AI-powered remixing.

## Run locally

```bash
npm install
npm run dev
```

## What this is

This is a config-driven 3D game template for Rabbit.

Most of the game world is controlled from JSON files so AI agents can safely modify the game.

## Main files to edit

- `src/game/config/worlds/fantasy-island.json`
- `src/game/config/missions.config.json`
- `src/game/config/vehicles.config.json`
- `src/game/config/theme.config.json`

## Example changes

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
```

---

## 22. V1 Acceptance Criteria

The project is complete when:

1. The app runs with `npm install` and `npm run dev`.
2. The player can move in third person.
3. The player can run and jump.
4. The camera follows the player.
5. The world is loaded from JSON config.
6. The fantasy island renders correctly.
7. The island includes trees, rocks, castle, bridge, water, and beach.
8. There are 5 collectible gems.
9. There is a wizard NPC.
10. The player can talk to the wizard.
11. There is a mission to collect 5 gems.
12. Mission progress appears in the UI.
13. The player can complete the mission by returning to the wizard.
14. There is one drivable car.
15. The player can enter and exit the car.
16. The player can drive the car with simple controls.
17. The UI shows interaction prompts.
18. There is an `AI_EDITING_GUIDE.md` file.
19. The README explains how to run and modify the project.
20. The project remains lightweight and does not depend on heavy assets.

---

## 23. Non-goals for V1

Do not build these in V1:

- Multiplayer
- User accounts
- Backend persistence
- Advanced NPC AI
- Advanced vehicle physics
- Inventory system
- Combat system
- Large open world
- Infinite procedural terrain
- Mobile controls
- Asset marketplace
- In-game level editor
- Real-time AI prompt interface

These can be added later.

---

## 24. Future Extensions

After V1 works, possible extensions include:

### World remixing

- Snow island
- Desert island
- City island
- Volcano island
- Pirate island
- Space island

### More missions

- Race to a checkpoint
- Find hidden keys
- Rescue an NPC
- Deliver an item
- Reach the castle

### More vehicles

- Kart
- Boat
- Hoverboard
- Plane
- Dragon mount

### More game systems

- Simple inventory
- Checkpoints
- Timers
- Racing mode
- Obby/platformer mode
- Dialogue choices
- Basic enemies
- Simple combat

### AI integration

- Natural language to world edits
- Prompt-to-mission generation
- Prompt-to-NPC generation
- Prompt-to-theme changes
- Prompt-to-vehicle changes

---

## 25. Implementation Prompt

Use this prompt to generate the first version with an AI coding agent:

```txt
Build a lightweight web-based 3D game template for Rabbit.

Use Vite + React + TypeScript + React Three Fiber + Drei + Rapier + Zustand.

The game should be a low-poly cartoon third-person adventure template designed to be edited by AI through JSON/config files.

The first world should be a fantasy island where the player can explore, collect gems, talk to an NPC wizard, complete a simple mission, and drive a basic car.

The most important requirement is architecture. The project should be easy for an AI agent to modify later. Most world changes should happen through JSON/config files, not core engine code.

Create this structure:

/src/game/core
/src/game/systems
/src/game/components
/src/game/config
/src/game/config/worlds
/src/game/types
/src/game/utils

The world should be loaded from JSON. Include config files for:

- worlds
- objects
- missions
- NPCs
- vehicles
- theme

Create a working first world called `fantasy-island.json`.

The game should include:

- third-person player movement
- follow camera
- walking, running, jumping
- simple island terrain
- water around the island
- trees, rocks, bridge, castle
- collectible gems
- one wizard NPC
- simple dialogue interaction
- one mission: collect 5 gems and return to the wizard
- one simple drivable car
- UI for mission progress and interaction prompts

Keep everything lightweight. Use generated low-poly geometry instead of heavy 3D assets. Avoid multiplayer, complex shaders, complex physics, and large dependencies.

Also create an `AI_EDITING_GUIDE.md` explaining which files future AI agents should edit first and which files they should avoid editing unless necessary.

The final project should run with:

npm install
npm run dev

It must work well in Replit.
```

---

## 26. Recommended Build Order

To avoid the AI agent trying to do too much at once, implement in phases.

### Phase 1 — Project setup and architecture

- Create Vite React TypeScript app
- Install dependencies
- Create folder structure
- Add basic canvas
- Add Zustand store
- Add config files
- Add type definitions

### Phase 2 — Player and camera

- Add third-person player
- Add movement
- Add jump
- Add follow camera
- Add basic physics

### Phase 3 — World loader

- Load fantasy island JSON
- Render terrain
- Render water
- Render trees, rocks, bridge, castle

### Phase 4 — Collectibles and mission

- Add gems
- Add collectible system
- Add mission config
- Add mission UI

### Phase 5 — NPC dialogue

- Add wizard NPC
- Add interaction detection
- Add dialogue UI
- Connect wizard to mission

### Phase 6 — Vehicle

- Add car object
- Add enter/exit interaction
- Add simple driving controls
- Make camera follow vehicle

### Phase 7 — Polish and docs

- Improve UI
- Add README
- Add AI_EDITING_GUIDE.md
- Validate Replit compatibility
- Remove unnecessary complexity

---

## 27. Definition of Success

This template is successful if a future AI agent can easily make changes like:

- Add a new car
- Add 10 gems
- Move the castle
- Change the world theme
- Add a new NPC
- Add a new simple mission
- Replace trees with snow trees
- Create a new island variant

without needing to deeply understand the rendering, physics, or player controller systems.

The final result should be a strong foundation for Rabbit’s AI-powered game creation experience.
