import { Sky as DreiSky } from "@react-three/drei";

type SkyPreset = "fantasy" | "city" | "snow" | "desert" | "sandbox";

type SkyProps = {
  color: string;
  themeId?: string;
};

const SKY_PARAMS: Record<SkyPreset, {
  sunPosition: [number, number, number];
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
}> = {
  fantasy: {
    sunPosition: [70, 30, 60],
    turbidity: 2.8,
    rayleigh: 0.8,
    mieCoefficient: 0.003,
    mieDirectionalG: 0.8,
  },
  city: {
    sunPosition: [50, 18, 80],
    turbidity: 8,
    rayleigh: 0.4,
    mieCoefficient: 0.006,
    mieDirectionalG: 0.75,
  },
  snow: {
    sunPosition: [40, 20, 50],
    turbidity: 1.2,
    rayleigh: 0.35,
    mieCoefficient: 0.002,
    mieDirectionalG: 0.85,
  },
  desert: {
    sunPosition: [80, 15, 40],
    turbidity: 5,
    rayleigh: 1.2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.78,
  },
  sandbox: {
    sunPosition: [70, 30, 60],
    turbidity: 2.8,
    rayleigh: 0.8,
    mieCoefficient: 0.003,
    mieDirectionalG: 0.8,
  },
};

export function Sky({ color, themeId = "fantasy" }: SkyProps) {
  const preset = SKY_PARAMS[themeId as SkyPreset] ?? SKY_PARAMS.fantasy;

  return (
    <>
      <color attach="background" args={[color]} />
      <DreiSky
        distance={450000}
        sunPosition={preset.sunPosition}
        turbidity={preset.turbidity}
        rayleigh={preset.rayleigh}
        mieCoefficient={preset.mieCoefficient}
        mieDirectionalG={preset.mieDirectionalG}
      />
    </>
  );
}
