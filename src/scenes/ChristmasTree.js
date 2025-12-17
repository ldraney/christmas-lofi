import { Graphics, Container } from 'pixi.js';
import { christmasColors, lerpColor } from '../utils/color.js';
import { randomRange, randomPick, lerp } from '../utils/math.js';
import { Noise } from '../utils/noise.js';

/**
 * Detailed Christmas tree with layered branches, twinkling lights,
 * ornaments, and a glowing star topper
 */
export class ChristmasTree {
  constructor(options = {}) {
    this.position = options.position || { x: 0.5, y: 0.85 }; // Normalized position (bottom center)
    this.scale = options.scale || 1;
    this.lightCount = options.lightCount || 60;
    this.ornamentCount = options.ornamentCount || 25;

    this.container = new Container();
    this.treeContainer = new Container();
    this.lightsContainer = new Container();
    this.ornamentsContainer = new Container();
    this.starContainer = new Container();

    this.lights = [];
    this.ornaments = [];
    this.noise = new Noise();
    this.app = null;
  }

  onAdd(app) {
    this.app = app;

    this.container.addChild(this.treeContainer);
    this.container.addChild(this.ornamentsContainer);
    this.container.addChild(this.lightsContainer);
    this.container.addChild(this.starContainer);

    this.createTree();
    this.createOrnaments();
    this.createLights();
    this.createStar();

    // Add to scene layer
    app.layers.scene.addChild(this.container);
  }

  createTree() {
    const { width, height } = this.app;
    const baseX = width * this.position.x;
    const baseY = height * this.position.y;
    const treeHeight = height * 0.55 * this.scale;
    const baseWidth = treeHeight * 0.65;

    this.treeContainer.removeChildren();

    // Store tree bounds for placing decorations
    this.treeBounds = {
      x: baseX,
      y: baseY,
      height: treeHeight,
      width: baseWidth
    };

    // Draw tree trunk
    const trunk = new Graphics();
    const trunkWidth = baseWidth * 0.12;
    const trunkHeight = treeHeight * 0.12;
    trunk.rect(-trunkWidth / 2, 0, trunkWidth, trunkHeight);
    trunk.fill(0x4A3728); // Dark brown
    trunk.x = baseX;
    trunk.y = baseY;
    this.treeContainer.addChild(trunk);

    // Draw tree layers (4 overlapping triangles for depth)
    const layerCount = 4;
    const colors = [
      christmasColors.treeDark,
      christmasColors.treeMid,
      christmasColors.treeMid,
      christmasColors.treeLight
    ];

    for (let i = 0; i < layerCount; i++) {
      const layer = new Graphics();
      const layerT = i / (layerCount - 1);

      // Each layer is offset and slightly different
      const layerHeight = treeHeight * (0.9 - layerT * 0.15);
      const layerWidth = baseWidth * (1 - layerT * 0.1);
      const offsetY = layerT * treeHeight * 0.08;

      // Create jagged tree edge using noise
      this.drawJaggedTriangle(
        layer,
        0,
        -layerHeight + offsetY,
        layerWidth,
        layerHeight,
        colors[i],
        i
      );

      layer.x = baseX;
      layer.y = baseY;
      this.treeContainer.addChild(layer);
    }

    // Add snow on branches
    this.addSnowOnTree(baseX, baseY, treeHeight, baseWidth);
  }

  drawJaggedTriangle(graphics, tipX, tipY, baseWidth, height, color, seed) {
    const resolution = 30;
    const leftPoints = [];
    const rightPoints = [];

    for (let i = 0; i <= resolution; i++) {
      const t = i / resolution;

      // Base triangle points
      const leftX = tipX - (baseWidth / 2) * t;
      const rightX = tipX + (baseWidth / 2) * t;
      const y = tipY + height * t;

      // Add noise for jagged edge
      const noiseL = this.noise.fbm2D(t * 10 + seed * 100, 0, { scale: 1, octaves: 3 }) * 15;
      const noiseR = this.noise.fbm2D(t * 10 + seed * 100 + 500, 0, { scale: 1, octaves: 3 }) * 15;

      leftPoints.push({ x: leftX + noiseL, y });
      rightPoints.push({ x: rightX + noiseR, y });
    }

    // Draw shape
    graphics.moveTo(tipX, tipY);

    // Left edge
    for (const p of leftPoints) {
      graphics.lineTo(p.x, p.y);
    }

    // Bottom edge
    graphics.lineTo(rightPoints[rightPoints.length - 1].x, rightPoints[rightPoints.length - 1].y);

    // Right edge (reversed)
    for (let i = rightPoints.length - 1; i >= 0; i--) {
      graphics.lineTo(rightPoints[i].x, rightPoints[i].y);
    }

    graphics.closePath();
    graphics.fill(color);
  }

  addSnowOnTree(baseX, baseY, treeHeight, baseWidth) {
    const snowPatches = 12;
    const snow = new Graphics();

    for (let i = 0; i < snowPatches; i++) {
      // Random position on tree
      const t = randomRange(0.1, 0.9); // Vertical position
      const horizontalSpread = (baseWidth / 2) * t;

      const x = baseX + randomRange(-horizontalSpread * 0.7, horizontalSpread * 0.7);
      const y = baseY - treeHeight * (1 - t) + randomRange(-20, 20);

      // Draw snow patch (elongated ellipse)
      const width = randomRange(15, 40);
      const height = randomRange(5, 12);

      snow.ellipse(x, y, width, height);
      snow.fill({ color: christmasColors.snowWhite, alpha: randomRange(0.6, 0.9) });
    }

    this.treeContainer.addChild(snow);
  }

  createLights() {
    const bounds = this.treeBounds;

    this.lightsContainer.removeChildren();
    this.lights = [];

    const lightColors = [
      christmasColors.lightGold,
      christmasColors.lightWarm,
      christmasColors.lightRed,
      christmasColors.lightBlue,
      christmasColors.lightGreen,
      christmasColors.lightPink,
      christmasColors.lightPurple
    ];

    for (let i = 0; i < this.lightCount; i++) {
      // Position lights within tree triangle
      const t = randomRange(0.05, 0.95); // Vertical position
      const horizontalSpread = (bounds.width / 2) * t * 0.8;

      const x = bounds.x + randomRange(-horizontalSpread, horizontalSpread);
      const y = bounds.y - bounds.height * (1 - t);

      const light = new Graphics();
      const color = randomPick(lightColors);
      const size = randomRange(2, 4);

      // Draw light bulb (small circle with glow)
      // Outer glow
      light.circle(0, 0, size * 3);
      light.fill({ color, alpha: 0.15 });
      light.circle(0, 0, size * 2);
      light.fill({ color, alpha: 0.25 });
      // Core
      light.circle(0, 0, size);
      light.fill({ color, alpha: 0.9 });

      light.x = x;
      light.y = y;

      // Animation properties
      light.baseAlpha = 1;
      light.twinkleSpeed = randomRange(1, 4);
      light.twinkleOffset = randomRange(0, Math.PI * 2);
      light.color = color;
      light.isOn = true;
      light.onDuration = randomRange(2, 8);
      light.offDuration = randomRange(0.1, 0.5);
      light.timer = randomRange(0, light.onDuration);

      this.lights.push(light);
      this.lightsContainer.addChild(light);
    }
  }

  createOrnaments() {
    const bounds = this.treeBounds;

    this.ornamentsContainer.removeChildren();
    this.ornaments = [];

    const colors = christmasColors.ornaments;

    for (let i = 0; i < this.ornamentCount; i++) {
      // Position ornaments within tree
      const t = randomRange(0.15, 0.9);
      const horizontalSpread = (bounds.width / 2) * t * 0.7;

      const x = bounds.x + randomRange(-horizontalSpread, horizontalSpread);
      const y = bounds.y - bounds.height * (1 - t);

      const ornament = new Graphics();
      const color = randomPick(colors);
      const size = randomRange(6, 12);

      // Draw ornament ball
      ornament.circle(0, 0, size);
      ornament.fill(color);

      // Highlight
      ornament.circle(-size * 0.3, -size * 0.3, size * 0.3);
      ornament.fill({ color: 0xFFFFFF, alpha: 0.4 });

      // Cap at top
      ornament.rect(-size * 0.3, -size - 3, size * 0.6, 4);
      ornament.fill(0xD4AF37); // Gold cap

      ornament.x = x;
      ornament.y = y;

      // Subtle swing animation
      ornament.swingSpeed = randomRange(0.5, 1.5);
      ornament.swingOffset = randomRange(0, Math.PI * 2);
      ornament.swingAmount = randomRange(0.02, 0.05);

      this.ornaments.push(ornament);
      this.ornamentsContainer.addChild(ornament);
    }
  }

  createStar() {
    const bounds = this.treeBounds;
    const starX = bounds.x;
    const starY = bounds.y - bounds.height - 10;
    const starSize = 25 * this.scale;

    this.starContainer.removeChildren();

    // Glow layers
    const glowLayers = [
      { size: starSize * 4, alpha: 0.08 },
      { size: starSize * 3, alpha: 0.12 },
      { size: starSize * 2, alpha: 0.2 },
      { size: starSize * 1.5, alpha: 0.3 },
    ];

    for (const { size, alpha } of glowLayers) {
      const glow = new Graphics();
      glow.circle(0, 0, size);
      glow.fill({ color: christmasColors.starGold, alpha });
      glow.x = starX;
      glow.y = starY;
      this.starContainer.addChild(glow);
    }

    // Draw 5-pointed star
    const star = new Graphics();
    const points = 5;
    const outerRadius = starSize;
    const innerRadius = starSize * 0.4;

    star.moveTo(0, -outerRadius);
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / points) * i - Math.PI / 2;
      star.lineTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    }
    star.closePath();
    star.fill(christmasColors.starGold);

    // Inner highlight
    const innerStar = new Graphics();
    const innerScale = 0.6;
    innerStar.moveTo(0, -outerRadius * innerScale);
    for (let i = 0; i < points * 2; i++) {
      const radius = (i % 2 === 0 ? outerRadius : innerRadius) * innerScale;
      const angle = (Math.PI / points) * i - Math.PI / 2;
      innerStar.lineTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    }
    innerStar.closePath();
    innerStar.fill({ color: christmasColors.starWhite, alpha: 0.5 });

    star.x = starX;
    star.y = starY;
    innerStar.x = starX;
    innerStar.y = starY;

    this.starContainer.addChild(star);
    this.starContainer.addChild(innerStar);

    this.star = star;
    this.innerStar = innerStar;
    this.starX = starX;
    this.starY = starY;
  }

  update(delta, elapsed) {
    // Twinkle lights with on/off cycling
    for (const light of this.lights) {
      light.timer += delta;

      if (light.isOn) {
        // Twinkling while on
        const twinkle = Math.sin(elapsed * light.twinkleSpeed + light.twinkleOffset);
        light.alpha = light.baseAlpha * (0.7 + twinkle * 0.3);

        if (light.timer > light.onDuration) {
          light.isOn = false;
          light.timer = 0;
        }
      } else {
        // Brief off period
        light.alpha = 0.1;
        if (light.timer > light.offDuration) {
          light.isOn = true;
          light.timer = 0;
          light.onDuration = randomRange(2, 8);
        }
      }
    }

    // Subtle ornament swing
    for (const ornament of this.ornaments) {
      const swing = Math.sin(elapsed * ornament.swingSpeed + ornament.swingOffset);
      ornament.rotation = swing * ornament.swingAmount;
    }

    // Star pulse and rotation
    if (this.star) {
      const pulse = 1 + Math.sin(elapsed * 2) * 0.05;
      this.star.scale.set(pulse);
      this.innerStar.scale.set(pulse);

      // Slow rotation
      this.star.rotation = elapsed * 0.1;
      this.innerStar.rotation = elapsed * 0.1;
    }
  }

  onResize(width, height) {
    this.createTree();
    this.createOrnaments();
    this.createLights();
    this.createStar();
  }

  onDestroy() {
    this.container.destroy({ children: true });
  }
}
