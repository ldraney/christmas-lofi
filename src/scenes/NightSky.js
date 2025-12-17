import { Graphics, Container } from 'pixi.js';
import { christmasColors, lerpColor } from '../utils/color.js';
import { randomRange, lerp } from '../utils/math.js';

/**
 * Night sky background with gradient, twinkling stars, and glowing moon
 */
export class NightSky {
  constructor(options = {}) {
    this.starCount = options.starCount || 150;
    this.moonPosition = options.moonPosition || { x: 0.8, y: 0.15 }; // Normalized position
    this.moonSize = options.moonSize || 40;

    this.container = new Container();
    this.background = new Graphics();
    this.starsContainer = new Container();
    this.moonContainer = new Container();

    this.stars = [];
    this.app = null;
  }

  onAdd(app) {
    this.app = app;

    // Draw initial background
    this.drawBackground();

    // Create stars
    this.createStars();

    // Create moon with glow
    this.createMoon();

    // Add to background layer
    app.layers.background.addChild(this.container);
    this.container.addChild(this.background);
    this.container.addChild(this.starsContainer);
    this.container.addChild(this.moonContainer);
  }

  drawBackground() {
    const { width, height } = this.app;
    const steps = 60;

    this.background.clear();

    // Three-color gradient: top -> mid -> bottom
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const y = t * height;
      const h = height / steps + 1;

      let color;
      if (t < 0.5) {
        // Top to mid
        color = lerpColor(christmasColors.skyTop, christmasColors.skyMid, t * 2);
      } else {
        // Mid to bottom
        color = lerpColor(christmasColors.skyMid, christmasColors.skyBottom, (t - 0.5) * 2);
      }

      this.background.rect(0, y, width, h);
      this.background.fill(color);
    }
  }

  createStars() {
    const { width, height } = this.app;

    for (let i = 0; i < this.starCount; i++) {
      const star = new Graphics();

      // Randomize star properties
      const size = randomRange(0.5, 2.5);
      const x = randomRange(0, width);
      const y = randomRange(0, height * 0.7); // Stars in upper 70% of sky

      // Draw star
      star.circle(0, 0, size);
      star.fill(christmasColors.starWhite);

      star.x = x;
      star.y = y;
      star.alpha = randomRange(0.3, 0.9);

      // Animation properties
      star.baseAlpha = star.alpha;
      star.twinkleSpeed = randomRange(0.5, 3);
      star.twinkleOffset = randomRange(0, Math.PI * 2);
      star.twinkleAmount = randomRange(0.2, 0.6);

      this.stars.push(star);
      this.starsContainer.addChild(star);
    }
  }

  createMoon() {
    const { width, height } = this.app;
    const moonX = width * this.moonPosition.x;
    const moonY = height * this.moonPosition.y;

    // Outer glow layers (back to front)
    const glowLayers = [
      { size: this.moonSize * 4, alpha: 0.03 },
      { size: this.moonSize * 3, alpha: 0.05 },
      { size: this.moonSize * 2.2, alpha: 0.08 },
      { size: this.moonSize * 1.6, alpha: 0.12 },
      { size: this.moonSize * 1.3, alpha: 0.2 },
    ];

    glowLayers.forEach(({ size, alpha }) => {
      const glow = new Graphics();
      glow.circle(0, 0, size);
      glow.fill(christmasColors.moonGlow);
      glow.x = moonX;
      glow.y = moonY;
      glow.alpha = alpha;
      this.moonContainer.addChild(glow);
    });

    // Moon core
    const moon = new Graphics();
    moon.circle(0, 0, this.moonSize);
    moon.fill(christmasColors.moonCore);
    moon.x = moonX;
    moon.y = moonY;
    moon.alpha = 0.95;
    this.moonContainer.addChild(moon);

    // Store for animation
    this.moon = moon;
    this.moonX = moonX;
    this.moonY = moonY;
  }

  update(delta, elapsed) {
    // Twinkle stars
    for (const star of this.stars) {
      const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset);
      star.alpha = star.baseAlpha + twinkle * star.twinkleAmount * star.baseAlpha;
    }

    // Subtle moon pulse
    if (this.moon) {
      const pulse = Math.sin(elapsed * 0.5) * 0.02 + 1;
      this.moon.scale.set(pulse);
    }
  }

  onResize(width, height) {
    this.drawBackground();

    // Reposition stars
    this.starsContainer.removeChildren();
    this.stars = [];
    this.createStars();

    // Reposition moon
    this.moonContainer.removeChildren();
    this.createMoon();
  }

  onDestroy() {
    this.container.destroy({ children: true });
  }
}
