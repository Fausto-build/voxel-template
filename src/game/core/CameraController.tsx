import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gameConfig } from "../utils/configLoader";
import { clamp } from "../utils/math";
import { useGameStore } from "./gameStore";

const cameraTarget = new THREE.Vector3();
const desiredPosition = new THREE.Vector3();
const lookAtPosition = new THREE.Vector3();

export function CameraController() {
  const camera = useThree((state) => state.camera);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const activeVehicle = state.currentVehicleId
      ? state.vehicleRuntime[state.currentVehicleId]
      : null;
    const smoothing = 1 - Math.pow(1 - clamp(gameConfig.camera.smoothing, 0, 0.98), delta * 60);

    if (state.cameraMode === "free") {
      desiredPosition.set(
        state.freeCameraPosition[0],
        state.freeCameraPosition[1],
        state.freeCameraPosition[2],
      );
      camera.position.lerp(desiredPosition, 0.35);
      lookAtPosition.set(
        camera.position.x - Math.sin(state.cameraYaw) * Math.cos(state.cameraPitch),
        camera.position.y + Math.sin(state.cameraPitch),
        camera.position.z - Math.cos(state.cameraYaw) * Math.cos(state.cameraPitch),
      );
      camera.lookAt(lookAtPosition);
      return;
    }

    if (state.cameraMode === "vehicle_first_person" && activeVehicle) {
      const forwardX = -Math.sin(activeVehicle.rotationY);
      const forwardZ = -Math.cos(activeVehicle.rotationY);
      const height = gameConfig.camera.vehicleFirstPersonHeight ?? 1.45;
      const offset = gameConfig.camera.vehicleFirstPersonForwardOffset ?? 1.15;
      const vehicleSmoothing = gameConfig.camera.vehicleFirstPersonSmoothing ?? smoothing;

      desiredPosition.set(
        activeVehicle.position[0] + forwardX * offset,
        activeVehicle.position[1] + height,
        activeVehicle.position[2] + forwardZ * offset,
      );
      camera.position.lerp(desiredPosition, vehicleSmoothing);
      lookAtPosition.set(
        activeVehicle.position[0] + forwardX * 8,
        activeVehicle.position[1] + height,
        activeVehicle.position[2] + forwardZ * 8,
      );
      camera.lookAt(lookAtPosition);
      return;
    }

    const target = activeVehicle?.position ?? state.playerPosition;
    const distance = state.cameraDistance;
    const height = gameConfig.camera.height + state.cameraPitch * 3;
    const yaw = state.cameraYaw;

    cameraTarget.set(target[0], target[1], target[2]);
    desiredPosition.set(
      target[0] + Math.sin(yaw) * distance,
      target[1] + height,
      target[2] + Math.cos(yaw) * distance,
    );
    camera.position.lerp(desiredPosition, smoothing);
    lookAtPosition.set(cameraTarget.x, cameraTarget.y + 1.2, cameraTarget.z);
    camera.lookAt(lookAtPosition);
  });

  return null;
}
