import type { Vector3Tuple } from "../types/world.types";

type EntityEntry = {
  position: Vector3Tuple;
  rotationY: number;
};

// Mutable singleton holding live per-frame transform data for all dynamic entities.
// Components write here every frame without touching Zustand, avoiding React re-renders
// on every tick. Systems that need live positions (MissionSystem, InteractionSystem)
// read directly from this registry.
const entities = new Map<string, EntityEntry>();

export const EntityRegistry = {
  set(id: string, position: Vector3Tuple, rotationY: number) {
    const entry = entities.get(id);
    if (entry) {
      entry.position[0] = position[0];
      entry.position[1] = position[1];
      entry.position[2] = position[2];
      entry.rotationY = rotationY;
    } else {
      entities.set(id, { position: [...position], rotationY });
    }
  },

  get(id: string): EntityEntry | undefined {
    return entities.get(id);
  },

  getPosition(id: string): Vector3Tuple | undefined {
    return entities.get(id)?.position;
  },

  delete(id: string) {
    entities.delete(id);
  },

  clear() {
    entities.clear();
  },
};
