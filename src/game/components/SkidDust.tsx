import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

type Particle = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
};

type SkidDustProps = {
  vehicleId: string;
  getRuntimePosition: () => [number, number, number] | null;
  getRuntimeData: () => { velocity: number; rotationY: number; steering: number } | null;
};

const POOL_SIZE = 60;
const SPEED_THRESHOLD = 3.5;
const STEER_THRESHOLD = 0.35;

const dustMaterial = new THREE.PointsMaterial({
  color: "#C8B89A",
  size: 0.28,
  sizeAttenuation: true,
  transparent: true,
  depthWrite: false,
  opacity: 0.55,
});

export function SkidDust({ getRuntimePosition, getRuntimeData }: SkidDustProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useRef<Particle[]>([]);
  const spawnAccum = useRef(0);

  const posArray = useMemo(() => new Float32Array(POOL_SIZE * 3), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    return geo;
  }, [posArray]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.033);
    const runtimeData = getRuntimeData();
    const runtimePos = getRuntimePosition();

    if (!pointsRef.current) return;

    const absSpeed = runtimeData ? Math.abs(runtimeData.velocity) : 0;
    const absSteer = runtimeData ? Math.abs(runtimeData.steering) : 0;
    const shouldEmit = runtimeData && runtimePos &&
      (absSpeed > SPEED_THRESHOLD || (absSpeed > 1.5 && absSteer > STEER_THRESHOLD));

    if (shouldEmit && runtimePos && runtimeData) {
      spawnAccum.current += delta * absSpeed * 2.2;
      const toSpawn = Math.floor(spawnAccum.current);
      spawnAccum.current -= toSpawn;

      for (let i = 0; i < Math.min(toSpawn, 4); i++) {
        if (particles.current.length >= POOL_SIZE) break;
        const spread = 0.6;
        particles.current.push({
          pos: new THREE.Vector3(
            runtimePos[0] + (Math.random() - 0.5) * spread,
            runtimePos[1] + 0.1,
            runtimePos[2] + (Math.random() - 0.5) * spread,
          ),
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.8,
            0.35 + Math.random() * 0.55,
            (Math.random() - 0.5) * 0.8,
          ),
          life: 0,
          maxLife: 0.55 + Math.random() * 0.35,
        });
      }
    }

    // Update particles
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    let writeIdx = 0;

    particles.current = particles.current.filter((p) => {
      p.life += delta;
      if (p.life >= p.maxLife) return false;
      p.pos.addScaledVector(p.vel, delta);
      p.vel.y -= 1.8 * delta;
      if (writeIdx < POOL_SIZE) {
        attr.setXYZ(writeIdx, p.pos.x, p.pos.y, p.pos.z);
        writeIdx++;
      }
      return true;
    });

    // Zero out unused slots
    for (let i = writeIdx; i < POOL_SIZE; i++) {
      attr.setXYZ(i, 0, -999, 0);
    }

    attr.needsUpdate = true;

    // Adjust opacity based on activity
    dustMaterial.opacity = absSpeed > SPEED_THRESHOLD ? 0.55 : 0.35;
  });

  return <points ref={pointsRef} geometry={geometry} material={dustMaterial} />;
}
