import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gameConfig } from "../utils/configLoader";
import { clamp } from "../utils/math";
import { springDampVec3 } from "../utils/spring";
import { useGameStore } from "./gameStore";

const cameraTarget = new THREE.Vector3();
const desiredPosition = new THREE.Vector3();
const lookAtPosition = new THREE.Vector3();
const springVelocity = new THREE.Vector3();
const springPosition = new THREE.Vector3();
const rayOrigin = new THREE.Vector3();
const rayDir = new THREE.Vector3();

// Occlusion raycast: pull camera in if geometry blocks the shot
const raycaster = new THREE.Raycaster();
raycaster.near = 0.1;

const SPRING_SMOOTHING = 14; // natural frequency — higher = snappier

export function CameraController() {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  // Initialise spring position to camera's current position once
  let initialized = false;

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const activeVehicle = state.currentVehicleId
      ? state.vehicleRuntime[state.currentVehicleId]
      : null;
    const clamped = Math.min(delta, 0.05);

    if (!initialized) {
      springPosition.copy(camera.position);
      initialized = true;
    }

    // ── Free camera ─────────────────────────────────────────────────────────
    if (state.cameraMode === "free") {
      desiredPosition.set(
        state.freeCameraPosition[0],
        state.freeCameraPosition[1],
        state.freeCameraPosition[2],
      );
      springDampVec3(springPosition, springVelocity, desiredPosition, 10, clamped);
      camera.position.copy(springPosition);
      lookAtPosition.set(
        camera.position.x - Math.sin(state.cameraYaw) * Math.cos(state.cameraPitch),
        camera.position.y + Math.sin(state.cameraPitch),
        camera.position.z - Math.cos(state.cameraYaw) * Math.cos(state.cameraPitch),
      );
      camera.lookAt(lookAtPosition);
      return;
    }

    // ── Vehicle first-person ─────────────────────────────────────────────────
    if (state.cameraMode === "vehicle_first_person" && activeVehicle) {
      const forwardX = -Math.sin(activeVehicle.rotationY);
      const forwardZ = -Math.cos(activeVehicle.rotationY);
      const height = gameConfig.camera.vehicleFirstPersonHeight ?? 1.45;
      const offset = gameConfig.camera.vehicleFirstPersonForwardOffset ?? 1.15;

      desiredPosition.set(
        activeVehicle.position[0] + forwardX * offset,
        activeVehicle.position[1] + height,
        activeVehicle.position[2] + forwardZ * offset,
      );
      springDampVec3(springPosition, springVelocity, desiredPosition, 18, clamped);
      camera.position.copy(springPosition);
      lookAtPosition.set(
        activeVehicle.position[0] + forwardX * 8,
        activeVehicle.position[1] + height,
        activeVehicle.position[2] + forwardZ * 8,
      );
      camera.lookAt(lookAtPosition);
      return;
    }

    // ── Third-person follow ──────────────────────────────────────────────────
    const target = activeVehicle?.position ?? state.playerPosition;
    const baseDistance = activeVehicle
      ? (gameConfig.camera.maxDistance ?? 7)
      : state.cameraDistance;
    const distance = activeVehicle ? baseDistance : state.cameraDistance;
    const baseHeight = activeVehicle
      ? (gameConfig.camera.vehicleFirstPersonHeight ?? 4)
      : gameConfig.camera.height;
    const height = baseHeight + state.cameraPitch * 3;
    const yaw = state.cameraYaw;

    cameraTarget.set(target[0], target[1], target[2]);

    desiredPosition.set(
      target[0] + Math.sin(yaw) * distance,
      target[1] + height,
      target[2] + Math.cos(yaw) * distance,
    );

    // ── Soft collision: pull camera in only if blocked, max 30% closer ────────
    rayOrigin.set(target[0], target[1] + 1.2, target[2]);
    rayDir.subVectors(desiredPosition, rayOrigin).normalize();
    raycaster.set(rayOrigin, rayDir);
    raycaster.far = desiredPosition.distanceTo(rayOrigin);

    const hits = raycaster.intersectObjects(scene.children, true).filter(
      (h) => h.object.userData.noCollision !== true && h.object.visible,
    );

    if (hits.length > 0) {
      const minAllowed = raycaster.far * 0.7; // never closer than 70% of desired
      const safeDistance = clamp(hits[0].distance - 0.3, minAllowed, raycaster.far);
      desiredPosition.copy(rayOrigin).addScaledVector(rayDir, safeDistance);
    }

    // Spring-damp toward desired position
    springDampVec3(springPosition, springVelocity, desiredPosition, SPRING_SMOOTHING, clamped);
    camera.position.copy(springPosition);

    lookAtPosition.set(cameraTarget.x, cameraTarget.y + 1.2, cameraTarget.z);
    camera.lookAt(lookAtPosition);
  });

  return null;
}
