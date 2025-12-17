# Christmas Lofi Scene

A cozy, animated Christmas scene built with PixiJS v8. Features a decorated tree, falling snow, aurora borealis, and twinkling stars.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Tech Stack

- **PixiJS v8** - WebGL 2D rendering
- **Vite** - Fast dev server and bundling
- **simplex-noise** - Organic motion generation

## Project Structure

```
src/
  main.js                 # Entry point, scene composition
  core/
    App.js                # Application wrapper with lifecycle
  scenes/
    NightSky.js           # Gradient sky, twinkling stars, glowing moon
    Aurora.js             # Northern lights with noise-based flow
    SnowGround.js         # Rolling snowy hills with parallax
    ChristmasTree.js      # Tree with lights, ornaments, star topper
    SnowSystem.js         # Heavy snowfall particle system
    MagicSparkles.js      # Floating magical sparkle particles
  utils/
    pool.js               # Object pooling for particles
    noise.js              # Simplex noise utilities
    math.js               # lerp, clamp, randomRange, etc.
    color.js              # HSL conversion, Christmas color palette
  effects/
    postprocess.js        # Vignette, color grading
```

## Scene Components

### NightSky
- Three-color gradient background (deep night to midnight blue)
- 180 twinkling stars with varying brightness and twinkle speeds
- Glowing moon with layered halo effect

### Aurora
- 6 flowing bands of northern lights
- Uses 3D FBM noise for organic wave motion
- Colors: greens, teals, purples, pinks

### ChristmasTree
- Layered jagged pine silhouette
- 90 twinkling colored lights (cycle on/off)
- 40 ornaments with subtle swing animation
- Glowing rotating star topper
- Snow patches on branches

### SnowSystem
- 600 snowflakes with depth-based parallax
- Wind that shifts direction over time
- Noise-driven wobble for organic motion

### MagicSparkles
- 40 floating 4-pointed star particles
- Drift lazily with noise-based motion
- Fade in/out lifecycle

## Customization

Edit `src/main.js` to adjust:

```js
// Tree size and decorations
const christmasTree = new ChristmasTree({
  position: { x: 0.5, y: 0.88 },  // Normalized screen position
  scale: 1.3,                      // Tree size multiplier
  lightCount: 90,                  // Number of lights
  ornamentCount: 40                // Number of ornaments
});

// Snow intensity
const snow = new SnowSystem({
  particleCount: 600,              // More = heavier snow
  windStrength: 1.0                // Wind intensity
});

// Aurora brightness
const aurora = new Aurora({
  bandCount: 6,                    // Number of aurora bands
  intensity: 0.5                   // Brightness (0-1)
});

// Post-processing
setupPostProcessing(app, {
  vignetteOptions: { intensity: 0.15, radius: 0.7 },
  colorGradingOptions: { saturation: 1.0, contrast: 1.05 }
});
```

## Color Palette

Christmas colors defined in `src/utils/color.js`:

```js
christmasColors.skyTop        // 0x0B0B1A - Deep night
christmasColors.aurora        // [greens, teals, purples, pinks]
christmasColors.treeDark      // 0x1B4332 - Dark pine
christmasColors.snowWhite     // 0xF0F8FF - Blue-tinted white
christmasColors.lightGold     // 0xFFD93D - Golden lights
christmasColors.ornaments     // [red, gold, blue, green, pink, purple]
christmasColors.starGold      // 0xFFF3BF - Star topper
```

## Performance

- Targets 60fps sustained
- Object pooling prevents GC pressure
- ~1000 particles rendered efficiently
- Delta-time based animation for frame-rate independence

## Building

```bash
npm run build    # Output in dist/
npm run preview  # Preview production build
```
