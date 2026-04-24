import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { WATER_LEVEL } from "../core/constants";

type WaterProps = {
  color: string;
};

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  // Two Gerstner waves
  vec3 gerstner(vec3 pos, vec2 dir, float amplitude, float wavelength, float speed) {
    float k = 6.28318 / wavelength;
    float phase = dot(dir, pos.xz) * k - speed * uTime;
    float c = cos(phase);
    float s = sin(phase);
    return vec3(
      dir.x * amplitude * c,
      amplitude * s,
      dir.y * amplitude * c
    );
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    vec3 w1 = gerstner(pos, normalize(vec2(1.0, 0.62)),  uAmplitude,        18.0, 1.1);
    vec3 w2 = gerstner(pos, normalize(vec2(-0.45, 1.0)), uAmplitude * 0.55, 11.0, 1.6);

    pos.y += w1.y + w2.y;

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vNormal   = normalize(vec3(-(w1.x + w2.x), 1.0, -(w1.z + w2.z)));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3  uShallowColor;
  uniform vec3  uDeepColor;
  uniform float uFresnelPower;
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  void main() {
    vec3 viewDir  = normalize(cameraPosition - vWorldPos);
    float cosTheta = max(0.0, dot(normalize(vNormal), viewDir));
    float fresnel  = pow(1.0 - cosTheta, uFresnelPower);

    // Specular highlight — simple Blinn-Phong style
    vec3 lightDir  = normalize(vec3(0.6, 1.0, 0.4));
    vec3 halfDir   = normalize(lightDir + viewDir);
    float spec     = pow(max(0.0, dot(normalize(vNormal), halfDir)), 64.0);

    // Animated shimmer across surface
    float shimmer  = sin(vUv.x * 42.0 + uTime * 2.3) * sin(vUv.y * 38.0 + uTime * 1.8);
    shimmer = clamp(shimmer * 0.12, 0.0, 0.12);

    vec3 waterColor = mix(uShallowColor, uDeepColor, fresnel);
    waterColor += vec3(spec * 0.55 + shimmer);

    gl_FragColor = vec4(waterColor, uOpacity);
  }
`;

export function Water({ color }: WaterProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const shallowColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.lerp(new THREE.Color("#ffffff"), 0.35);
    return c;
  }, [color]);

  const deepColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.lerp(new THREE.Color("#001830"), 0.45);
    return c;
  }, [color]);

  const uniforms = useMemo(
    () => ({
      uTime:         { value: 0 },
      uAmplitude:    { value: 0.07 },
      uShallowColor: { value: shallowColor },
      uDeepColor:    { value: deepColor },
      uFresnelPower: { value: 2.8 },
      uOpacity:      { value: 0.72 },
    }),
    [shallowColor, deepColor],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} position={[0, WATER_LEVEL, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[192, 192, 48, 48]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
