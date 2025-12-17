import { Graphics, Container } from 'pixi.js';
import { ObjectPool } from '../utils/pool.js';
import { Noise } from '../utils/noise.js';
import { christmasColors } from '../utils/color.js';
import { randomRange, lerp } from '../utils/math.js';

/**
 * Heavy snowfall particle system with wind drift and depth layers
 */
export class SnowSystem {
  constructor(options = {}) {
    this.particleCount = options.particleCount || 400;
    this.windStrength = options.windStrength || 1;

    this.container = new Container();
    this.noise = new Noise();
    this.particles = [];
    this.pool = null;
    this.app = null;

    // Wind state
    this.windDirection = 0;
    this.targetWindDirection = 0;
    this.windChangeTimer = 0;
  }

  onAdd(app) {
    this.app = app;

    // Create particle pool with varied snowflake graphics
    this.pool = new ObjectPool(
      () => this.createSnowflake(),
      this.particleCount
    );

    // Spawn initial particles across the screen
    for (let i = 0; i < this.particleCount; i++) {
      this.spawnParticle(false);
    }

    // Add to particles layer
    app.layers.particles.addChild(this.container);
  }

  createSnowflake() {
    const g = new Graphics();

    // Simple circle snowflake
    g.circle(0, 0, 1);
    g.fill(christmasColors.snowWhite);

    return g;
  }

  spawnParticle(atTop = true) {
    const { width, height } = this.app;

    const particle = this.pool.acquire((p) => {
      // Random position
      p.x = randomRange(-50, width + 50);
      p.y = atTop ? randomRange(-50, -10) : randomRange(0, height);

      // Depth layer (0 = far back, 1 = front)
      const depth = Math.random();
      p.depth = depth;

      // Size based on depth (far = small, near = large)
      const size = lerp(1, 4, depth);
      p.scale.set(size);

      // Velocity based on depth
      p.vy = lerp(30, 100, depth); // Slower in back, faster in front
      p.vx = 0;

      // Alpha based on depth
      p.alpha = lerp(0.3, 0.9, depth);

      // Wobble properties for organic motion
      p.wobbleSpeed = randomRange(1, 3);
      p.wobbleOffset = randomRange(0, Math.PI * 2);
      p.wobbleAmount = randomRange(10, 30);

      // Unique noise offset
      p.noiseOffset = randomRange(0, 10000);

      // Rotation speed (only for larger flakes)
      p.rotationSpeed = depth > 0.7 ? randomRange(-2, 2) : 0;

      p.visible = true;
    });

    this.particles.push(particle);
    this.container.addChild(particle);
    return particle;
  }

  update(delta, elapsed) {
    const { width, height } = this.app;

    // Update wind direction periodically
    this.windChangeTimer += delta;
    if (this.windChangeTimer > 3) {
      this.targetWindDirection = randomRange(-1, 1) * this.windStrength;
      this.windChangeTimer = 0;
    }

    // Smooth wind transition
    this.windDirection = lerp(this.windDirection, this.targetWindDirection, delta * 0.5);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Get flow field influence
      const flow = this.noise.flowField(
        p.x + p.noiseOffset,
        p.y,
        elapsed,
        0.003,
        0.2
      );

      // Wind effect (stronger for closer particles)
      const windEffect = this.windDirection * 50 * p.depth;

      // Apply horizontal movement
      p.vx = flow.x * 20 * p.depth + windEffect;

      // Wobble
      const wobble = Math.sin(elapsed * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmount * p.depth;

      // Update position
      p.x += (p.vx + wobble) * delta;
      p.y += p.vy * delta;

      // Rotation for larger flakes
      if (p.rotationSpeed) {
        p.rotation += p.rotationSpeed * delta;
      }

      // Recycle if off screen
      if (p.y > height + 20 || p.x < -60 || p.x > width + 60) {
        this.particles.splice(i, 1);
        this.container.removeChild(p);
        p.visible = false;
        this.pool.release(p);

        // Spawn replacement
        this.spawnParticle(true);
      }
    }

    // Sort particles by depth for proper layering
    this.container.children.sort((a, b) => (a.depth || 0) - (b.depth || 0));
  }

  onResize(width, height) {
    // Particles will naturally adjust as they recycle
  }

  onDestroy() {
    this.pool.dispose((p) => p.destroy());
    this.container.destroy({ children: true });
  }
}
