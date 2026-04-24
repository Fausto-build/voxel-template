import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { InputManager } from "../core/InputManager";
import { PLAYER_RADIUS } from "../core/constants";
import { useGameStore } from "../core/gameStore";
import type { VehicleConfig } from "../types/world.types";
import { clampToIsland, resolveObjectCollisions } from "../utils/math";

type VehicleProps = {
  vehicle: VehicleConfig;
};

export function Vehicle({ vehicle }: VehicleProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const runtime = useGameStore((state) => state.vehicleRuntime[vehicle.id]);
  const isDriving = useGameStore(
    (state) => state.playerMode === "driving" && state.currentVehicleId === vehicle.id,
  );
  const world = useGameStore((state) => state.world);
  const color = vehicle.color ?? "#FF4D4D";
  const islandRadius = useMemo(() => world.terrain.size[0] / 2 - 5, [world.terrain.size]);

  useFrame((_, rawDelta) => {
    const currentRuntime = useGameStore.getState().vehicleRuntime[vehicle.id];

    if (currentRuntime) {
      bodyRef.current?.setNextKinematicTranslation({
        x: currentRuntime.position[0],
        y: currentRuntime.position[1],
        z: currentRuntime.position[2],
      });
      bodyRef.current?.setNextKinematicRotation({
        x: 0,
        y: Math.sin(currentRuntime.rotationY / 2),
        z: 0,
        w: Math.cos(currentRuntime.rotationY / 2),
      });
    }

    if (!isDriving) {
      return;
    }

    const state = useGameStore.getState();
    const activeRuntime = state.vehicleRuntime[vehicle.id];

    if (state.paused || !activeRuntime) {
      return;
    }

    const delta = Math.min(rawDelta, 0.033);
    const axes = InputManager.getMoveAxes();
    const desiredVelocity = axes.forward * vehicle.speed;
    const velocity = activeRuntime.velocity + (desiredVelocity - activeRuntime.velocity) * 0.08;
    const turnInput = axes.right;
    const turnDirection = Math.abs(velocity) > 0.2 ? Math.sign(velocity) : 1;
    const rotationY = activeRuntime.rotationY - turnInput * vehicle.turnSpeed * delta * turnDirection;
    const forwardX = -Math.sin(rotationY);
    const forwardZ = -Math.cos(rotationY);

    let position: [number, number, number] = [
      activeRuntime.position[0] + forwardX * velocity * delta,
      vehicle.position[1],
      activeRuntime.position[2] + forwardZ * velocity * delta,
    ];

    position = resolveObjectCollisions(position, world.objects, PLAYER_RADIUS + 0.65);
    position = clampToIsland(position, islandRadius);

    state.updateVehicleRuntime(vehicle.id, {
      position,
      rotationY,
      velocity: velocity * 0.992,
    });
  });

  if (!runtime) {
    return null;
  }

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={runtime.position}
      rotation={[0, runtime.rotationY, 0]}
    >
      <group scale={vehicle.scale ?? [1, 1, 1]}>
        <CarPrimitive color={color} />
        <CuboidCollider args={[1.15, 0.52, 1.75]} position={[0, 0.55, 0]} />
      </group>
    </RigidBody>
  );
}

function CarPrimitive({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[2.25, 0.62, 3.05]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.06, -0.28]}>
        <boxGeometry args={[1.28, 0.72, 1.18]} />
        <meshStandardMaterial color="#FFE27A" roughness={0.45} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.74, -1.72]}>
        <boxGeometry args={[1.1, 0.26, 0.22]} />
        <meshStandardMaterial color="#FFD95C" emissive="#FFD95C" emissiveIntensity={0.18} />
      </mesh>
      {[[-1.16, 0.26, -0.95], [1.16, 0.26, -0.95], [-1.16, 0.26, 1.05], [1.16, 0.26, 1.05]].map(
        (position) => (
          <mesh
            key={position.join(",")}
            castShadow
            position={position as [number, number, number]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.34, 0.34, 0.26, 12]} />
            <meshStandardMaterial color="#28313C" flatShading />
          </mesh>
        ),
      )}
      {[[-1.18, 0.26, -0.95], [1.18, 0.26, -0.95], [-1.18, 0.26, 1.05], [1.18, 0.26, 1.05]].map(
        (position) => (
          <mesh key={`hub-${position.join(",")}`} castShadow position={position as [number, number, number]}>
            <sphereGeometry args={[0.16, 8, 6]} />
            <meshStandardMaterial color="#E7EEF9" flatShading />
          </mesh>
        ),
      )}
    </group>
  );
}
