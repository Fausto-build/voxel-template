import { ObjectRenderer } from "../components/ObjectRenderer";
import type { WorldObjectConfig } from "../types/world.types";

type ObjectFactoryProps = {
  objects: WorldObjectConfig[];
};

export function ObjectFactory({ objects }: ObjectFactoryProps) {
  return (
    <>
      {objects.map((object) => (
        <ObjectRenderer key={object.id} object={object} />
      ))}
    </>
  );
}
