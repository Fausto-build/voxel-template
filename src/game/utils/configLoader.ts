import gameConfigJson from "../config/game.config.json";
import missionsConfigJson from "../config/missions.config.json";
import npcDefinitionsJson from "../config/npcs.config.json";
import objectDefinitionsJson from "../config/objects.config.json";
import themeConfigJson from "../config/theme.config.json";
import vehicleDefinitionsJson from "../config/vehicles.config.json";
import cityIslandJson from "../config/worlds/city-island.json";
import emptySandboxJson from "../config/worlds/empty-sandbox.json";
import fantasyIslandJson from "../config/worlds/fantasy-island.json";
import type { GameConfig } from "../types/game.types";
import type { MissionConfig } from "../types/mission.types";
import type {
  NPCDefinition,
  ObjectDefinition,
  VehicleDefinition,
} from "../types/object.types";
import type { ThemeRegistry, WorldConfig } from "../types/world.types";

export const gameConfig = gameConfigJson as GameConfig;
export const missionsConfig = missionsConfigJson as MissionConfig[];
export const objectDefinitions = objectDefinitionsJson as Record<string, ObjectDefinition>;
export const npcDefinitions = npcDefinitionsJson as Record<string, NPCDefinition>;
export const vehicleDefinitions = vehicleDefinitionsJson as Record<string, VehicleDefinition>;
export const themeRegistry = themeConfigJson as unknown as ThemeRegistry;

function asWorldConfig(value: unknown): WorldConfig {
  return value as WorldConfig;
}

// Worlds are registered here. Drop a new JSON into config/worlds/ and add one line below.
export const worldRegistry: Record<string, WorldConfig> = {
  [fantasyIslandJson.id]: asWorldConfig(fantasyIslandJson),
  [emptySandboxJson.id]: asWorldConfig(emptySandboxJson),
  [cityIslandJson.id]: asWorldConfig(cityIslandJson),
};

export function listWorlds(): WorldConfig[] {
  return Object.values(worldRegistry);
}

export function loadWorld(id: string): WorldConfig | null {
  return worldRegistry[id] ?? null;
}

export function cloneWorldConfig(world: WorldConfig): WorldConfig {
  return structuredClone(world);
}

export function cloneMissionConfig(missions: MissionConfig[]): MissionConfig[] {
  return structuredClone(missions);
}

export function getDefaultWorld(): WorldConfig {
  const world = worldRegistry[gameConfig.defaultWorldId];
  if (!world) {
    const first = Object.values(worldRegistry)[0];
    if (!first) throw new Error("No worlds found in config/worlds/");
    return cloneWorldConfig(first);
  }
  return cloneWorldConfig(world);
}

export function getTheme(themeId: string) {
  return themeRegistry.themes[themeId] ?? themeRegistry.themes.fantasy;
}

export function getMissionById(missions: MissionConfig[], missionId: string) {
  return missions.find((mission) => mission.id === missionId) ?? null;
}
