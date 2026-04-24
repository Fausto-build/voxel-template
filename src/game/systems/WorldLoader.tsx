import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CollectibleSystem } from "./CollectibleSystem";
import { InteractionSystem } from "./InteractionSystem";
import { MissionSystem } from "./MissionSystem";
import { NPCSystem } from "./NPCSystem";
import { ObjectFactory } from "./ObjectFactory";
import { VehicleSystem } from "./VehicleSystem";
import { Sky } from "../components/Sky";
import { Terrain, terrainHasWater } from "../components/Terrain";
import { Water } from "../components/Water";
import { PropScatter } from "../components/PropScatter";
import type { WorldConfig } from "../types/world.types";
import { getTheme } from "../utils/configLoader";

type WorldLoaderProps = {
  world: WorldConfig;
};

function ToneMappingExposure({ exposure }: { exposure: number }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);

  return null;
}

export function WorldLoader({ world }: WorldLoaderProps) {
  const theme = getTheme(world.theme);
  const shadowExtent = Math.max(world.terrain.size[0], world.terrain.size[1]) * 0.7;
  const fogNear = theme.fogNear ?? 42;
  const fogFar = theme.fogFar ?? 135;
  const sunPosition = theme.sunPosition ?? [35, 42, 28];

  return (
    <>
      <ToneMappingExposure exposure={theme.toneMappingExposure ?? 1.1} />
      <Sky color={theme.skyColor} themeId={world.theme} />
      <fog attach="fog" args={[theme.fogColor, fogNear, fogFar]} />
      <ambientLight intensity={theme.lighting.ambientIntensity} />
      <directionalLight
        castShadow={theme.style.shadows}
        position={sunPosition}
        intensity={theme.lighting.sunIntensity}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-bias={-0.0005}
      />
      <hemisphereLight args={[theme.skyColor, theme.groundColor, 0.42]} />
      <Terrain terrain={world.terrain} themeId={world.theme} paths={world.paths} />
      {terrainHasWater(world.terrain) && <Water color={world.terrain.waterColor ?? theme.waterColor} />}
      <ObjectFactory objects={world.objects} />
      {world.props && world.props.length > 0 && <PropScatter props={world.props} />}
      <CollectibleSystem collectibles={world.collectibles} />
      <NPCSystem npcs={world.npcs} />
      <VehicleSystem vehicles={world.vehicles} />
      <MissionSystem />
      <InteractionSystem />
    </>
  );
}
