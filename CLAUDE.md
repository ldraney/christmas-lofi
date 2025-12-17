# Pixi Lofi Foundation

Design-agnostic PixiJS v8 foundation for lofi-style animations. Provides core utilities for building ambient visual experiences.

## Quick Start

```bash
npm install
npm run dev
```

## Tech Stack

- **PixiJS v8** - WebGL 2D rendering (100k+ particles at 60fps)
- **Vite** - Fast dev server and bundling
- **simplex-noise** - Organic motion generation

## Project Structure

```
src/
  main.js              # Entry point
  core/
    App.js             # Application wrapper with lifecycle management
  utils/
    pool.js            # Object pooling for memory efficiency
    noise.js           # Simplex noise with FBM and flow fields
    math.js            # lerp, clamp, randomRange, etc.
    color.js           # HSL conversion, palettes, color lerping
  effects/
    postprocess.js     # Vignette, grain, color grading
  scenes/
    TestScene.js       # Example particle scene
assets/
  textures/            # Sprite sheets, images
  noise/               # Pre-rendered grain textures
```

## Core Concepts

### App Lifecycle

```js
import { createApp } from './core/App.js';

const app = await createApp({
  backgroundColor: 0x1a1a2e,
  width: window.innerWidth,
  height: window.innerHeight
});

app.addScene(myScene);
app.start();
```

### Scene Interface

Scenes are objects with optional lifecycle methods:

```js
const myScene = {
  onAdd(app) { },           // Called when added to app
  update(delta, elapsed) { }, // Called each frame (delta in seconds)
  onResize(width, height) { },
  onDestroy() { }
};
```

### Layer System

App provides 5 rendering layers (back to front):
- `app.layers.background` - Static backgrounds
- `app.layers.scene` - Main scene content
- `app.layers.particles` - Particle systems
- `app.layers.effects` - Dynamic effects
- `app.layers.overlay` - Post-processing overlays

### Object Pooling

For particle systems, always use pooling to avoid GC pressure:

```js
import { ObjectPool } from './utils/pool.js';

const pool = new ObjectPool(
  () => new Graphics().circle(0, 0, 1).fill(0xffffff),
  1000 // pre-allocate
);

const particle = pool.acquire((p) => {
  p.x = Math.random() * width;
  p.y = 0;
});

// When done:
pool.release(particle);
```

### Noise-Based Motion

For organic, non-robotic movement:

```js
import { Noise } from './utils/noise.js';

const noise = new Noise();

// Single value
const n = noise.get2D(x * 0.01, y * 0.01);

// Layered FBM for natural complexity
const fbm = noise.fbm2D(x, y, { octaves: 4, scale: 0.01 });

// Animated flow field (use time as z-axis)
const flow = noise.flowField(x, y, elapsed, 0.01, 0.1);
particle.x += flow.x * delta;
particle.y += flow.y * delta;
```

### Color Palettes

Use HSL and weighted palettes for lofi aesthetic:

```js
import { palettes, pickFromPalette, hslToHex } from './utils/color.js';

// Pre-defined palettes with weights (70% dominant, 20% secondary, 10% accent)
const color = pickFromPalette(palettes.warmNight);

// Custom muted colors
const muted = hslToHex(220, 30, 25); // Low saturation, low lightness
```

### Post-Processing

```js
import { setupPostProcessing } from './effects/postprocess.js';

setupPostProcessing(app, {
  vignette: true,
  vignetteOptions: { intensity: 0.5, radius: 0.4 },
  colorGrading: true,
  colorGradingOptions: { saturation: 0.85, contrast: 1.1 },
  grain: false // CPU intensive, enable if needed
});
```

## Memory Management

Critical for long-running animations:

1. **Always pool particles** - Never create/destroy in hot loop
2. **Use delta time** - `position += velocity * delta` for frame-rate independence
3. **Clean up timers** - Use `app.setTimeout()` instead of raw `setTimeout()`
4. **Monitor memory** - Check `window.app.pool.stats` in dev tools

## Performance Targets

- 60fps sustained
- 1+ hour runtime without memory growth
- <2MB initial download

## Adding New Scenes

1. Create `src/scenes/MyScene.js`
2. Implement scene interface (onAdd, update, etc.)
3. Import and add in `main.js`:
   ```js
   import { MyScene } from './scenes/MyScene.js';
   app.addScene(new MyScene());
   ```

## Building for Production

```bash
npm run build  # Output in dist/
npm run preview  # Preview production build
```

## Extending This Foundation

This repo is design-agnostic. To create a specific animation:

1. Fork/copy this foundation
2. Add your scene in `src/scenes/`
3. Add custom assets to `assets/`
4. Modify `main.js` to compose your scene

Examples of what to build:
- Snowglobe (enclosed scene, snow particles, glass effect)
- Lofi room (window, rain, flickering lights)
- Night sky (stars, shooting stars, aurora)
- Abstract (flowing particles, geometric shapes)
