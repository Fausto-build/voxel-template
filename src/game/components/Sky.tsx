import { Sky as DreiSky } from "@react-three/drei";

type SkyProps = {
  color: string;
};

export function Sky({ color }: SkyProps) {
  return (
    <>
      <color attach="background" args={[color]} />
      <DreiSky
        distance={450000}
        sunPosition={[70, 30, 60]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={2.8}
        rayleigh={0.8}
      />
    </>
  );
}
