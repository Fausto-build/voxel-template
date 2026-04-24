import * as THREE from "three";
import { normalizeAngle } from "./math";

export function springDamp(current: number, target: number, smoothing: number, delta: number): number {
  const factor = 1 - Math.exp(-Math.max(0, smoothing) * Math.max(0, delta));
  return current + (target - current) * factor;
}

/**
 * Critically-damped spring for a Vector3.
 * Mutates `velocity` in place; returns the new position value (also mutates `current`).
 */
export function springDampVec3(
  current: THREE.Vector3,
  velocity: THREE.Vector3,
  target: THREE.Vector3,
  smoothing: number,
  delta: number,
): void {
  // omega = smoothing (natural frequency)
  const omega = smoothing;
  const exp = Math.exp(-omega * delta);
  const dx = current.x - target.x;
  const dy = current.y - target.y;
  const dz = current.z - target.z;
  const vx = (velocity.x + omega * dx) * delta;
  const vy = (velocity.y + omega * dy) * delta;
  const vz = (velocity.z + omega * dz) * delta;
  velocity.x = (velocity.x - omega * vx) * exp;
  velocity.y = (velocity.y - omega * vy) * exp;
  velocity.z = (velocity.z - omega * vz) * exp;
  current.x = target.x + (dx + vx) * exp;
  current.y = target.y + (dy + vy) * exp;
  current.z = target.z + (dz + vz) * exp;
}

export function springDampAngle(
  current: number,
  target: number,
  smoothing: number,
  delta: number,
): number {
  return normalizeAngle(current + normalizeAngle(target - current) * (1 - Math.exp(-smoothing * delta)));
}

export function approach(current: number, target: number, maxStep: number): number {
  if (current < target) {
    return Math.min(current + maxStep, target);
  }

  return Math.max(current - maxStep, target);
}
