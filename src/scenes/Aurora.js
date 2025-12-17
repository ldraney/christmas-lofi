import { Graphics, Container } from 'pixi.js';
import { Noise } from '../utils/noise.js';
import { christmasColors, lerpColor } from '../utils/color.js';
import { lerp, randomRange } from '../utils/math.js';

/**
 * Aurora Borealis effect using layered noise
 * Creates flowing bands of color across the sky
 */
export class Aurora {
  constructor(options = {}) {
    this.bandCount = options.bandCount || 5;
    this.resolution = options.resolution || 80; // Points per band
    this.intensity = options.intensity || 0.4;

    this.container = new Container();
    this.noise = new Noise();
    this.bands = [];
    this.app = null;
  }

  onAdd(app) {
    this.app = app;
    this.createBands();

    // Add to scene layer (behind particles)
    app.layers.scene.addChild(this.container);
  }

  createBands() {
    const { width, height } = this.app;
    const colors = christmasColors.aurora;

    for (let i = 0; i < this.bandCount; i++) {
      const band = new Graphics();

      // Each band gets properties
      band.colorIndex = i % colors.length;
      band.baseY = height * (0.1 + (i / this.bandCount) * 0.35); // Upper portion of screen
      band.amplitude = randomRange(30, 80);
      band.phaseOffset = randomRange(0, Math.PI * 2);
      band.speedMultiplier = randomRange(0.8, 1.2);
      band.noiseScale = randomRange(0.001, 0.003);
      band.thickness = randomRange(40, 100);

      this.bands.push(band);
      this.container.addChild(band);
    }
  }

  update(delta, elapsed) {
    const { width, height } = this.app;
    const colors = christmasColors.aurora;

    for (const band of this.bands) {
      band.clear();

      const points = [];
      const bottomPoints = [];

      // Generate wave points using noise
      for (let i = 0; i <= this.resolution; i++) {
        const t = i / this.resolution;
        const x = t * width;

        // Layer multiple noise frequencies for organic motion
        const noise1 = this.noise.fbm3D(
          x * band.noiseScale,
          band.baseY * 0.01,
          elapsed * 0.15 * band.speedMultiplier + band.phaseOffset,
          { octaves: 3, scale: 1 }
        );

        const noise2 = this.noise.fbm3D(
          x * band.noiseScale * 2,
          band.baseY * 0.01 + 100,
          elapsed * 0.1 * band.speedMultiplier,
          { octaves: 2, scale: 1 }
        );

        // Combine noises for y position
        const y = band.baseY + noise1 * band.amplitude + noise2 * band.amplitude * 0.5;

        // Thickness varies along the band
        const thicknessNoise = this.noise.get3D(
          x * 0.005,
          0,
          elapsed * 0.2
        );
        const thickness = band.thickness * (0.5 + (thicknessNoise + 1) * 0.5);

        points.push({ x, y });
        bottomPoints.push({ x, y: y + thickness });
      }

      // Get colors for this band
      const color1 = colors[band.colorIndex];
      const color2 = colors[(band.colorIndex + 1) % colors.length];

      // Draw the band as a filled shape with gradient-like effect
      // We'll draw multiple thin strips to simulate gradient
      const strips = 8;
      for (let s = 0; s < strips; s++) {
        const st = s / strips;
        const stripColor = lerpColor(color1, color2, st);
        const alpha = this.intensity * (1 - Math.abs(st - 0.5) * 1.5); // Fade at edges

        band.moveTo(points[0].x, lerp(points[0].y, bottomPoints[0].y, st));

        for (let i = 1; i < points.length; i++) {
          const topY = lerp(points[i].y, bottomPoints[i].y, st);
          const botY = lerp(points[i].y, bottomPoints[i].y, st + 1 / strips);

          band.lineTo(points[i].x, topY);
        }

        // Go back along bottom
        for (let i = points.length - 1; i >= 0; i--) {
          const botY = lerp(points[i].y, bottomPoints[i].y, st + 1 / strips);
          band.lineTo(points[i].x, botY);
        }

        band.closePath();
        band.fill({ color: stripColor, alpha: alpha });
      }
    }
  }

  onResize(width, height) {
    // Recreate bands with new dimensions
    this.container.removeChildren();
    this.bands = [];
    this.createBands();
  }

  onDestroy() {
    this.container.destroy({ children: true });
  }
}
