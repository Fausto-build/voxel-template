export type ObjectDefinition = {
  label: string;
  category: "nature" | "building" | "structure" | "prop" | "vehicle" | "collectible" | string;
  primitive: string;
  editableFields: string[];
};

export type NPCDefinition = {
  label: string;
  primitive: string;
  defaultDialogue: string[];
  editableFields: string[];
};

export type VehicleDefinition = {
  label: string;
  primitive: string;
  defaultSpeed: number;
  defaultTurnSpeed: number;
  canDrive: boolean;
  editableFields: string[];
};
