export type MissionType = "collect" | "reach_location" | "talk_to_npc";

export type MissionState =
  | "not_started"
  | "active"
  | "ready_to_complete"
  | "completed";

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
