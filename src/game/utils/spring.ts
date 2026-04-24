import { normalizeAngle } from "./math";

export function springDamp(current: number, target: number, smoothing: number, delta: number): number {
  const factor = 1 - Math.exp(-Math.max(0, smoothing) * Math.max(0, delta));
  return current + (target - current) * factor;
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
