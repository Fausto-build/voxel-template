import gameConfigJson from "../config/game.config.json";
import missionsConfigJson from "../config/missions.config.json";
import npcDefinitionsJson from "../config/npcs.config.json";
import objectDefinitionsJson from "../config/objects.config.json";
import themeConfigJson from "../config/theme.config.json";
import vehicleDefinitionsJson from "../config/vehicles.config.json";
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

const worldModules = import.meta.glob<WorldConfig>("../config/worlds/*.json", { eager: true });

export const worldRegistry: Record<string, WorldConfig> = Object.fromEntries(
  Object.values(worldModules)
    .filter((w) => typeof w === "object" && w !== null && "id" in w)
    .map((w) => [(w as WorldConfig).id, w as WorldConfig]),
);

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
  return cloneWorldConfig(worldRegistry[gameConfig.defaultWorldId]);
}

export function getTheme(themeId: string) {
  return themeRegistry.themes[themeId] ?? themeRegistry.themes.fantasy;
}

export function getMissionById(missions: MissionConfig[], missionId: string) {
  return missions.find((mission) => mission.id === missionId) ?? null;
}
