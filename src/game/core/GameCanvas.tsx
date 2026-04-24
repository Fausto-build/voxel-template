import { useRef } from "react";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { CameraController } from "./CameraController";
import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { PhysicsWorld } from "./PhysicsWorld";
import { PlayerController } from "./PlayerController";
import { WorldLoader } from "../systems/WorldLoader";
import { useGameStore } from "./gameStore";

function DynamicContactShadows() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const state = useGameStore.getState();
    const target = state.playerMode === "driving" && state.currentVehicleId
      ? state.vehicleRuntime[state.currentVehicleId]?.position ?? state.playerPosition
      : state.playerPosition;
    groupRef.current.position.x = target[0];
    groupRef.current.position.z = target[2];
  });

  return (
    <group ref={groupRef}>
      <ContactShadows
        opacity={0.38}
        scale={28}
        blur={1.4}
        far={12}
        position={[0, 0.02, 0]}
        frames={Infinity}
      />
    </group>
  );
}

export function GameCanvas() {
  const world = useGameStore((state) => state.world);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 14], fov: 55, near: 0.1, far: 220 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("click", () => InputManager.requestPointerLock(gl.domElement));
      }}
    >
      <Suspense fallback={null}>
        <GameLoop />
        <CameraController />
        <PhysicsWorld>
          <WorldLoader world={world} />
          <PlayerController />
        </PhysicsWorld>
        <DynamicContactShadows />
      </Suspense>
    </Canvas>
  );
}
