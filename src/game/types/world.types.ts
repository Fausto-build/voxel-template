export type Vector3Tuple = [number, number, number];
export type RotationTuple = [number, number, number];
export type ScaleTuple = [number, number, number];
export type NPCBehavior = "idle" | "wander" | "patrol" | "followPlayer";
export type VehicleCameraMode = "thirdPerson" | "firstPerson";

export type SpawnPoint = {
  position: Vector3Tuple;
  rotation: RotationTuple;
};

export type TerrainType = "island" | "flat" | "city" | "sandbox";

export type TerrainConfig = {
  type: TerrainType;
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
  rotation?: RotationTuple;
  scale?: ScaleTuple;
  color?: string;
};

export type CollectibleConfig = {
  id: string;
  type: string;
  position: Vector3Tuple;
  value?: number;
  missionId?: string;
  color?: string;
};

export type NPCConfig = {
  id: string;
  name: string;
  type: string;
  position: Vector3Tuple;
  rotation?: RotationTuple;
  dialogue: string[];
  missionId?: string;
  color?: string;
  behavior?: NPCBehavior;
  pathId?: string;
  wanderRadius?: number;
  followDistance?: number;
  moveSpeed?: number;
};

export type VehicleConfig = {
  id: string;
  type: string;
  label?: string;
  position: Vector3Tuple;
  rotation?: RotationTuple;
  scale?: ScaleTuple;
  color?: string;
  speed: number;
  turnSpeed: number;
  canDrive: boolean;
  acceleration?: number;
  brakePower?: number;
  reverseSpeed?: number;
  steeringSmoothing?: number;
  handbrakeDrift?: number;
  wheelVisuals?: boolean;
  cameraMode?: VehicleCameraMode;
};

export type WorldPathConfig = {
  id: string;
  points: Vector3Tuple[];
  loop?: boolean;
};

export type PropScatterEntry = {
  kind: string;
  count: number;
  area: number;
  color?: string;
  jitter?: number;
  minScale?: number;
  maxScale?: number;
};

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
  paths?: WorldPathConfig[];
  props?: PropScatterEntry[];
};

export type ThemeConfig = {
  id: string;
  skyColor: string;
  groundColor: string;
  sandColor: string;
  waterColor: string;
  fogColor: string;
  fogNear?: number;
  fogFar?: number;
  toneMappingExposure?: number;
  sunPosition?: [number, number, number];
  lighting: {
    ambientIntensity: number;
    sunIntensity: number;
  };
  style: {
    visualStyle: string;
    outline: boolean;
    shadows: boolean;
  };
};

export type ThemeRegistry = {
  themes: Record<string, ThemeConfig>;
};
