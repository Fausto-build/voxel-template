type KeyCode =
  | "KeyW"
  | "KeyA"
  | "KeyS"
  | "KeyD"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Space"
  | "ShiftLeft"
  | "ShiftRight"
  | "KeyE"
  | "Escape";

type MouseDelta = {
  x: number;
  y: number;
};

class InputManagerImpl {
  private keys = new Set<string>();
  private pressed = new Set<string>();
  private mouseDelta: MouseDelta = { x: 0, y: 0 };
  private connected = false;

  connect(target: Document = document) {
    if (this.connected) {
      return;
    }

    target.addEventListener("keydown", this.handleKeyDown);
    target.addEventListener("keyup", this.handleKeyUp);
    target.addEventListener("mousemove", this.handleMouseMove);
    target.addEventListener("visibilitychange", this.clear);
    this.connected = true;
  }

  disconnect(target: Document = document) {
    if (!this.connected) {
      return;
    }

    target.removeEventListener("keydown", this.handleKeyDown);
    target.removeEventListener("keyup", this.handleKeyUp);
    target.removeEventListener("mousemove", this.handleMouseMove);
    target.removeEventListener("visibilitychange", this.clear);
    this.clear();
    this.connected = false;
  }

  requestPointerLock(element: HTMLElement) {
    if (document.pointerLockElement !== element) {
      element.requestPointerLock();
    }
  }

  isDown(code: KeyCode) {
    return this.keys.has(code);
  }

  consumePressed(code: KeyCode) {
    const wasPressed = this.pressed.has(code);
    this.pressed.delete(code);
    return wasPressed;
  }

  consumeMouseDelta(): MouseDelta {
    const delta = this.mouseDelta;
    this.mouseDelta = { x: 0, y: 0 };
    return delta;
  }

  getMoveAxes() {
    const forward =
      Number(this.isDown("KeyW") || this.isDown("ArrowUp")) -
      Number(this.isDown("KeyS") || this.isDown("ArrowDown"));
    const right =
      Number(this.isDown("KeyD") || this.isDown("ArrowRight")) -
      Number(this.isDown("KeyA") || this.isDown("ArrowLeft"));

    return { forward, right };
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const isTextInput =
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.isContentEditable;

    if (isTextInput) {
      return;
    }

    if (!this.keys.has(event.code)) {
      this.pressed.add(event.code);
    }

    this.keys.add(event.code);

    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
      event.preventDefault();
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!document.pointerLockElement) {
      return;
    }

    this.mouseDelta.x += event.movementX;
    this.mouseDelta.y += event.movementY;
  };

  private clear = () => {
    this.keys.clear();
    this.pressed.clear();
    this.mouseDelta = { x: 0, y: 0 };
  };
}

export const InputManager = new InputManagerImpl();
