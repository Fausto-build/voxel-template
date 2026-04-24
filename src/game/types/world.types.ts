export type Vector3Tuple = [number, number, number];
export type RotationTuple = [number, number, number];
export type ScaleTuple = [number, number, number];

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
};

export type ThemeConfig = {
  id: string;
  skyColor: string;
  groundColor: string;
  sandColor: string;
  waterColor: string;
  fogColor: string;
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
