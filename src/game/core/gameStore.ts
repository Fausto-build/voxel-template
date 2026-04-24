import { create } from "zustand";
import type { GameStore, VehicleRuntimeState } from "../types/game.types";
import type { MissionConfig, MissionState } from "../types/mission.types";
import type { VehicleConfig, WorldConfig } from "../types/world.types";
import {
  cloneMissionConfig,
  cloneWorldConfig,
  gameConfig,
  getDefaultWorld,
  getMissionById,
  missionsConfig,
} from "../utils/configLoader";
import { clamp } from "../utils/math";

function createMissionStates(missions: MissionConfig[]): Record<string, MissionState> {
  return Object.fromEntries(missions.map((mission) => [mission.id, "not_started"]));
}

function createVehicleRuntime(world: WorldConfig): Record<string, VehicleRuntimeState> {
  return Object.fromEntries(
    world.vehicles.map((vehicle) => [
      vehicle.id,
      {
        id: vehicle.id,
        position: [...vehicle.position],
        rotationY: vehicle.rotation?.[1] ?? 0,
        velocity: 0,
      },
    ]),
  );
}

function countCollectedForMission(world: WorldConfig, collectedIds: string[], mission: MissionConfig) {
  if (mission.type !== "collect" || !mission.target.collectibleType) {
    return 0;
  }

  return world.collectibles
    .filter(
      (collectible) =>
        collectible.type === mission.target.collectibleType && collectedIds.includes(collectible.id),
    )
    .reduce((sum, collectible) => sum + (collectible.value ?? 1), 0);
}

function buildInitialState(world: WorldConfig, missions: MissionConfig[]) {
  return {
    activeWorldId: world.id,
    world,
    missions,
    playerMode: "walking" as const,
    currentVehicleId: null,
    playerPosition: [...world.spawnPoint.position] as [number, number, number],
    playerYaw: world.spawnPoint.rotation[1] ?? 0,
    cameraYaw: world.spawnPoint.rotation[1] ?? 0,
    cameraPitch: 0.22,
    collectedIds: [],
    activeMissionId: null,
    missionProgress: Object.fromEntries(missions.map((mission) => [mission.id, 0])),
    missionStates: createMissionStates(missions),
    nearbyInteractable: null,
    dialogue: null,
    completedMissions: [],
    completionMessage: null,
    paused: false,
    vehicleRuntime: createVehicleRuntime(world),
  };
}

const initialWorld = getDefaultWorld();
const initialMissions = cloneMissionConfig(missionsConfig);

export const useGameStore = create<GameStore>((set, get) => ({
  ...buildInitialState(initialWorld, initialMissions),

  resetWorld: (world, missions) => {
    set(buildInitialState(cloneWorldConfig(world), cloneMissionConfig(missions)));
  },

  updateWorld: (world) => {
    const currentRuntime = get().vehicleRuntime;
    const nextRuntime = createVehicleRuntime(world);

    for (const vehicle of world.vehicles) {
      if (currentRuntime[vehicle.id]) {
        nextRuntime[vehicle.id] = currentRuntime[vehicle.id];
      }
    }

    set({ activeWorldId: world.id, world: cloneWorldConfig(world), vehicleRuntime: nextRuntime });
  },

  updateMissions: (missions) => {
    const currentStates = get().missionStates;
    const currentProgress = get().missionProgress;

    set({
      missions: cloneMissionConfig(missions),
      missionStates: Object.fromEntries(
        missions.map((mission) => [mission.id, currentStates[mission.id] ?? "not_started"]),
      ),
      missionProgress: Object.fromEntries(
        missions.map((mission) => [mission.id, currentProgress[mission.id] ?? 0]),
      ),
    });
  },

  setPlayerPosition: (position) => set({ playerPosition: [...position] }),

  setPlayerYaw: (yaw) => set({ playerYaw: yaw }),

  rotateCamera: (deltaX, deltaY) => {
    const state = get();
    set({
      cameraYaw: state.cameraYaw - deltaX * 0.003,
      cameraPitch: clamp(
        state.cameraPitch - deltaY * 0.0025,
        gameConfig.camera.minPitch,
        gameConfig.camera.maxPitch,
      ),
    });
  },

  setNearbyInteractable: (interactable) => set({ nearbyInteractable: interactable }),

  collectCollectible: (collectible) => {
    const state = get();

    if (state.collectedIds.includes(collectible.id)) {
      return;
    }

    const collectedIds = [...state.collectedIds, collectible.id];
    const missionProgress = { ...state.missionProgress };
    const missionStates = { ...state.missionStates };

    for (const mission of state.missions) {
      if (mission.type !== "collect" || mission.target.collectibleType !== collectible.type) {
        continue;
      }

      const progress = countCollectedForMission(state.world, collectedIds, mission);
      missionProgress[mission.id] = progress;

      if (
        missionStates[mission.id] === "active" &&
        mission.target.count &&
        progress >= mission.target.count
      ) {
        missionStates[mission.id] = "ready_to_complete";
      }
    }

    set({ collectedIds, missionProgress, missionStates });
  },

  startMission: (missionId) => {
    const state = get();
    const mission = getMissionById(state.missions, missionId);

    if (!mission || state.missionStates[missionId] === "completed") {
      return;
    }

    const progress = countCollectedForMission(state.world, state.collectedIds, mission);
    const targetCount = mission.target.count ?? 1;
    const missionStates: Record<string, MissionState> = {
      ...state.missionStates,
      [missionId]: progress >= targetCount ? "ready_to_complete" : "active",
    };

    set({
      activeMissionId: missionId,
      missionProgress: { ...state.missionProgress, [missionId]: progress },
      missionStates,
    });
  },

  completeMission: (missionId) => {
    const state = get();
    const mission = getMissionById(state.missions, missionId);

    if (!mission) {
      return;
    }

    set({
      missionStates: { ...state.missionStates, [missionId]: "completed" },
      completedMissions: state.completedMissions.includes(missionId)
        ? state.completedMissions
        : [...state.completedMissions, missionId],
      completionMessage: mission.reward?.message ?? "Mission complete!",
      activeMissionId: missionId,
    });
  },

  openDialogue: (npc, lines) => {
    set({
      dialogue: {
        npcId: npc.id,
        speakerName: npc.name,
        lines: lines?.length ? lines : npc.dialogue,
        lineIndex: 0,
      },
    });
  },

  advanceDialogue: () => {
    const dialogue = get().dialogue;

    if (!dialogue) {
      return;
    }

    if (dialogue.lineIndex >= dialogue.lines.length - 1) {
      set({ dialogue: null });
      return;
    }

    set({ dialogue: { ...dialogue, lineIndex: dialogue.lineIndex + 1 } });
  },

  closeDialogue: () => set({ dialogue: null }),

  interact: () => {
    const state = get();

    if (state.dialogue) {
      get().advanceDialogue();
      return;
    }

    if (state.playerMode === "driving") {
      get().exitVehicle();
      return;
    }

    const nearby = state.nearbyInteractable;

    if (!nearby) {
      return;
    }

    if (nearby.kind === "vehicle") {
      const vehicle = state.world.vehicles.find((entry) => entry.id === nearby.id);
      if (vehicle) {
        get().enterVehicle(vehicle);
      }
      return;
    }

    if (nearby.kind !== "npc") {
      return;
    }

    const npc = state.world.npcs.find((entry) => entry.id === nearby.id);

    if (!npc) {
      return;
    }

    if (!npc.missionId) {
      get().openDialogue(npc);
      return;
    }

    const mission = getMissionById(state.missions, npc.missionId);
    const missionState = state.missionStates[npc.missionId];

    if (!mission) {
      get().openDialogue(npc);
      return;
    }

    if (missionState === "ready_to_complete" && mission.completion?.returnToNpcId === npc.id) {
      get().completeMission(mission.id);
      get().openDialogue(npc, [mission.reward?.message ?? "Mission complete!"]);
      return;
    }

    if (missionState === "completed") {
      get().openDialogue(npc, ["The island is safe. Thank you!"]);
      return;
    }

    if (missionState === "active") {
      const progress = state.missionProgress[mission.id] ?? 0;
      const target = mission.target.count ?? 1;
      get().openDialogue(npc, [`You found ${progress} of ${target} gems. Keep looking!`]);
      return;
    }

    get().startMission(mission.id);
    get().openDialogue(npc);
  },

  enterVehicle: (vehicle) => {
    if (!vehicle.canDrive) {
      return;
    }

    set({
      playerMode: "driving",
      currentVehicleId: vehicle.id,
      nearbyInteractable: null,
      dialogue: null,
    });
  },

  exitVehicle: () => {
    const state = get();
    const vehicleId = state.currentVehicleId;

    if (!vehicleId) {
      return;
    }

    const runtime = state.vehicleRuntime[vehicleId];
    const sideOffset = runtime
      ? [
          runtime.position[0] + Math.cos(runtime.rotationY) * 2.2,
          1.5,
          runtime.position[2] - Math.sin(runtime.rotationY) * 2.2,
        ]
      : state.playerPosition;

    set({
      playerMode: "walking",
      currentVehicleId: null,
      playerPosition: sideOffset as [number, number, number],
      nearbyInteractable: null,
    });
  },

  updateVehicleRuntime: (vehicleId, patch) => {
    const runtime = get().vehicleRuntime[vehicleId];

    if (!runtime) {
      return;
    }

    set({
      vehicleRuntime: {
        ...get().vehicleRuntime,
        [vehicleId]: { ...runtime, ...patch },
      },
    });
  },

  clearCompletionMessage: () => set({ completionMessage: null }),

  togglePaused: () => set({ paused: !get().paused }),

  setPaused: (paused) => set({ paused }),
}));
