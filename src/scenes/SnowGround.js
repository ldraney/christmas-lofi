import { Graphics, Container } from 'pixi.js';
import { Noise } from '../utils/noise.js';
import { christmasColors, lerpColor } from '../utils/color.js';
import { lerp, randomRange } from '../utils/math.js';

/**
 * Rolling snowy hills with multiple layers for depth
 */
export class SnowGround {
  constructor(options = {}) {
    this.layerCount = options.layerCount || 4;
    this.baseHeight = options.baseHeight || 0.25; // Bottom 25% of screen

    this.container = new Container();
    this.noise = new Noise();
    this.layers = [];
    this.app = null;
  }

  onAdd(app) {
    this.app = app;
    this.createLayers();

    // Add to scene layer
    app.layers.scene.addChild(this.container);
  }

  createLayers() {
    const { width, height } = this.app;

    // Clear existing
    this.container.removeChildren();
    this.layers = [];

    // Create layers from back to front
    for (let i = 0; i < this.layerCount; i++) {
      const layer = new Graphics();
      const t = i / (this.layerCount - 1); // 0 = back, 1 = front

      // Properties vary by depth
      layer.depth = t;
      layer.baseY = height * (1 - this.baseHeight * (1 + t * 0.5)); // Higher = further back
      layer.noiseScale = 0.002 + t * 0.002;
      layer.amplitude = 30 + t * 40;
      layer.noiseOffset = i * 1000; // Unique noise per layer

      // Color gets lighter as it comes forward
      layer.color = lerpColor(christmasColors.snowShadow, christmasColors.snowWhite, t * 0.8);

      this.layers.push(layer);
      this.container.addChild(layer);
    }

    this.drawLayers();
  }

  drawLayers() {
    const { width, height } = this.app;
    const resolution = 100;

    for (const layer of this.layers) {
      layer.clear();

      // Generate hill profile using noise
      const points = [];
      for (let i = 0; i <= resolution; i++) {
        const t = i / resolution;
        const x = t * width;

        // Multi-octave noise for natural hills
        const noise = this.noise.fbm2D(
          x + layer.noiseOffset,
          0,
          { octaves: 4, scale: layer.noiseScale, persistence: 0.5 }
        );

        // Add some larger rolling hills
        const bigHill = Math.sin(t * Math.PI * 2 + layer.noiseOffset * 0.001) * 20;

        const y = layer.baseY + noise * layer.amplitude + bigHill;
        points.push({ x, y });
      }

      // Draw filled area
      layer.moveTo(0, height);
      layer.lineTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        layer.lineTo(points[i].x, points[i].y);
      }

      layer.lineTo(width, height);
      layer.closePath();
      layer.fill(layer.color);

      // Add subtle highlight on top edge (snow reflection)
      if (layer.depth > 0.5) {
        layer.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          layer.lineTo(points[i].x, points[i].y);
        }
        layer.stroke({ width: 2, color: christmasColors.snowWhite, alpha: 0.3 });
      }
    }
  }

  update(delta, elapsed) {
    // Ground is static, no animation needed
    // Could add subtle snow sparkle effect here if desired
  }

  onResize(width, height) {
    this.createLayers();
  }

  onDestroy() {
    this.container.destroy({ children: true });
  }
}
