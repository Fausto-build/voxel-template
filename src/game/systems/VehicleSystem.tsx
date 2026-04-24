import { Vehicle } from "../components/Vehicle";
import type { VehicleConfig } from "../types/world.types";

type VehicleSystemProps = {
  vehicles: VehicleConfig[];
};

export function VehicleSystem({ vehicles }: VehicleSystemProps) {
  return (
    <>
      {vehicles.map((vehicle) => (
        <Vehicle key={vehicle.id} vehicle={vehicle} />
      ))}
    </>
  );
}
