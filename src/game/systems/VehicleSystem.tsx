import { Vehicle } from "../components/Vehicle";
import { SkidDust } from "../components/SkidDust";
import { useGameStore } from "../core/gameStore";
import type { VehicleConfig } from "../types/world.types";

type VehicleSystemProps = {
  vehicles: VehicleConfig[];
};

function VehicleWithDust({ vehicle }: { vehicle: VehicleConfig }) {
  return (
    <>
      <Vehicle vehicle={vehicle} />
      <SkidDust
        vehicleId={vehicle.id}
        getRuntimePosition={() => useGameStore.getState().vehicleRuntime[vehicle.id]?.position ?? null}
        getRuntimeData={() => {
          const r = useGameStore.getState().vehicleRuntime[vehicle.id];
          if (!r) return null;
          return { velocity: r.velocity, rotationY: r.rotationY, steering: r.steering };
        }}
      />
    </>
  );
}

export function VehicleSystem({ vehicles }: VehicleSystemProps) {
  return (
    <>
      {vehicles.map((vehicle) => (
        <VehicleWithDust key={vehicle.id} vehicle={vehicle} />
      ))}
    </>
  );
}
