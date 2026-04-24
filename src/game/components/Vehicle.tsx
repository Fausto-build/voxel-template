import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, MeshBasicMaterial } from "three";
import { InputManager } from "../core/InputManager";
import { PLAYER_RADIUS } from "../core/constants";
import { useGameStore } from "../core/gameStore";
import type { VehicleConfig } from "../types/world.types";
import { gameConfig } from "../utils/configLoader";
import { clamp, clampToIsland, resolveObjectCollisions } from "../utils/math";
import { approach, springDamp } from "../utils/spring";
import { useOutline } from "../render/OutlineContext";

const vehicleOutlineMat = new MeshBasicMaterial({ color: "#111111", side: BackSide });

type VehicleProps = {
  vehicle: VehicleConfig;
};

type WheelSpec = {
  position: [number, number, number];
  steers: boolean;
  side: -1 | 1;
};

const WHEELS: WheelSpec[] = [
  { position: [-1.16, 0.36, -1.08], steers: true, side: -1 },
  { position: [1.16, 0.36, -1.08], steers: true, side: 1 },
  { position: [-1.16, 0.36, 1.1], steers: false, side: -1 },
  { position: [1.16, 0.36, 1.1], steers: false, side: 1 },
];

export function Vehicle({ vehicle }: VehicleProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const runtime = useGameStore((state) => state.vehicleRuntime[vehicle.id]);
  const isDriving = useGameStore(
    (state) => state.playerMode === "driving" && state.currentVehicleId === vehicle.id,
  );
  const world = useGameStore((state) => state.world);
  const color = vehicle.color ?? "#FF4D4D";
  const outline = useOutline();
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

    if (state.paused || !activeRuntime || state.cameraMode === "free") {
      return;
    }

    const delta = Math.min(rawDelta, 0.033);
    const axes = InputManager.getMoveAxes();
    const acceleration = vehicle.acceleration ?? gameConfig.vehicle?.acceleration ?? 18;
    const brakePower = vehicle.brakePower ?? gameConfig.vehicle?.brakePower ?? 26;
    const reverseSpeed =
      vehicle.reverseSpeed ?? vehicle.speed * (gameConfig.vehicle?.reverseSpeedRatio ?? 0.45);
    const steeringSmoothing =
      vehicle.steeringSmoothing ?? gameConfig.vehicle?.steeringSmoothing ?? 14;
    const handbrakeDrift = vehicle.handbrakeDrift ?? gameConfig.vehicle?.handbrakeDrift ?? 0.42;
    const handbrakeActive = InputManager.isDown("Space") || activeRuntime.exitRequested;
    let velocity = activeRuntime.velocity;

    if (handbrakeActive) {
      velocity = approach(velocity, 0, brakePower * delta);
    } else if (axes.forward > 0) {
      velocity = approach(velocity, vehicle.speed, acceleration * delta);
    } else if (axes.forward < 0) {
      velocity = approach(velocity, -reverseSpeed, acceleration * 0.82 * delta);
    } else {
      velocity = approach(velocity, 0, brakePower * 0.22 * delta);
    }

    if (Math.abs(velocity) < 0.02) {
      velocity = 0;
    }

    const turnInput = axes.right;
    const speedRatio = clamp(Math.abs(velocity) / Math.max(vehicle.speed, 0.001), 0, 1);
    const steering = springDamp(
      activeRuntime.steering,
      turnInput * (1 - speedRatio * 0.45),
      steeringSmoothing,
      delta,
    );
    const isMoving = Math.abs(velocity) > 0.05;
    const turnDirection = velocity >= 0 ? 1 : -1;
    const rotationDelta = isMoving
      ? steering * vehicle.turnSpeed * delta * turnDirection
      : 0;
    const rotationY = activeRuntime.rotationY - rotationDelta;
    const forwardX = -Math.sin(rotationY);
    const forwardZ = -Math.cos(rotationY);
    const rightX = Math.cos(rotationY);
    const rightZ = -Math.sin(rotationY);
    const drift =
      handbrakeActive && Math.abs(velocity) > 2
        ? steering * Math.abs(velocity) * handbrakeDrift * delta
        : 0;

    let position: [number, number, number] = [
      activeRuntime.position[0] + forwardX * velocity * delta + rightX * drift,
      vehicle.position[1],
      activeRuntime.position[2] + forwardZ * velocity * delta + rightZ * drift,
    ];

    position = resolveObjectCollisions(position, world.objects, PLAYER_RADIUS + 0.65);
    position = clampToIsland(position, islandRadius);

    state.updateVehicleRuntime(vehicle.id, {
      position,
      rotationY,
      velocity,
      steering,
      wheelSpin: activeRuntime.wheelSpin + velocity * delta * 3.2,
      exitRequested: activeRuntime.exitRequested && Math.abs(velocity) > 0.8,
    });

    if (activeRuntime.exitRequested && Math.abs(velocity) <= 0.8) {
      state.exitVehicle();
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
      <group scale={vehicle.scale ?? [1, 1, 1]}>
        <CarPrimitive
          color={color}
          steering={runtime.steering}
          wheelSpin={runtime.wheelSpin}
          wheelVisuals={vehicle.wheelVisuals ?? true}
          outline={outline}
        />
        <CuboidCollider args={[1.15, 0.52, 1.75]} position={[0, 0.55, 0]} />
      </group>
    </RigidBody>
  );
}

function CarPrimitive({
  color,
  steering,
  wheelSpin,
  wheelVisuals,
  outline,
}: {
  color: string;
  steering: number;
  wheelSpin: number;
  wheelVisuals: boolean;
  outline: boolean;
}) {
  const steeringAngle = steering * -0.55;
  const tireSpin = wheelVisuals ? wheelSpin : 0;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.38, 0.05]}>
        <boxGeometry args={[2.16, 0.34, 3.28]} />
        <meshStandardMaterial color="#171C22" roughness={0.8} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.72, -0.05]}>
        <boxGeometry args={[2.18, 0.72, 3.12]} />
        <meshStandardMaterial color={color} roughness={0.52} metalness={0.06} flatShading />
      </mesh>
      {outline && (
        <mesh position={[0, 0.72, -0.05]} scale={[1.06, 1.07, 1.05]} material={vehicleOutlineMat}>
          <boxGeometry args={[2.18, 0.72, 3.12]} />
        </mesh>
      )}
      <mesh castShadow position={[0, 0.97, -1.08]}>
        <boxGeometry args={[1.82, 0.18, 0.86]} />
        <meshStandardMaterial color={color} roughness={0.46} metalness={0.08} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.92, 1.1]}>
        <boxGeometry args={[1.86, 0.2, 0.82]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.07} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.22, 0.05]}>
        <boxGeometry args={[1.46, 0.58, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.48} metalness={0.06} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.58, 0.05]}>
        <boxGeometry args={[1.32, 0.16, 1.04]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.25, -0.61]}>
        <boxGeometry args={[1.08, 0.3, 0.04]} />
        <meshStandardMaterial color="#83D8F6" roughness={0.16} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 1.25, 0.72]}>
        <boxGeometry args={[1.04, 0.28, 0.04]} />
        <meshStandardMaterial color="#5EA9CA" roughness={0.18} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[-0.76, 1.24, 0.06]}>
        <boxGeometry args={[0.04, 0.3, 0.74]} />
        <meshStandardMaterial color="#6EC6E6" roughness={0.16} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[0.76, 1.24, 0.06]}>
        <boxGeometry args={[0.04, 0.3, 0.74]} />
        <meshStandardMaterial color="#6EC6E6" roughness={0.16} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[0, 0.53, -1.68]}>
        <boxGeometry args={[1.84, 0.18, 0.18]} />
        <meshStandardMaterial color="#202630" roughness={0.65} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.72, -1.78]}>
        <boxGeometry args={[0.72, 0.24, 0.06]} />
        <meshStandardMaterial color="#0D1118" roughness={0.72} flatShading />
      </mesh>
      <mesh castShadow position={[-0.68, 0.78, -1.81]}>
        <boxGeometry args={[0.32, 0.18, 0.07]} />
        <meshStandardMaterial color="#FFE46A" emissive="#FFE46A" emissiveIntensity={0.2} />
      </mesh>
      <mesh castShadow position={[0.68, 0.78, -1.81]}>
        <boxGeometry args={[0.32, 0.18, 0.07]} />
        <meshStandardMaterial color="#FFE46A" emissive="#FFE46A" emissiveIntensity={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.51, 1.7]}>
        <boxGeometry args={[1.82, 0.18, 0.18]} />
        <meshStandardMaterial color="#202630" roughness={0.65} flatShading />
      </mesh>
      <mesh castShadow position={[-0.76, 0.76, 1.82]}>
        <boxGeometry args={[0.28, 0.2, 0.06]} />
        <meshStandardMaterial color="#F05258" emissive="#F05258" emissiveIntensity={0.16} />
      </mesh>
      <mesh castShadow position={[0.76, 0.76, 1.82]}>
        <boxGeometry args={[0.28, 0.2, 0.06]} />
        <meshStandardMaterial color="#F05258" emissive="#F05258" emissiveIntensity={0.16} />
      </mesh>
      <mesh castShadow position={[0, 0.37, -1.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 2.1, 8]} />
        <meshStandardMaterial color="#252B35" roughness={0.72} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.37, 1.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 2.1, 8]} />
        <meshStandardMaterial color="#252B35" roughness={0.72} flatShading />
      </mesh>
      {WHEELS.map((wheel) => (
        <Wheel
          key={wheel.position.join(",")}
          position={wheel.position}
          side={wheel.side}
          steeringAngle={wheel.steers ? steeringAngle : 0}
          spin={tireSpin}
        />
      ))}
    </group>
  );
}

function Wheel({
  position,
  side,
  steeringAngle,
  spin,
}: {
  position: [number, number, number];
  side: -1 | 1;
  steeringAngle: number;
  spin: number;
}) {
  return (
    <group position={position} rotation={[0, steeringAngle, 0]}>
      <group rotation={[spin, 0, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.32, 20]} />
          <meshStandardMaterial color="#111820" roughness={0.86} metalness={0.02} flatShading />
        </mesh>
        <mesh castShadow position={[side * 0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.21, 0.21, 0.05, 12]} />
          <meshStandardMaterial color="#D7E1EC" roughness={0.38} metalness={0.22} flatShading />
        </mesh>
        <mesh castShadow position={[side * 0.21, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 10]} />
          <meshStandardMaterial color="#8A96A3" roughness={0.35} metalness={0.28} flatShading />
        </mesh>
      </group>
    </group>
  );
}
