import { useGameStore } from "../core/gameStore";
import type { MissionConfig } from "../types/mission.types";
import type {
  CollectibleConfig,
  NPCConfig,
  VehicleConfig,
  WorldConfig,
  WorldObjectConfig,
  WorldPathConfig,
} from "../types/world.types";
import { themeRegistry, worldRegistry } from "../utils/configLoader";
import { hasDuplicateIds } from "../utils/ids";
import {
  fail,
  isVector3Tuple,
  ok,
  validateMissionReferences,
  validateNPC,
  validateObject,
  validateVehicle,
  validateWorldConfig,
  type ValidationResult,
} from "../utils/validators";

type EditResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      errors: string[];
    };

function result<T>(value: T, validation: ValidationResult = ok()): EditResult<T> {
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  return { ok: true, value };
}

function activeWorldFor(worldId: string): EditResult<WorldConfig> {
  const state = useGameStore.getState();

  if (state.world.id !== worldId) {
    return { ok: false, errors: [`World "${worldId}" is not active.`] };
  }

  return { ok: true, value: state.world };
}

function ensureUniqueId(world: WorldConfig, id: string): ValidationResult {
  const ids = [
    ...world.objects.map((entry) => ({ id: entry.id })),
    ...world.collectibles.map((entry) => ({ id: entry.id })),
    ...world.npcs.map((entry) => ({ id: entry.id })),
    ...world.vehicles.map((entry) => ({ id: entry.id })),
    ...(world.paths ?? []).map((entry) => ({ id: entry.id })),
  ];

  return hasDuplicateIds([...ids, { id }]) ? fail(`ID "${id}" already exists in this world.`) : ok();
}

function applyWorld(world: WorldConfig): EditResult<WorldConfig> {
  const state = useGameStore.getState();
  const validation = validateWorldConfig(world, state.missions);

  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  state.updateWorld(world);
  return { ok: true, value: world };
}

export function addObject(worldId: string, object: WorldObjectConfig): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  const validation = validateObject(object);
  if (!validation.valid) return result(active.value, validation);

  const unique = ensureUniqueId(active.value, object.id);
  if (!unique.valid) return result(active.value, unique);

  return applyWorld({ ...active.value, objects: [...active.value.objects, object] });
}

export function removeObject(worldId: string, objectId: string): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  return applyWorld({
    ...active.value,
    objects: active.value.objects.filter((object) => object.id !== objectId),
  });
}

export function updateObject(
  worldId: string,
  objectId: string,
  patch: Partial<WorldObjectConfig>,
): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  const nextObjects = active.value.objects.map((object) =>
    object.id === objectId ? { ...object, ...patch, id: object.id } : object,
  );
  const target = nextObjects.find((object) => object.id === objectId);
  const validation = target ? validateObject(target) : fail(`Object "${objectId}" was not found.`);
  if (!validation.valid) return result(active.value, validation);

  return applyWorld({ ...active.value, objects: nextObjects });
}

export function addCollectible(
  worldId: string,
  collectible: CollectibleConfig,
): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  if (!isVector3Tuple(collectible.position)) {
    return result(active.value, fail(`Collectible "${collectible.id}" needs a numeric position.`));
  }

  const unique = ensureUniqueId(active.value, collectible.id);
  if (!unique.valid) return result(active.value, unique);

  return applyWorld({
    ...active.value,
    collectibles: [...active.value.collectibles, collectible],
  });
}

export function removeCollectible(worldId: string, collectibleId: string): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  return applyWorld({
    ...active.value,
    collectibles: active.value.collectibles.filter((item) => item.id !== collectibleId),
  });
}

export function addNPC(worldId: string, npc: NPCConfig): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  const validation = validateNPC(npc, useGameStore.getState().missions);
  if (!validation.valid) return result(active.value, validation);

  const unique = ensureUniqueId(active.value, npc.id);
  if (!unique.valid) return result(active.value, unique);

  return applyWorld({ ...active.value, npcs: [...active.value.npcs, npc] });
}

export function updateNPC(
  worldId: string,
  npcId: string,
  patch: Partial<NPCConfig>,
): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  const missions = useGameStore.getState().missions;
  const nextNPCs = active.value.npcs.map((npc) =>
    npc.id === npcId ? { ...npc, ...patch, id: npc.id } : npc,
  );
  const target = nextNPCs.find((npc) => npc.id === npcId);
  const validation = target ? validateNPC(target, missions) : fail(`NPC "${npcId}" was not found.`);
  if (!validation.valid) return result(active.value, validation);

  return applyWorld({ ...active.value, npcs: nextNPCs });
}

export function addVehicle(worldId: string, vehicle: VehicleConfig): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  const validation = validateVehicle(vehicle);
  if (!validation.valid) return result(active.value, validation);

  const unique = ensureUniqueId(active.value, vehicle.id);
  if (!unique.valid) return result(active.value, unique);

  return applyWorld({ ...active.value, vehicles: [...active.value.vehicles, vehicle] });
}

export function updateVehicle(
  worldId: string,
  vehicleId: string,
  patch: Partial<VehicleConfig>,
): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  const nextVehicles = active.value.vehicles.map((vehicle) =>
    vehicle.id === vehicleId ? { ...vehicle, ...patch, id: vehicle.id } : vehicle,
  );
  const target = nextVehicles.find((vehicle) => vehicle.id === vehicleId);
  const validation = target
    ? validateVehicle(target)
    : fail(`Vehicle "${vehicleId}" was not found.`);
  if (!validation.valid) return result(active.value, validation);

  return applyWorld({ ...active.value, vehicles: nextVehicles });
}

export function addPath(worldId: string, path: WorldPathConfig): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  const unique = ensureUniqueId(active.value, path.id);
  if (!unique.valid) return result(active.value, unique);

  return applyWorld({ ...active.value, paths: [...(active.value.paths ?? []), path] });
}

export function removePath(worldId: string, pathId: string): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  return applyWorld({
    ...active.value,
    paths: (active.value.paths ?? []).filter((path) => path.id !== pathId),
  });
}

export function updatePath(
  worldId: string,
  pathId: string,
  patch: Partial<WorldPathConfig>,
): EditResult<WorldConfig> {
  const active = activeWorldFor(worldId);
  if (!active.ok) return active;

  const paths = active.value.paths ?? [];
  const nextPaths = paths.map((path) =>
    path.id === pathId ? { ...path, ...patch, id: path.id } : path,
  );

  if (!paths.some((path) => path.id === pathId)) {
    return { ok: false, errors: [`Path "${pathId}" was not found.`] };
  }

  return applyWorld({ ...active.value, paths: nextPaths });
}

export function createMission(mission: MissionConfig): EditResult<MissionConfig[]> {
  const state = useGameStore.getState();

  if (state.missions.some((entry) => entry.id === mission.id)) {
    return { ok: false, errors: [`Mission "${mission.id}" already exists.`] };
  }

  const missions = [...state.missions, mission];
  const validation = validateMissionReferences(state.world, missions);

  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  state.updateMissions(missions);
  return { ok: true, value: missions };
}

export function updateMission(
  missionId: string,
  patch: Partial<MissionConfig>,
): EditResult<MissionConfig[]> {
  const state = useGameStore.getState();
  const missions = state.missions.map((mission) =>
    mission.id === missionId ? { ...mission, ...patch, id: mission.id } : mission,
  );

  if (!missions.some((mission) => mission.id === missionId)) {
    return { ok: false, errors: [`Mission "${missionId}" was not found.`] };
  }

  const validation = validateMissionReferences(state.world, missions);

  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  state.updateMissions(missions);
  return { ok: true, value: missions };
}

export function changeTheme(themeId: string): EditResult<WorldConfig> {
  const state = useGameStore.getState();

  if (!themeRegistry.themes[themeId]) {
    return { ok: false, errors: [`Unknown theme "${themeId}". Add it to theme.config.json first.`] };
  }

  return applyWorld({ ...state.world, theme: themeId });
}

export function switchWorld(worldId: string): EditResult<WorldConfig> {
  const world = worldRegistry[worldId];
  const state = useGameStore.getState();

  if (!world) {
    return { ok: false, errors: [`World "${worldId}" does not exist.`] };
  }

  const validation = validateWorldConfig(world, state.missions);

  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  state.resetWorld(world, state.missions);
  return { ok: true, value: world };
}
