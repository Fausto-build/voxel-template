import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { InputManager } from "./InputManager";
import { useGameStore } from "./gameStore";
import { MISSION_COMPLETE_MESSAGE_TIMEOUT } from "./constants";

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

  useFrame(() => {
    const mouseDelta = InputManager.consumeMouseDelta();
    const state = useGameStore.getState();

    if (mouseDelta.x || mouseDelta.y) {
      state.rotateCamera(mouseDelta.x, mouseDelta.y);
    }

    if (InputManager.consumePressed("Escape")) {
      state.togglePaused();
    }

    if (InputManager.consumePressed("KeyE")) {
      state.interact();
    }
  });

  return null;
}
