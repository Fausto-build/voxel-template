import { useFrame } from "@react-three/fiber";
import { DEFAULT_INTERACTION_RADIUS } from "../core/constants";
import { useGameStore } from "../core/gameStore";
import { EntityRegistry } from "../core/EntityRegistry";
import type { NearbyInteractable } from "../types/game.types";
import { gameConfig } from "../utils/configLoader";
import { distance2D } from "../utils/math";

function isSameInteractable(a: NearbyInteractable | null, b: NearbyInteractable | null) {
  return a?.kind === b?.kind && a?.id === b?.id && a?.prompt === b?.prompt;
}

export function InteractionSystem() {
  useFrame(() => {
    const state = useGameStore.getState();
    const radius = gameConfig.player.interactionRadius ?? DEFAULT_INTERACTION_RADIUS;

    if (state.playerMode === "driving" && state.currentVehicleId) {
      const runtime = state.vehicleRuntime[state.currentVehicleId];
      const interactable: NearbyInteractable = {
        kind: "exit_vehicle",
        id: state.currentVehicleId,
        label: "Auto",
        prompt: runtime?.exitRequested ? "Frenando antes de salir..." : "Presiona E para salir del auto",
        distance: 0,
      };

      if (!isSameInteractable(state.nearbyInteractable, interactable)) {
        state.setNearbyInteractable(interactable);
      }
      return;
    }

    // Use EntityRegistry for live positions — avoids subscribing to Zustand position state
    const playerPos = EntityRegistry.getPosition("player") ?? state.playerPosition;
    let nearest: NearbyInteractable | null = null;

    for (const npc of state.world.npcs) {
      const npcPosition = EntityRegistry.getPosition(npc.id) ?? state.npcRuntime[npc.id]?.position ?? npc.position;
      const distance = distance2D(playerPos, npcPosition);

      if (distance > radius) {
        continue;
      }

      const missionState = npc.missionId ? state.missionStates[npc.missionId] : null;
      const prompt =
        missionState === "ready_to_complete"
          ? `Presiona E para entregar las gemas a ${npc.name}`
          : `Presiona E para hablar con ${npc.name}`;

      const candidate: NearbyInteractable = {
        kind: "npc",
        id: npc.id,
        label: npc.name,
        prompt,
        distance,
      };

      if (!nearest || candidate.distance < nearest.distance) {
        nearest = candidate;
      }
    }

    for (const vehicle of state.world.vehicles) {
      if (!vehicle.canDrive) {
        continue;
      }

      const vehiclePosition = EntityRegistry.getPosition(vehicle.id) ?? state.vehicleRuntime[vehicle.id]?.position ?? vehicle.position;
      const distance = distance2D(playerPos, vehiclePosition);

      if (distance > radius) {
        continue;
      }

      const candidate: NearbyInteractable = {
        kind: "vehicle",
        id: vehicle.id,
        label: vehicle.label ?? vehicle.type,
        prompt: "Presiona E para conducir",
        distance,
      };

      if (!nearest || candidate.distance < nearest.distance) {
        nearest = candidate;
      }
    }

    if (!isSameInteractable(state.nearbyInteractable, nearest)) {
      state.setNearbyInteractable(nearest);
    }
  });

  return null;
}
