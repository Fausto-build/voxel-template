import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BackSide, MathUtils, MeshBasicMaterial, type Group } from "three";
import type { NPCConfig } from "../types/world.types";
import { useGameStore } from "../core/gameStore";
import { gameConfig } from "../utils/configLoader";
import { distance2D, normalizeAngle } from "../utils/math";
import { springDampAngle } from "../utils/spring";
import { useOutline } from "../render/OutlineContext";

const npcOutlineMat = new MeshBasicMaterial({ color: "#111111", side: BackSide });

type NPCProps = {
  npc: NPCConfig;
};

export function NPC({ npc }: NPCProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const robeGroupRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const animCycle = useRef(0);
  const wanderTarget = useRef<[number, number, number] | null>(null);
  const missionState = useGameStore((state) =>
    npc.missionId ? state.missionStates[npc.missionId] : null,
  );
  const runtime = useGameStore((state) => state.npcRuntime[npc.id]);
  const outline = useOutline();
  const robeColor = npc.color ?? "#6D5DF6";
  const markerColor = missionState === "ready_to_complete" ? "#FFD84D" : "#FFFFFF";

  useFrame((_, rawDelta) => {
    const state = useGameStore.getState();
    const current = state.npcRuntime[npc.id];

    if (!current) {
      return;
    }

    let position: [number, number, number] = [...current.position];
    let rotationY = current.rotationY;
    let pathIndex = current.pathIndex;
    let pathDirection = current.pathDirection;
    const behavior = npc.behavior ?? "idle";
    const delta = Math.min(rawDelta, 0.033);
    const moveSpeed = npc.moveSpeed ?? gameConfig.npc?.moveSpeed ?? 2.2;
    let target: [number, number, number] | null = null;

    if (!state.paused && behavior === "followPlayer") {
      const followDistance = npc.followDistance ?? gameConfig.npc?.followDistance ?? 4;
      if (distance2D(position, state.playerPosition) > followDistance) {
        target = state.playerPosition;
      }
    }

    if (!state.paused && behavior === "patrol" && npc.pathId) {
      const path = state.world.paths?.find((entry) => entry.id === npc.pathId);

      if (path?.points.length) {
        pathIndex = Math.min(pathIndex, path.points.length - 1);
        target = path.points[pathIndex];

        if (distance2D(position, target) < 0.45) {
          if (path.loop !== false) {
            pathIndex = (pathIndex + 1) % path.points.length;
          } else {
            const atEnd = pathIndex >= path.points.length - 1;
            const atStart = pathIndex <= 0;

            if (atEnd) pathDirection = -1;
            if (atStart) pathDirection = 1;
            pathIndex += pathDirection;
          }

          target = path.points[pathIndex];
        }
      }
    }

    if (!state.paused && behavior === "wander") {
      if (!wanderTarget.current || distance2D(position, wanderTarget.current) < 0.5) {
        const radius = npc.wanderRadius ?? gameConfig.npc?.wanderRadius ?? 5;
        const angle = Math.random() * Math.PI * 2;
        const distance = radius * (0.35 + Math.random() * 0.65);

        wanderTarget.current = [
          npc.position[0] + Math.cos(angle) * distance,
          npc.position[1],
          npc.position[2] + Math.sin(angle) * distance,
        ];
      }

      target = wanderTarget.current;
    }

    if (target) {
      const dx = target[0] - position[0];
      const dz = target[2] - position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 0.001) {
        const step = Math.min(moveSpeed * delta, distance);
        position = [
          position[0] + (dx / distance) * step,
          npc.position[1],
          position[2] + (dz / distance) * step,
        ];
        rotationY = springDampAngle(
          rotationY,
          normalizeAngle(Math.atan2(dx, dz)),
          12,
          delta,
        );
      }
    }

    bodyRef.current?.setNextKinematicTranslation({
      x: position[0],
      y: position[1],
      z: position[2],
    });
    bodyRef.current?.setNextKinematicRotation({
      x: 0,
      y: Math.sin(rotationY / 2),
      z: 0,
      w: Math.cos(rotationY / 2),
    });

    if (target) {
      state.updateNPCRuntime(npc.id, {
        position,
        rotationY,
        pathIndex,
        pathDirection,
      });
    }

    // Procedural animation: idle sway + walk bob
    const isMoving = target !== null;
    const walkSpeed = isMoving ? 1 : 0;
    if (isMoving) {
      animCycle.current += delta * 8.5;
    }
    const step = Math.sin(animCycle.current);
    const breath = Math.sin(state.world.id ? animCycle.current * 0.35 : animCycle.current * 0.35);
    const bobAmount = isMoving ? Math.abs(step) * 0.055 : breath * 0.012;

    if (robeGroupRef.current) {
      robeGroupRef.current.position.y = MathUtils.damp(robeGroupRef.current.position.y, bobAmount, 12, delta);
      robeGroupRef.current.rotation.z = MathUtils.damp(robeGroupRef.current.rotation.z, step * 0.04 * walkSpeed, 8, delta);
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = MathUtils.damp(leftArmRef.current.rotation.x, step * 0.38 * walkSpeed, 10, delta);
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = MathUtils.damp(rightArmRef.current.rotation.x, -step * 0.38 * walkSpeed, 10, delta);
    }
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
      <group ref={robeGroupRef}>
        <mesh castShadow position={[0, 0.75, 0]}>
          <capsuleGeometry args={[0.42, 0.7, 5, 8]} />
          <meshStandardMaterial color={robeColor} flatShading />
        </mesh>
        {outline && (
          <mesh position={[0, 0.75, 0]} scale={[1.09, 1.07, 1.09]} material={npcOutlineMat}>
            <capsuleGeometry args={[0.42, 0.7, 5, 8]} />
          </mesh>
        )}
        <mesh castShadow position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.38, 12, 8]} />
          <meshStandardMaterial color="#F2C89F" flatShading />
        </mesh>
        <mesh castShadow position={[0, 2.02, -0.03]}>
          <coneGeometry args={[0.55, 0.95, 8]} />
          <meshStandardMaterial color="#3F307E" flatShading />
        </mesh>
        {/* Left arm */}
        <group ref={leftArmRef} position={[-0.48, 1.05, 0.04]}>
          <mesh castShadow rotation={[0, 0, -0.42]}>
            <cylinderGeometry args={[0.04, 0.04, 1.35, 6]} />
            <meshStandardMaterial color="#7A4F32" flatShading />
          </mesh>
          <mesh castShadow position={[-0.24, 0.62, 0.07]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#8DF7FF" emissive="#54C8E8" emissiveIntensity={0.4} />
          </mesh>
        </group>
        {/* Right arm (mirrored, static placeholder) */}
        <group ref={rightArmRef} position={[0.48, 1.05, 0.04]}>
          <mesh castShadow rotation={[0, 0, 0.42]}>
            <cylinderGeometry args={[0.04, 0.04, 0.85, 6]} />
            <meshStandardMaterial color="#7A4F32" flatShading />
          </mesh>
        </group>
        <mesh position={[0, 2.72, 0]}>
          <sphereGeometry args={[0.13, 8, 6]} />
          <meshStandardMaterial color={markerColor} emissive={markerColor} emissiveIntensity={0.45} />
        </mesh>
        <CuboidCollider args={[0.55, 1.05, 0.55]} position={[0, 1, 0]} />
        <Html center position={[0, 2.95, 0]} distanceFactor={16} transform occlude>
          <div className="world-label">{npc.name}</div>
        </Html>
      </group>
    </RigidBody>
  );
}
