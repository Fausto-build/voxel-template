export type MissionType = "collect" | "reach_location" | "talk_to_npc";

export type MissionState =
  | "not_started"
  | "active"
  | "ready_to_complete"
  | "completed";

export type MissionWaypoint = {
  position: [number, number, number];
  radius: number;
  label?: string;
};

export type MissionConfig = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: MissionTarget;
  completion?: MissionCompletion;
  reward?: MissionReward;
  waypoints?: MissionWaypoint[];
};

export type MissionTarget = {
  collectibleType?: string;
  count?: number;
  locationId?: string;
  locationPosition?: [number, number, number];
  locationRadius?: number;
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
