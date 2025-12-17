import { createApp } from './core/App.js';
import { setupPostProcessing } from './effects/postprocess.js';
import { christmasColors } from './utils/color.js';

// Christmas scene components
import { NightSky } from './scenes/NightSky.js';
import { Aurora } from './scenes/Aurora.js';
import { SnowGround } from './scenes/SnowGround.js';
import { ChristmasTree } from './scenes/ChristmasTree.js';
import { SnowSystem } from './scenes/SnowSystem.js';
import { MagicSparkles } from './scenes/MagicSparkles.js';

async function init() {
  // Create the app with dark Christmas night background
  const app = await createApp({
    backgroundColor: christmasColors.skyTop
  });

  // === LAYER ORDER (back to front) ===

  // 1. Night sky with stars and moon (background layer)
  const nightSky = new NightSky({
    starCount: 180,
    moonPosition: { x: 0.85, y: 0.12 },
    moonSize: 35
  });
  app.addScene(nightSky);

  // 2. Aurora borealis (scene layer, behind tree)
  const aurora = new Aurora({
    bandCount: 6,
    intensity: 0.5,
    resolution: 100
  });
  app.addScene(aurora);

  // 3. Snowy ground/hills (scene layer)
  const snowGround = new SnowGround({
    layerCount: 4,
    baseHeight: 0.28
  });
  app.addScene(snowGround);

  // 4. Christmas tree (scene layer)
  const christmasTree = new ChristmasTree({
    position: { x: 0.5, y: 0.88 },
    scale: 1.3,
    lightCount: 90,
    ornamentCount: 40
  });
  app.addScene(christmasTree);

  // 5. Heavy snowfall (particles layer)
  const snow = new SnowSystem({
    particleCount: 600,
    windStrength: 1.0
  });
  app.addScene(snow);

  // 6. Magical sparkles (effects layer)
  const sparkles = new MagicSparkles({
    particleCount: 40
  });
  app.addScene(sparkles);

  // === POST-PROCESSING ===
  setupPostProcessing(app, {
    vignette: true,
    vignetteOptions: {
      intensity: 0.15,
      radius: 0.7
    },
    colorGrading: true,
    colorGradingOptions: {
      saturation: 1.0,
      contrast: 1.05,
      brightness: 1.02
    },
    grain: false // Enable for extra lofi feel (performance cost)
  });

  // Start the animation loop
  app.start();

  // Debug info in dev mode
  if (import.meta.env.DEV) {
    console.log('Christmas Scene initialized');
    console.log('Scenes:', app.scenes.length);

    setInterval(() => {
      console.log('Snow pool:', snow.pool?.stats);
      console.log('Sparkle pool:', sparkles.pool?.stats);
    }, 10000);
  }

  // Expose for debugging
  window.app = app;
  window.scenes = { nightSky, aurora, snowGround, christmasTree, snow, sparkles };
}

init().catch(console.error);
