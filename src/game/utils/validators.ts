import { hasDuplicateIds } from "./ids";
import { npcDefinitions, objectDefinitions, vehicleDefinitions } from "./configLoader";
import type { MissionConfig } from "../types/mission.types";
import type {
  NPCConfig,
  Vector3Tuple,
  VehicleConfig,
  WorldConfig,
  WorldObjectConfig,
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
    ...world.objects.map(validateObject),
    ...world.npcs.map((npc) => validateNPC(npc, missions)),
    ...world.vehicles.map(validateVehicle),
    validateMissionReferences(world, missions),
  ];

  return mergeValidationResults(results);
}
