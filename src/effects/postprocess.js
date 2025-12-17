import { Graphics, Container, BlurFilter, ColorMatrixFilter } from 'pixi.js';

/**
 * Post-processing effects for lofi aesthetic
 */

/**
 * Create a vignette overlay
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Object} options
 * @param {number} [options.intensity=0.4] - Vignette darkness (0-1)
 * @param {number} [options.radius=0.5] - Inner radius as fraction of diagonal
 */
export function createVignette(width, height, { intensity = 0.4, radius = 0.5 } = {}) {
  const container = new Container();
  const graphics = new Graphics();

  const cx = width / 2;
  const cy = height / 2;
  const diagonal = Math.sqrt(width * width + height * height) / 2;
  const innerRadius = diagonal * radius;
  const outerRadius = diagonal;

  // Radial gradient via multiple ellipses
  const steps = 20;
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const r = innerRadius + (outerRadius - innerRadius) * t;
    const alpha = intensity * t * t; // Quadratic falloff

    graphics.ellipse(cx, cy, r * (width / height), r);
    graphics.fill({ color: 0x000000, alpha });
  }

  container.addChild(graphics);
  container.label = 'vignette';

  // Method to update on resize
  container.updateSize = (w, h) => {
    graphics.clear();
    const ncx = w / 2;
    const ncy = h / 2;
    const ndiag = Math.sqrt(w * w + h * h) / 2;
    const ninner = ndiag * radius;
    const nouter = ndiag;

    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const r = ninner + (nouter - ninner) * t;
      const alpha = intensity * t * t;
      graphics.ellipse(ncx, ncy, r * (w / h), r);
      graphics.fill({ color: 0x000000, alpha });
    }
  };

  return container;
}

/**
 * Create animated film grain overlay
 * Uses procedural noise pattern that shifts over time
 */
export function createGrain(width, height, { opacity = 0.05, scale = 2 } = {}) {
  const container = new Container();
  const graphics = new Graphics();

  const cellSize = scale;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);

  function renderGrain() {
    graphics.clear();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const brightness = Math.random();
        const alpha = opacity * brightness;
        graphics.rect(x * cellSize, y * cellSize, cellSize, cellSize);
        graphics.fill({ color: 0xFFFFFF, alpha });
      }
    }
  }

  renderGrain();
  container.addChild(graphics);
  container.label = 'grain';

  // Call this each frame for animated grain
  container.update = () => renderGrain();

  container.updateSize = (w, h) => {
    // Recalculate dimensions but don't re-render until next update
  };

  return container;
}

/**
 * Create color grading filter
 * Applies cool shadows + warm highlights for lofi look
 */
export function createColorGrading({
  saturation = 0.85,
  contrast = 1.1,
  brightness = 1.0,
  warmShadows = false,
  coolHighlights = false
} = {}) {
  const filter = new ColorMatrixFilter();

  // Apply saturation (slightly desaturated for lofi)
  filter.saturate(saturation - 1, true);

  // Apply contrast
  filter.contrast(contrast, true);

  // Apply brightness
  filter.brightness(brightness, true);

  // Optional color temperature adjustments
  if (warmShadows) {
    // Shift shadows toward warm tones
    filter.matrix[0] = 1.1;  // Red boost
    filter.matrix[6] = 1.0;  // Green normal
    filter.matrix[12] = 0.9; // Blue reduce
  }

  if (coolHighlights) {
    // This is a simplified version - real implementation would need proper curves
    filter.matrix[2] = 0.1;  // Add blue to red channel
    filter.matrix[7] = 0.05; // Add blue to green channel
  }

  return filter;
}

/**
 * Create subtle chromatic aberration effect
 * Shifts RGB channels slightly for retro/analog look
 */
export function createChromaticAberration(offset = 2) {
  // PixiJS doesn't have a built-in CA filter
  // This creates the effect by layering the scene
  // For now, return a container that can hold offset copies

  const container = new Container();
  container.label = 'chromatic-aberration';

  // The actual implementation would require duplicating the scene
  // and applying color matrices to extract R/G/B channels
  // This is a placeholder for custom shader implementation

  container.offset = offset;

  return container;
}

/**
 * Apply all post-processing to an app
 */
export function setupPostProcessing(app, options = {}) {
  const {
    vignette = true,
    grain = false, // Disabled by default as it's CPU intensive
    colorGrading = true,
    vignetteOptions = {},
    grainOptions = {},
    colorGradingOptions = {}
  } = options;

  const effects = {};

  if (vignette) {
    effects.vignette = createVignette(app.width, app.height, vignetteOptions);
    app.layers.overlay.addChild(effects.vignette);
  }

  if (grain) {
    effects.grain = createGrain(app.width, app.height, grainOptions);
    app.layers.overlay.addChild(effects.grain);
  }

  if (colorGrading) {
    effects.colorGrading = createColorGrading(colorGradingOptions);
    app.app.stage.filters = [effects.colorGrading];
  }

  return effects;
}
