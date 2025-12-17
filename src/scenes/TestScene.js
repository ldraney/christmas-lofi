import { Graphics, Container } from 'pixi.js';
import { ObjectPool } from '../utils/pool.js';
import { Noise } from '../utils/noise.js';
import { randomRange, lerp } from '../utils/math.js';
import { palettes, pickFromPalette, lerpColor } from '../utils/color.js';

/**
 * Test scene demonstrating:
 * - Object pooling for particles
 * - Noise-based organic motion
 * - Layered depth with parallax
 * - Color palette usage
 */
export class TestScene {
  constructor(options = {}) {
    this.particleCount = options.particleCount || 200;
    this.palette = options.palette || palettes.warmNight;

    this.container = new Container();
    this.noise = new Noise();
    this.particles = [];
    this.pool = null;
    this.app = null;
  }

  onAdd(app) {
    this.app = app;

    // Create particle pool
    this.pool = new ObjectPool(
      () => this.createParticle(),
      this.particleCount
    );

    // Spawn initial particles
    for (let i = 0; i < this.particleCount; i++) {
      this.spawnParticle();
    }

    // Add to particles layer
    app.layers.particles.addChild(this.container);
  }

  createParticle() {
    const g = new Graphics();
    g.circle(0, 0, 1);
    g.fill(0xFFFFFF);
    return g;
  }

  spawnParticle(atTop = false) {
    const particle = this.pool.acquire((p) => {
      // Random position
      p.x = randomRange(0, this.app.width);
      p.y = atTop ? -10 : randomRange(0, this.app.height);

      // Random size (depth simulation)
      const size = randomRange(1, 4);
      p.scale.set(size);

      // Depth affects speed and opacity
      p.depth = size / 4; // 0.25 to 1
      p.alpha = lerp(0.3, 0.8, p.depth);

      // Base velocity
      p.vy = randomRange(20, 60) * p.depth;
      p.vx = 0;

      // Color from palette
      p.tint = pickFromPalette(this.palette);

      // Noise offset for unique motion
      p.noiseOffset = randomRange(0, 1000);

      p.visible = true;
    });

    this.particles.push(particle);
    this.container.addChild(particle);
    return particle;
  }

  update(delta, elapsed) {
    const width = this.app.width;
    const height = this.app.height;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Get noise-based wind force
      const flow = this.noise.flowField(
        p.x + p.noiseOffset,
        p.y,
        elapsed,
        0.002,  // spatial scale
        0.3     // time scale
      );

      // Apply forces
      p.vx = flow.x * 30 * p.depth;
      p.x += p.vx * delta;
      p.y += p.vy * delta;

      // Subtle horizontal drift
      p.x += Math.sin(elapsed * 2 + p.noiseOffset) * 0.5 * p.depth;

      // Recycle if off screen
      if (p.y > height + 10 || p.x < -20 || p.x > width + 20) {
        // Remove from active list
        this.particles.splice(i, 1);
        this.container.removeChild(p);
        p.visible = false;

        // Return to pool
        this.pool.release(p);

        // Spawn replacement at top
        this.spawnParticle(true);
      }
    }
  }

  onResize(width, height) {
    // Particles will naturally adjust as they recycle
  }

  onDestroy() {
    this.pool.dispose((p) => p.destroy());
    this.container.destroy({ children: true });
  }
}

/**
 * Background gradient scene element
 */
export class GradientBackground {
  constructor(options = {}) {
    this.topColor = options.topColor || 0x1a1a2e;
    this.bottomColor = options.bottomColor || 0x16213e;
    this.graphics = new Graphics();
  }

  onAdd(app) {
    this.app = app;
    this.draw();
    app.layers.background.addChild(this.graphics);
  }

  draw() {
    const { width, height } = this.app;
    const steps = 50;

    this.graphics.clear();

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const y = t * height;
      const h = height / steps + 1;
      const color = lerpColor(this.topColor, this.bottomColor, t);

      this.graphics.rect(0, y, width, h);
      this.graphics.fill(color);
    }
  }

  onResize(width, height) {
    this.draw();
  }

  update() {
    // Static background, no update needed
  }

  onDestroy() {
    this.graphics.destroy();
  }
}
