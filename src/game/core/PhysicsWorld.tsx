import { Physics } from "@react-three/rapier";
import type { PropsWithChildren } from "react";

export function PhysicsWorld({ children }: PropsWithChildren) {
  return (
    <Physics gravity={[0, -24, 0]} timeStep="vary" colliders={false}>
      {children}
    </Physics>
  );
}
