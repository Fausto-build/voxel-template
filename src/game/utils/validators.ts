import { hasDuplicateIds } from "./ids";
import { npcDefinitions, objectDefinitions, vehicleDefinitions } from "./configLoader";
import type { MissionConfig } from "../types/mission.types";
import type {
  NPCConfig,
  Vector3Tuple,
  VehicleConfig,
  WorldConfig,
  WorldObjectConfig,
  WorldPathConfig,
} from "../types/world.types";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

export function fail(message: string): ValidationResult {
  return { valid: false, errors: [message] };
}

export function mergeValidationResults(results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap((result) => result.errors);
  return { valid: errors.length === 0, errors };
}

export function isVector3Tuple(value: unknown): value is Vector3Tuple {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((entry) => typeof entry === "number" && Number.isFinite(entry))
  );
}

export function validateObject(object: WorldObjectConfig): ValidationResult {
  if (!objectDefinitions[object.type]) {
    return fail(`Unknown object type "${object.type}". Add it to objects.config.json first.`);
  }

  if (!isVector3Tuple(object.position)) {
    return fail(`Object "${object.id}" needs a numeric [x, y, z] position.`);
  }

  return ok();
}

export function validateNPC(npc: NPCConfig, missions: MissionConfig[]): ValidationResult {
  const errors: string[] = [];

  if (!npcDefinitions[npc.type]) {
    errors.push(`Unknown NPC type "${npc.type}". Add it to npcs.config.json first.`);
  }

  if (npc.missionId && !missions.some((mission) => mission.id === npc.missionId)) {
    errors.push(`NPC "${npc.id}" links to missing mission "${npc.missionId}".`);
  }

  if (!isVector3Tuple(npc.position)) {
    errors.push(`NPC "${npc.id}" needs a numeric [x, y, z] position.`);
  }

  if (npc.behavior && !["idle", "wander", "patrol", "followPlayer"].includes(npc.behavior)) {
    errors.push(`NPC "${npc.id}" has unknown behavior "${npc.behavior}".`);
  }

  if (npc.wanderRadius !== undefined && !isPositiveNumber(npc.wanderRadius)) {
    errors.push(`NPC "${npc.id}" needs a positive wanderRadius value.`);
  }

  if (npc.followDistance !== undefined && !isPositiveNumber(npc.followDistance)) {
    errors.push(`NPC "${npc.id}" needs a positive followDistance value.`);
  }

  if (npc.moveSpeed !== undefined && !isPositiveNumber(npc.moveSpeed)) {
    errors.push(`NPC "${npc.id}" needs a positive moveSpeed value.`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateVehicle(vehicle: VehicleConfig): ValidationResult {
  const errors: string[] = [];

  if (!vehicleDefinitions[vehicle.type]) {
    errors.push(`Unknown vehicle type "${vehicle.type}". Add it to vehicles.config.json first.`);
  }

  if (!isVector3Tuple(vehicle.position)) {
    errors.push(`Vehicle "${vehicle.id}" needs a numeric [x, y, z] position.`);
  }

  if (typeof vehicle.speed !== "number" || typeof vehicle.turnSpeed !== "number") {
    errors.push(`Vehicle "${vehicle.id}" needs numeric speed and turnSpeed values.`);
  }

  for (const field of ["acceleration", "brakePower", "reverseSpeed", "steeringSmoothing"] as const) {
    const value = vehicle[field];
    if (value !== undefined && !isPositiveNumber(value)) {
      errors.push(`Vehicle "${vehicle.id}" needs a positive ${field} value.`);
    }
  }

  if (vehicle.handbrakeDrift !== undefined && !isNonNegativeNumber(vehicle.handbrakeDrift)) {
    errors.push(`Vehicle "${vehicle.id}" needs a non-negative handbrakeDrift value.`);
  }

  if (vehicle.wheelVisuals !== undefined && typeof vehicle.wheelVisuals !== "boolean") {
    errors.push(`Vehicle "${vehicle.id}" needs wheelVisuals to be true or false.`);
  }

  if (
    vehicle.cameraMode !== undefined &&
    vehicle.cameraMode !== "thirdPerson" &&
    vehicle.cameraMode !== "firstPerson"
  ) {
    errors.push(`Vehicle "${vehicle.id}" has unknown cameraMode "${vehicle.cameraMode}".`);
  }

  return { valid: errors.length === 0, errors };
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function validatePath(path: WorldPathConfig): ValidationResult {
  const errors: string[] = [];

  if (!path.id) {
    errors.push("Every path needs an id.");
  }

  if (!Array.isArray(path.points) || path.points.length < 2) {
    errors.push(`Path "${path.id}" needs at least two points.`);
  } else {
    path.points.forEach((point, index) => {
      if (!isVector3Tuple(point)) {
        errors.push(`Path "${path.id}" point ${index + 1} needs a numeric [x, y, z] position.`);
      }
    });
  }

  if (path.loop !== undefined && typeof path.loop !== "boolean") {
    errors.push(`Path "${path.id}" needs loop to be true or false.`);
  }

  return { valid: errors.length === 0, errors };
}

function validateNPCPathReferences(world: WorldConfig): ValidationResult {
  const errors: string[] = [];
  const paths = world.paths ?? [];

  for (const npc of world.npcs) {
    if (npc.behavior === "patrol" && !npc.pathId) {
      errors.push(`NPC "${npc.id}" uses patrol behavior but has no pathId.`);
    }

    if (npc.pathId && !paths.some((path) => path.id === npc.pathId)) {
      errors.push(`NPC "${npc.id}" links to missing path "${npc.pathId}".`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateMissionReferences(
  world: WorldConfig,
  missions: MissionConfig[],
): ValidationResult {
  const errors: string[] = [];

  for (const mission of missions) {
    if (mission.completion?.returnToNpcId) {
      const npcExists = world.npcs.some((npc) => npc.id === mission.completion?.returnToNpcId);
      if (!npcExists) {
        errors.push(
          `Mission "${mission.id}" returns to missing NPC "${mission.completion.returnToNpcId}".`,
        );
      }
    }

    if (mission.type === "collect" && mission.target.collectibleType) {
      const matchingCollectible = world.collectibles.some(
        (collectible) => collectible.type === mission.target.collectibleType,
      );
      if (!matchingCollectible) {
        errors.push(
          `Mission "${mission.id}" needs collectible type "${mission.target.collectibleType}".`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorldConfig(world: WorldConfig, missions: MissionConfig[]): ValidationResult {
  const allIds = [
    ...world.objects.map((item) => ({ id: item.id })),
    ...world.collectibles.map((item) => ({ id: item.id })),
    ...world.npcs.map((item) => ({ id: item.id })),
    ...world.vehicles.map((item) => ({ id: item.id })),
  ];

  const results: ValidationResult[] = [
    hasDuplicateIds(allIds) ? fail("World contains duplicate IDs.") : ok(),
    hasDuplicateIds(world.paths ?? []) ? fail("World contains duplicate path IDs.") : ok(),
    ...world.objects.map(validateObject),
    ...world.npcs.map((npc) => validateNPC(npc, missions)),
    ...world.vehicles.map(validateVehicle),
    ...(world.paths ?? []).map(validatePath),
    validateNPCPathReferences(world),
    validateMissionReferences(world, missions),
  ];

  return mergeValidationResults(results);
}
