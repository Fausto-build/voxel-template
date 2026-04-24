import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gameConfig } from "../utils/configLoader";
import { useGameStore } from "./gameStore";

const cameraTarget = new THREE.Vector3();
const desiredPosition = new THREE.Vector3();
const lookAtPosition = new THREE.Vector3();

export function CameraController() {
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    const state = useGameStore.getState();
    const activeVehicle = state.currentVehicleId
      ? state.vehicleRuntime[state.currentVehicleId]
      : null;
    const target = activeVehicle?.position ?? state.playerPosition;
    const distance = gameConfig.camera.distance;
    const height = gameConfig.camera.height + state.cameraPitch * 3;
    const yaw = state.cameraYaw;

    cameraTarget.set(target[0], target[1], target[2]);
    desiredPosition.set(
      target[0] + Math.sin(yaw) * distance,
      target[1] + height,
      target[2] + Math.cos(yaw) * distance,
    );
    camera.position.lerp(desiredPosition, gameConfig.camera.smoothing);
    lookAtPosition.set(cameraTarget.x, cameraTarget.y + 1.2, cameraTarget.z);
    camera.lookAt(lookAtPosition);
  });

  return null;
}
