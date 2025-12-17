import { Graphics, Container } from 'pixi.js';
import { ObjectPool } from '../utils/pool.js';
import { Noise } from '../utils/noise.js';
import { christmasColors, lerpColor } from '../utils/color.js';
import { randomRange, randomPick, lerp } from '../utils/math.js';

/**
 * Magical floating sparkles that drift lazily and twinkle
 * Creates a dreamy, enchanted atmosphere
 */
export class MagicSparkles {
  constructor(options = {}) {
    this.particleCount = options.particleCount || 50;
    this.colors = options.colors || [
      christmasColors.starGold,
      christmasColors.starWhite,
      christmasColors.lightGold,
      0xFFE4E1, // Misty rose
      0xE6E6FA, // Lavender
    ];

    this.container = new Container();
    this.noise = new Noise();
    this.particles = [];
    this.pool = null;
    this.app = null;
  }

  onAdd(app) {
    this.app = app;

    this.pool = new ObjectPool(
      () => this.createSparkle(),
      this.particleCount
    );

    // Spawn particles
    for (let i = 0; i < this.particleCount; i++) {
      this.spawnParticle();
    }

    // Add to effects layer (in front of scene)
    app.layers.effects.addChild(this.container);
  }

  createSparkle() {
    const g = new Graphics();

    // Draw a 4-pointed star shape
    const size = 1;
    g.moveTo(0, -size);
    g.lineTo(size * 0.3, -size * 0.3);
    g.lineTo(size, 0);
    g.lineTo(size * 0.3, size * 0.3);
    g.lineTo(0, size);
    g.lineTo(-size * 0.3, size * 0.3);
    g.lineTo(-size, 0);
    g.lineTo(-size * 0.3, -size * 0.3);
    g.closePath();
    g.fill(0xFFFFFF);

    return g;
  }

  spawnParticle() {
    const { width, height } = this.app;

    const particle = this.pool.acquire((p) => {
      // Random position across screen, weighted toward upper portions
      p.x = randomRange(0, width);
      p.y = randomRange(0, height * 0.8);

      // Random size
      const size = randomRange(2, 6);
      p.scale.set(size);
      p.baseScale = size;

      // Random color from palette
      p.tint = randomPick(this.colors);

      // Very slow drift velocity
      p.vx = randomRange(-5, 5);
      p.vy = randomRange(-3, 3);

      // Twinkle properties
      p.twinkleSpeed = randomRange(2, 5);
      p.twinkleOffset = randomRange(0, Math.PI * 2);

      // Pulse scale
      p.pulseSpeed = randomRange(1, 3);
      p.pulseOffset = randomRange(0, Math.PI * 2);

      // Lifespan (some sparkles fade in/out)
      p.lifetime = randomRange(5, 15);
      p.age = randomRange(0, p.lifetime); // Start at random age

      // Noise offset for organic motion
      p.noiseOffset = randomRange(0, 10000);

      // Rotation
      p.rotationSpeed = randomRange(-1, 1);

      p.alpha = 0.8;
      p.visible = true;
    });

    this.particles.push(particle);
    this.container.addChild(particle);
    return particle;
  }

  update(delta, elapsed) {
    const { width, height } = this.app;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update age
      p.age += delta;

      // Fade in/out based on age
      let lifeFade = 1;
      if (p.age < 1) {
        lifeFade = p.age; // Fade in
      } else if (p.age > p.lifetime - 1) {
        lifeFade = p.lifetime - p.age; // Fade out
      }

      // Twinkle alpha
      const twinkle = Math.sin(elapsed * p.twinkleSpeed + p.twinkleOffset);
      p.alpha = (0.4 + twinkle * 0.4) * lifeFade;

      // Pulse scale
      const pulse = Math.sin(elapsed * p.pulseSpeed + p.pulseOffset);
      p.scale.set(p.baseScale * (0.8 + pulse * 0.3));

      // Get noise-based drift
      const flow = this.noise.flowField(
        p.x + p.noiseOffset,
        p.y,
        elapsed * 0.5,
        0.005,
        0.1
      );

      // Apply very gentle movement
      p.x += (p.vx + flow.x * 15) * delta;
      p.y += (p.vy + flow.y * 10) * delta;

      // Slow rotation
      p.rotation += p.rotationSpeed * delta;

      // Respawn if off screen or lifetime exceeded
      if (p.age > p.lifetime || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
        this.particles.splice(i, 1);
        this.container.removeChild(p);
        p.visible = false;
        this.pool.release(p);

        // Spawn replacement
        this.spawnParticle();
      }
    }
  }

  onResize(width, height) {
    // Particles will naturally adjust
  }

  onDestroy() {
    this.pool.dispose((p) => p.destroy());
    this.container.destroy({ children: true });
  }
}
