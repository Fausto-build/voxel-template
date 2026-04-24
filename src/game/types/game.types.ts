import type { MissionConfig, MissionState } from "./mission.types";
import type {
  CollectibleConfig,
  NPCConfig,
  Vector3Tuple,
  VehicleConfig,
  WorldConfig,
} from "./world.types";

export type PlayerMode = "walking" | "driving";
export type CharacterState = "idle" | "walking" | "running" | "jumping" | "falling" | "driving";
export type CameraMode = "follow" | "vehicle_first_person" | "free";

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
  steering: number;
  wheelSpin: number;
  exitRequested: boolean;
};

export type NPCRuntimeState = {
  id: string;
  position: Vector3Tuple;
  rotationY: number;
  pathIndex: number;
  pathDirection: 1 | -1;
};

export type GameConfig = {
  title: string;
  defaultWorldId: string;
  player: {
    walkSpeed: number;
    runSpeed: number;
    jumpVelocity: number;
    interactionRadius: number;
    acceleration?: number;
    airControl?: number;
    yawSmoothing?: number;
  };
  camera: {
    distance: number;
    height: number;
    smoothing: number;
    minPitch: number;
    maxPitch: number;
    minDistance?: number;
    maxDistance?: number;
    zoomStep?: number;
    freeCameraSpeed?: number;
    vehicleFirstPersonHeight?: number;
    vehicleFirstPersonForwardOffset?: number;
    vehicleFirstPersonSmoothing?: number;
  };
  vehicle?: {
    acceleration?: number;
    brakePower?: number;
    reverseSpeedRatio?: number;
    steeringSmoothing?: number;
    handbrakeDrift?: number;
  };
  npc?: {
    moveSpeed?: number;
    wanderRadius?: number;
    followDistance?: number;
  };
};

export type GameStoreState = {
  activeWorldId: string;
  world: WorldConfig;
  missions: MissionConfig[];
  playerMode: PlayerMode;
  playerState: CharacterState;
  currentVehicleId: string | null;
  playerPosition: Vector3Tuple;
  playerYaw: number;
  cameraMode: CameraMode;
  cameraYaw: number;
  cameraPitch: number;
  cameraDistance: number;
  freeCameraPosition: Vector3Tuple;
  collectedIds: string[];
  activeMissionId: string | null;
  missionProgress: Record<string, number>;
  missionStates: Record<string, MissionState>;
  waypointProgress: Record<string, number>;
  nearbyInteractable: NearbyInteractable | null;
  dialogue: DialogueState | null;
  completedMissions: string[];
  completionMessage: string | null;
  paused: boolean;
  vehicleRuntime: Record<string, VehicleRuntimeState>;
  npcRuntime: Record<string, NPCRuntimeState>;
};

export type GameStoreActions = {
  resetWorld: (world: WorldConfig, missions: MissionConfig[]) => void;
  updateWorld: (world: WorldConfig) => void;
  updateMissions: (missions: MissionConfig[]) => void;
  setPlayerPosition: (position: Vector3Tuple) => void;
  setPlayerYaw: (yaw: number) => void;
  setPlayerState: (state: CharacterState) => void;
  rotateCamera: (deltaX: number, deltaY: number) => void;
  setCameraDistance: (distance: number) => void;
  toggleVehicleCameraMode: () => void;
  toggleFreeCamera: () => void;
  moveFreeCamera: (position: Vector3Tuple) => void;
  setNearbyInteractable: (interactable: NearbyInteractable | null) => void;
  collectCollectible: (collectible: CollectibleConfig) => void;
  startMission: (missionId: string) => void;
  completeMission: (missionId: string) => void;
  advanceWaypoint: (missionId: string) => void;
  openDialogue: (npc: NPCConfig, lines?: string[]) => void;
  advanceDialogue: () => void;
  closeDialogue: () => void;
  interact: () => void;
  enterVehicle: (vehicle: VehicleConfig) => void;
  exitVehicle: () => void;
  updateVehicleRuntime: (vehicleId: string, patch: Partial<VehicleRuntimeState>) => void;
  updateNPCRuntime: (npcId: string, patch: Partial<NPCRuntimeState>) => void;
  clearCompletionMessage: () => void;
  togglePaused: () => void;
  setPaused: (paused: boolean) => void;
};

export type GameStore = GameStoreState & GameStoreActions;
