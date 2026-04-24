import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { InputManager } from "./InputManager";
import { useGameStore } from "./gameStore";
import { MISSION_COMPLETE_MESSAGE_TIMEOUT } from "./constants";
import { gameConfig } from "../utils/configLoader";

export function GameLoop() {
  const completionMessage = useGameStore((state) => state.completionMessage);
  const clearCompletionMessage = useGameStore((state) => state.clearCompletionMessage);

  useEffect(() => {
    InputManager.connect();
    return () => InputManager.disconnect();
  }, []);

  useEffect(() => {
    if (!completionMessage) {
      return;
    }

    const timeout = window.setTimeout(clearCompletionMessage, MISSION_COMPLETE_MESSAGE_TIMEOUT);
    return () => window.clearTimeout(timeout);
  }, [clearCompletionMessage, completionMessage]);

  useFrame((_, rawDelta) => {
    const mouseDelta = InputManager.consumeMouseDelta();
    const wheelDelta = InputManager.consumeWheelDelta();
    const state = useGameStore.getState();
    const delta = Math.min(rawDelta, 0.033);

    if (mouseDelta.x || mouseDelta.y) {
      state.rotateCamera(mouseDelta.x, mouseDelta.y);
    }

    if (wheelDelta && state.cameraMode !== "free") {
      state.setCameraDistance(state.cameraDistance + wheelDelta * (gameConfig.camera.zoomStep ?? 0.01));
    }

    if (InputManager.consumePressed("Escape")) {
      state.togglePaused();
    }

    if (
      InputManager.consumePressed("KeyC") &&
      (InputManager.isDown("ShiftLeft") || InputManager.isDown("ShiftRight"))
    ) {
      state.toggleFreeCamera();
    }

    if (InputManager.consumePressed("KeyV") && state.playerMode === "driving") {
      state.toggleVehicleCameraMode();
    }

    if (state.cameraMode === "free" && !state.paused) {
      const axes = InputManager.getMoveAxes();
      const vertical = Number(InputManager.isDown("Space")) - Number(
        InputManager.isDown("ShiftLeft") || InputManager.isDown("ShiftRight"),
      );
      const yaw = state.cameraYaw;
      const forwardX = -Math.sin(yaw);
      const forwardZ = -Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);
      const speed = gameConfig.camera.freeCameraSpeed ?? 18;

      state.moveFreeCamera([
        state.freeCameraPosition[0] + (forwardX * axes.forward + rightX * axes.right) * speed * delta,
        state.freeCameraPosition[1] + vertical * speed * delta,
        state.freeCameraPosition[2] + (forwardZ * axes.forward + rightZ * axes.right) * speed * delta,
      ]);
    }

    if (InputManager.consumePressed("KeyE") && state.cameraMode !== "free") {
      state.interact();
    }
  });

  return null;
}
