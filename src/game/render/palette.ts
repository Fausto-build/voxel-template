import { MeshStandardMaterial, Color } from "three";

type PaletteId =
  | "grass"
  | "sand"
  | "rock"
  | "water"
  | "wood"
  | "metal"
  | "foliage"
  | "road"
  | "sidewalk"
  | "skin"
  | "dark";

type ThemePalette = Record<PaletteId, MeshStandardMaterial>;

const cache = new Map<string, ThemePalette>();

function makeMat(params: ConstructorParameters<typeof MeshStandardMaterial>[0]): MeshStandardMaterial {
  return new MeshStandardMaterial(params);
}

function buildPalette(
  grassColor: string,
  sandColor: string,
  waterColor: string,
): ThemePalette {
  return {
    grass: makeMat({ color: new Color(grassColor), roughness: 0.88, flatShading: true }),
    sand: makeMat({ color: new Color(sandColor), roughness: 0.92, flatShading: true }),
    rock: makeMat({ color: new Color("#8D93A5"), roughness: 0.82, flatShading: true }),
    water: makeMat({ color: new Color(waterColor), roughness: 0.25, transparent: true, opacity: 0.62, depthWrite: false }),
    wood: makeMat({ color: new Color("#8B5A33"), roughness: 0.85, flatShading: true }),
    metal: makeMat({ color: new Color("#D7E1EC"), roughness: 0.38, metalness: 0.22, flatShading: true }),
    foliage: makeMat({ color: new Color("#34A853"), roughness: 0.9, flatShading: true }),
    road: makeMat({ color: new Color("#3A3A3A"), roughness: 0.85, metalness: 0.05 }),
    sidewalk: makeMat({ color: new Color("#888888"), roughness: 0.9 }),
    skin: makeMat({ color: new Color("#FFE2B8"), roughness: 0.8, flatShading: true }),
    dark: makeMat({ color: new Color("#171C22"), roughness: 0.8, flatShading: true }),
  };
}

export function getPalette(
  themeId: string,
  grassColor: string,
  sandColor: string,
  waterColor: string,
): ThemePalette {
  const key = `${themeId}:${grassColor}:${sandColor}:${waterColor}`;

  if (!cache.has(key)) {
    cache.set(key, buildPalette(grassColor, sandColor, waterColor));
  }

  return cache.get(key)!;
}

export function disposePalette(key: string) {
  const palette = cache.get(key);

  if (palette) {
    Object.values(palette).forEach((mat) => mat.dispose());
    cache.delete(key);
  }
}
