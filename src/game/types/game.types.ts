import type { MissionConfig, MissionState } from "./mission.types";
import type {
  CollectibleConfig,
  NPCConfig,
  Vector3Tuple,
  VehicleConfig,
  WorldConfig,
} from "./world.types";

export type PlayerMode = "walking" | "driving";

export type NearbyInteractable =
  | {
      kind: "npc";
      id: string;
      label: string;
      prompt: string;
      distance: number;
    }
  | {
      kind: "vehicle";
      id: string;
      label: string;
      prompt: string;
      distance: number;
    }
  | {
      kind: "exit_vehicle";
      id: string;
      label: string;
      prompt: string;
      distance: 0;
    };

export type DialogueState = {
  npcId: string;
  speakerName: string;
  lines: string[];
  lineIndex: number;
};

export type VehicleRuntimeState = {
  id: string;
  position: Vector3Tuple;
  rotationY: number;
  velocity: number;
};

export type GameConfig = {
  title: string;
  defaultWorldId: string;
  player: {
    walkSpeed: number;
    runSpeed: number;
    jumpVelocity: number;
    interactionRadius: number;
  };
  camera: {
    distance: number;
    height: number;
    smoothing: number;
    minPitch: number;
    maxPitch: number;
  };
};

export type GameStoreState = {
  activeWorldId: string;
  world: WorldConfig;
  missions: MissionConfig[];
  playerMode: PlayerMode;
  currentVehicleId: string | null;
  playerPosition: Vector3Tuple;
  playerYaw: number;
  cameraYaw: number;
  cameraPitch: number;
  collectedIds: string[];
  activeMissionId: string | null;
  missionProgress: Record<string, number>;
  missionStates: Record<string, MissionState>;
  nearbyInteractable: NearbyInteractable | null;
  dialogue: DialogueState | null;
  completedMissions: string[];
  completionMessage: string | null;
  paused: boolean;
  vehicleRuntime: Record<string, VehicleRuntimeState>;
};

export type GameStoreActions = {
  resetWorld: (world: WorldConfig, missions: MissionConfig[]) => void;
  updateWorld: (world: WorldConfig) => void;
  updateMissions: (missions: MissionConfig[]) => void;
  setPlayerPosition: (position: Vector3Tuple) => void;
  setPlayerYaw: (yaw: number) => void;
  rotateCamera: (deltaX: number, deltaY: number) => void;
  setNearbyInteractable: (interactable: NearbyInteractable | null) => void;
  collectCollectible: (collectible: CollectibleConfig) => void;
  startMission: (missionId: string) => void;
  completeMission: (missionId: string) => void;
  openDialogue: (npc: NPCConfig, lines?: string[]) => void;
  advanceDialogue: () => void;
  closeDialogue: () => void;
  interact: () => void;
  enterVehicle: (vehicle: VehicleConfig) => void;
  exitVehicle: () => void;
  updateVehicleRuntime: (vehicleId: string, patch: Partial<VehicleRuntimeState>) => void;
  clearCompletionMessage: () => void;
  togglePaused: () => void;
  setPaused: (paused: boolean) => void;
};

export type GameStore = GameStoreState & GameStoreActions;
