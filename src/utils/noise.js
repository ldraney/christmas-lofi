import { createNoise2D, createNoise3D, createNoise4D } from 'simplex-noise';

/**
 * Noise utility wrapper with layered octaves for organic motion
 * Uses simplex noise for smoother, more natural results than Perlin
 */
export class Noise {
  constructor(seed) {
    // Create noise functions (optionally seeded)
    const seedFn = seed ? () => seed : undefined;
    this.noise2D = createNoise2D(seedFn);
    this.noise3D = createNoise3D(seedFn);
    this.noise4D = createNoise4D(seedFn);
  }

  /**
   * Single octave 2D noise
   * @returns {number} Value between -1 and 1
   */
  get2D(x, y) {
    return this.noise2D(x, y);
  }

  /**
   * Single octave 3D noise (useful for time-varying 2D fields)
   * @returns {number} Value between -1 and 1
   */
  get3D(x, y, z) {
    return this.noise3D(x, y, z);
  }

  /**
   * Single octave 4D noise
   * @returns {number} Value between -1 and 1
   */
  get4D(x, y, z, w) {
    return this.noise4D(x, y, z, w);
  }

  /**
   * Fractal Brownian Motion (layered octaves) for natural complexity
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   * @param {number} [options.octaves=4] - Number of layers (4-6 recommended)
   * @param {number} [options.lacunarity=2] - Frequency multiplier per octave
   * @param {number} [options.persistence=0.5] - Amplitude multiplier per octave
   * @param {number} [options.scale=1] - Base frequency scale
   * @returns {number} Value between -1 and 1
   */
  fbm2D(x, y, { octaves = 4, lacunarity = 2, persistence = 0.5, scale = 1 } = {}) {
    let value = 0;
    let amplitude = 1;
    let frequency = scale;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2D(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }

  /**
   * 3D FBM - great for animated 2D noise fields (use z as time)
   */
  fbm3D(x, y, z, { octaves = 4, lacunarity = 2, persistence = 0.5, scale = 1 } = {}) {
    let value = 0;
    let amplitude = 1;
    let frequency = scale;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise3D(x * frequency, y * frequency, z * frequency);
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }

  /**
   * Get a time-varying 2D vector field value (for wind, flow, etc.)
   * @param {number} x
   * @param {number} y
   * @param {number} time - Time value for animation
   * @param {number} [scale=0.01] - Spatial scale
   * @param {number} [timeScale=0.1] - Time scale
   * @returns {{x: number, y: number}} Vector with x,y components in [-1, 1]
   */
  flowField(x, y, time, scale = 0.01, timeScale = 0.1) {
    const t = time * timeScale;
    return {
      x: this.fbm3D(x * scale, y * scale, t),
      y: this.fbm3D(x * scale + 100, y * scale + 100, t)
    };
  }

  /**
   * Map noise value to a custom range
   * @param {number} value - Noise value (-1 to 1)
   * @param {number} min - Output minimum
   * @param {number} max - Output maximum
   */
  static map(value, min, max) {
    return min + (value + 1) * 0.5 * (max - min);
  }
}

// Default instance for convenience
export const noise = new Noise();
