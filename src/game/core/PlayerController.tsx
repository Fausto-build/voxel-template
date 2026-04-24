import { CapsuleCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { InputManager } from "./InputManager";
import { GRAVITY, PLAYER_HEIGHT, PLAYER_RADIUS } from "./constants";
import { useGameStore } from "./gameStore";
import { Player } from "../components/Player";
import { gameConfig } from "../utils/configLoader";
import { clampToIsland, normalizeAngle, resolveObjectCollisions } from "../utils/math";
import type { Vector3Tuple } from "../types/world.types";

export function PlayerController() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const verticalVelocity = useRef(0);
  const grounded = useRef(false);
  const visible = useGameStore((state) => state.playerMode === "walking");
  const playerYaw = useGameStore((state) => state.playerYaw);
  const spawnPosition = useGameStore((state) => state.world.spawnPoint.position);

  useFrame((_, rawDelta) => {
    const state = useGameStore.getState();

    if (state.playerMode !== "walking") {
      return;
    }

    const delta = Math.min(rawDelta, 0.033);
    const current = bodyRef.current?.translation();
    const currentPosition: Vector3Tuple = current
      ? [current.x, current.y, current.z]
      : state.playerPosition;
    let next: Vector3Tuple = [...currentPosition];

    if (!state.paused) {
      const axes = InputManager.getMoveAxes();
      const length = Math.hypot(axes.forward, axes.right);

      if (length > 0) {
        const normalizedForward = axes.forward / length;
        const normalizedRight = axes.right / length;
        const yaw = state.cameraYaw;
        const forwardX = -Math.sin(yaw);
        const forwardZ = -Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);
        const directionX = forwardX * normalizedForward + rightX * normalizedRight;
        const directionZ = forwardZ * normalizedForward + rightZ * normalizedRight;
        const speed =
          InputManager.isDown("ShiftLeft") || InputManager.isDown("ShiftRight")
            ? gameConfig.player.runSpeed
            : gameConfig.player.walkSpeed;

        next = [next[0] + directionX * speed * delta, next[1], next[2] + directionZ * speed * delta];
        state.setPlayerYaw(normalizeAngle(Math.atan2(directionX, directionZ)));
      }

      if (InputManager.consumePressed("Space") && grounded.current) {
        verticalVelocity.current = gameConfig.player.jumpVelocity;
        grounded.current = false;
      }

      verticalVelocity.current += GRAVITY * delta;
      next = [next[0], next[1] + verticalVelocity.current * delta, next[2]];

      const groundCenterY = PLAYER_HEIGHT / 2 + 0.08;
      if (next[1] <= groundCenterY) {
        next[1] = groundCenterY;
        verticalVelocity.current = 0;
        grounded.current = true;
      }

      const islandRadius = state.world.terrain.size[0] / 2 - 3.2;
      next = resolveObjectCollisions(next, state.world.objects, PLAYER_RADIUS);
      next = clampToIsland(next, islandRadius);
    }

    bodyRef.current?.setNextKinematicTranslation({ x: next[0], y: next[1], z: next[2] });
    state.setPlayerPosition(next);
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={spawnPosition}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.48, PLAYER_RADIUS]} position={[0, 0.45, 0]} />
      <Player visible={visible} yaw={playerYaw} />
    </RigidBody>
  );
}
