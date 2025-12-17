/**
 * Math utilities for animation
 */

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 */
export function map(value, inMin, inMax, outMin, outMax) {
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}

/**
 * Smooth step (ease in-out)
 */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Random float in range
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Random integer in range (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

/**
 * Pick random item from array with optional weights
 * @param {Array} items
 * @param {Array} [weights] - If provided, weighted selection (must sum to 1)
 */
export function randomPick(items, weights) {
  if (!weights) {
    return items[randomInt(0, items.length - 1)];
  }

  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += weights[i];
    if (r <= sum) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians) {
  return radians * 180 / Math.PI;
}

/**
 * Distance between two points
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Angle between two points (in radians)
 */
export function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}
