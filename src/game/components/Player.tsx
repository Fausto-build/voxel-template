import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, BackSide, MeshBasicMaterial, type Group } from "three";
import type { CharacterState } from "../types/game.types";
import { useOutline } from "../render/OutlineContext";

const outlineMat = new MeshBasicMaterial({ color: "#111111", side: BackSide });

type PlayerProps = {
  visible: boolean;
  yaw: number;
  state: CharacterState;
};

type AnimationRuntime = {
  cycle: number;
  idleTime: number;
  motion: number;
  run: number;
  jump: number;
  fall: number;
  landing: number;
  previousState: CharacterState;
};

const SKIN = "#FFE2B8";
const SHIRT = "#FF8C5A";
const PANTS = "#406CC7";
const BOOTS = "#243B73";
const HAT = "#5E5AEF";
const BELT = "#6E4528";

const LEFT_ARM_REST_Z = -0.16;
const RIGHT_ARM_REST_Z = 0.16;
const LEFT_LEG_REST_Z = 0.06;
const RIGHT_LEG_REST_Z = -0.06;

function isLocomotionState(state: CharacterState) {
  return state === "walking" || state === "running";
}

function isGroundedState(state: CharacterState) {
  return state === "idle" || isLocomotionState(state);
}

function isAirborneState(state: CharacterState) {
  return state === "jumping" || state === "falling";
}

function damp(current: number, target: number, delta: number, speed = 14) {
  return MathUtils.damp(current, target, speed, delta);
}

function animateLimb(
  limb: Group | null,
  delta: number,
  rotationX: number,
  rotationZ: number,
  speed = 16,
) {
  if (!limb) {
    return;
  }

  limb.rotation.x = damp(limb.rotation.x, rotationX, delta, speed);
  limb.rotation.z = damp(limb.rotation.z, rotationZ, delta, speed);
}

export function Player({ visible, yaw, state }: PlayerProps) {
  const outline = useOutline();
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const leftForearmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const rightForearmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftBootRef = useRef<Group>(null);
  const rightBootRef = useRef<Group>(null);
  const animationRef = useRef<AnimationRuntime>({
    cycle: 0,
    idleTime: 0,
    motion: 0,
    run: 0,
    jump: 0,
    fall: 0,
    landing: 0,
    previousState: "idle",
  });

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.033);
    const animation = animationRef.current;
    const wasAirborne = isAirborneState(animation.previousState);

    if (wasAirborne && isGroundedState(state)) {
      animation.landing = 1;
    }

    animation.previousState = state;
    animation.idleTime += delta;
    animation.motion = damp(animation.motion, isLocomotionState(state) ? 1 : 0, delta, 10);
    animation.run = damp(animation.run, state === "running" ? 1 : 0, delta, 10);
    animation.jump = damp(animation.jump, state === "jumping" ? 1 : 0, delta, 12);
    animation.fall = damp(animation.fall, state === "falling" ? 1 : 0, delta, 12);
    animation.landing = damp(animation.landing, 0, delta, 9);

    if (animation.motion > 0.01) {
      animation.cycle += delta * MathUtils.lerp(6.4, 10.8, animation.run);
    }

    const step = Math.sin(animation.cycle);
    const fastStep = Math.sin(animation.cycle * 2);
    const locomotion = animation.motion;
    const airborne = Math.min(1, animation.jump + animation.fall);
    const idle = (1 - locomotion) * (1 - airborne);
    const idleBreath = Math.sin(animation.idleTime * 2.1) * idle;
    const stride = MathUtils.lerp(0.28, 0.56, animation.run) * locomotion;
    const armStride = MathUtils.lerp(0.32, 0.74, animation.run) * locomotion;
    const stepBounce = Math.abs(fastStep) * MathUtils.lerp(0.018, 0.045, animation.run) * locomotion;
    const landing = animation.landing;

    const bodyLift = idleBreath * 0.018 + stepBounce + animation.jump * 0.07 - animation.fall * 0.035 - landing * 0.055;
    const bodyLean =
      -0.045 * locomotion -
      0.075 * animation.run -
      0.12 * animation.jump +
      0.08 * animation.fall +
      0.045 * landing;
    const bodySway = step * 0.025 * locomotion;
    const bodyScaleX = 1 + landing * 0.055 - animation.jump * 0.01;
    const bodyScaleY = 1 - landing * 0.09 + animation.jump * 0.025;

    if (bodyRef.current) {
      const body = bodyRef.current;

      body.position.y = damp(body.position.y, bodyLift, delta);
      body.rotation.x = damp(body.rotation.x, bodyLean, delta);
      body.rotation.z = damp(body.rotation.z, bodySway, delta);
      body.scale.x = damp(body.scale.x, bodyScaleX, delta);
      body.scale.y = damp(body.scale.y, bodyScaleY, delta);
      body.scale.z = damp(body.scale.z, bodyScaleX, delta);
    }

    if (headRef.current) {
      const head = headRef.current;

      head.position.y = damp(head.position.y, idleBreath * 0.012 + landing * 0.02, delta);
      head.rotation.x = damp(
        head.rotation.x,
        idleBreath * 0.025 - animation.jump * 0.08 + animation.fall * 0.12,
        delta,
      );
      head.rotation.z = damp(head.rotation.z, -bodySway * 0.65, delta);
    }

    const armSwing = step * armStride;
    const idleArmSway = idleBreath * 0.035;
    const jumpArm = -0.34 * animation.jump - 0.08 * animation.fall;
    const armSpread = 0.1 * animation.jump - 0.035 * animation.fall;

    animateLimb(
      leftArmRef.current,
      delta,
      armSwing + idleArmSway + jumpArm,
      LEFT_ARM_REST_Z - armSpread,
    );
    animateLimb(
      leftForearmRef.current,
      delta,
      armSwing * 0.42 + idleArmSway - 0.18 * animation.jump + 0.08 * animation.fall,
      -0.08 - armSpread * 0.5,
    );
    animateLimb(
      rightArmRef.current,
      delta,
      -armSwing - idleArmSway + jumpArm,
      RIGHT_ARM_REST_Z + armSpread,
    );
    animateLimb(
      rightForearmRef.current,
      delta,
      -armSwing * 0.42 - idleArmSway - 0.18 * animation.jump + 0.08 * animation.fall,
      0.08 + armSpread * 0.5,
    );

    const legSwing = step * stride;
    const jumpTuck = animation.jump * 0.42;
    const fallDrop = animation.fall * 0.12;
    const footLift = MathUtils.lerp(0.035, 0.12, animation.run) * locomotion;

    animateLimb(
      leftLegRef.current,
      delta,
      -legSwing + jumpTuck - fallDrop + landing * 0.12,
      LEFT_LEG_REST_Z + step * 0.018 * locomotion,
    );
    animateLimb(
      rightLegRef.current,
      delta,
      legSwing + jumpTuck * 0.75 + fallDrop + landing * 0.1,
      RIGHT_LEG_REST_Z - step * 0.018 * locomotion,
    );

    if (leftBootRef.current) {
      leftBootRef.current.position.y = damp(
        leftBootRef.current.position.y,
        -0.35 + Math.max(0, -step) * footLift + landing * 0.035,
        delta,
        18,
      );
      leftBootRef.current.rotation.x = damp(
        leftBootRef.current.rotation.x,
        Math.max(0, step) * 0.12 * locomotion - animation.fall * 0.08,
        delta,
        18,
      );
    }

    if (rightBootRef.current) {
      rightBootRef.current.position.y = damp(
        rightBootRef.current.position.y,
        -0.35 + Math.max(0, step) * footLift + landing * 0.035,
        delta,
        18,
      );
      rightBootRef.current.rotation.x = damp(
        rightBootRef.current.rotation.x,
        Math.max(0, -step) * 0.12 * locomotion - animation.fall * 0.08,
        delta,
        18,
      );
    }
  });

  return (
    <group visible={visible} rotation={[0, yaw, 0]}>
      <group ref={bodyRef}>
        <mesh castShadow position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.3, 0.36, 0.74, 8]} />
          <meshStandardMaterial color={SHIRT} flatShading />
        </mesh>
        {outline && (
          <mesh position={[0, 0.72, 0]} scale={[1.08, 1.06, 1.08]} material={outlineMat}>
            <cylinderGeometry args={[0.3, 0.36, 0.74, 8]} />
          </mesh>
        )}
        <mesh castShadow position={[0, 0.33, -0.01]}>
          <boxGeometry args={[0.68, 0.08, 0.4]} />
          <meshStandardMaterial color={BELT} flatShading />
        </mesh>

        <group ref={headRef}>
          <mesh castShadow position={[0, 1.27, 0]}>
            <sphereGeometry args={[0.34, 12, 8]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
          <mesh castShadow position={[-0.1, 1.31, -0.31]}>
            <sphereGeometry args={[0.032, 8, 6]} />
            <meshStandardMaterial color="#1F2530" />
          </mesh>
          <mesh castShadow position={[0.1, 1.31, -0.31]}>
            <sphereGeometry args={[0.032, 8, 6]} />
            <meshStandardMaterial color="#1F2530" />
          </mesh>
          <mesh castShadow position={[0, 1.23, -0.34]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial color="#F2C89F" flatShading />
          </mesh>
          <mesh castShadow position={[0, 1.53, -0.02]} rotation={[0.18, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.42, 0.1, 10]} />
            <meshStandardMaterial color={HAT} flatShading />
          </mesh>
          <mesh castShadow position={[0, 1.72, 0]} rotation={[0.18, 0, 0]}>
            <coneGeometry args={[0.38, 0.55, 8]} />
            <meshStandardMaterial color={HAT} flatShading />
          </mesh>
        </group>

        <group ref={leftArmRef} position={[-0.49, 0.75, -0.02]} rotation={[0, 0, LEFT_ARM_REST_Z]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.38, 4, 6]} />
            <meshStandardMaterial color={SHIRT} flatShading />
          </mesh>
        </group>
        <group ref={leftForearmRef} position={[-0.56, 0.43, -0.02]} rotation={[0, 0, -0.08]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.075, 0.22, 4, 6]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
          <mesh castShadow position={[-0.02, -0.2, 0]}>
            <sphereGeometry args={[0.09, 8, 6]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.49, 0.75, -0.02]} rotation={[0, 0, RIGHT_ARM_REST_Z]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.38, 4, 6]} />
            <meshStandardMaterial color={SHIRT} flatShading />
          </mesh>
        </group>
        <group ref={rightForearmRef} position={[0.56, 0.43, -0.02]} rotation={[0, 0, 0.08]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.075, 0.22, 4, 6]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
          <mesh castShadow position={[0.02, -0.2, 0]}>
            <sphereGeometry args={[0.09, 8, 6]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
        </group>

        <group ref={leftLegRef} position={[-0.17, 0.03, 0]} rotation={[0, 0, LEFT_LEG_REST_Z]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.095, 0.52, 4, 6]} />
            <meshStandardMaterial color={PANTS} flatShading />
          </mesh>
          <group ref={leftBootRef} position={[-0.01, -0.35, -0.07]}>
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.1, 0.34]} />
              <meshStandardMaterial color={BOOTS} flatShading />
            </mesh>
          </group>
        </group>
        <group ref={rightLegRef} position={[0.17, 0.03, 0]} rotation={[0, 0, RIGHT_LEG_REST_Z]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.095, 0.52, 4, 6]} />
            <meshStandardMaterial color={PANTS} flatShading />
          </mesh>
          <group ref={rightBootRef} position={[0.01, -0.35, -0.07]}>
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.1, 0.34]} />
              <meshStandardMaterial color={BOOTS} flatShading />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
