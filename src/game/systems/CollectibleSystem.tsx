import { useFrame } from "@react-three/fiber";
import { Collectible } from "../components/Collectible";
import { COLLECTIBLE_RADIUS } from "../core/constants";
import { useGameStore } from "../core/gameStore";
import { EntityRegistry } from "../core/EntityRegistry";
import type { CollectibleConfig } from "../types/world.types";
import { distance2D } from "../utils/math";

type CollectibleSystemProps = {
  collectibles: CollectibleConfig[];
};

export function CollectibleSystem({ collectibles }: CollectibleSystemProps) {
  useFrame(() => {
    const state = useGameStore.getState();

    if (state.paused) {
      return;
    }

    const collectorPosition =
      (state.currentVehicleId ? EntityRegistry.getPosition(state.currentVehicleId) : null) ??
      EntityRegistry.getPosition("player") ??
      state.playerPosition;

    for (const collectible of collectibles) {
      if (state.collectedIds.includes(collectible.id)) {
        continue;
      }

      if (distance2D(collectorPosition, collectible.position) <= COLLECTIBLE_RADIUS) {
        state.collectCollectible(collectible);
      }
    }
  });

  return (
    <>
      {collectibles.map((collectible) => (
        <Collectible key={collectible.id} collectible={collectible} />
      ))}
    </>
  );
}
