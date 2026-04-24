import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { CameraController } from "./CameraController";
import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { PhysicsWorld } from "./PhysicsWorld";
import { PlayerController } from "./PlayerController";
import { WorldLoader } from "../systems/WorldLoader";
import { useGameStore } from "./gameStore";

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
        <ContactShadows
          opacity={0.32}
          scale={92}
          blur={1.8}
          far={18}
          position={[0, 0.02, 0]}
          frames={1}
        />
      </Suspense>
    </Canvas>
  );
}
