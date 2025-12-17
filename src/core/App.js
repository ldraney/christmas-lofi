import { Application, Container } from 'pixi.js';

/**
 * Main application wrapper with proper initialization and lifecycle management
 */
export class App {
  constructor() {
    this.app = null;
    this.layers = {};
    this.scenes = [];
    this.elapsed = 0;
    this.isRunning = false;
    this.timers = new Set();
  }

  /**
   * Initialize the PixiJS application
   * @param {Object} options
   * @param {HTMLElement} [options.canvas] - Existing canvas element
   * @param {number} [options.width] - Canvas width (default: window width)
   * @param {number} [options.height] - Canvas height (default: window height)
   * @param {number} [options.backgroundColor=0x1a1a2e] - Background color
   * @param {boolean} [options.antialias=true] - Enable antialiasing
   * @param {boolean} [options.autoDensity=true] - Handle device pixel ratio
   */
  async init(options = {}) {
    const {
      canvas,
      width = window.innerWidth,
      height = window.innerHeight,
      backgroundColor = 0x1a1a2e,
      antialias = true,
      autoDensity = true
    } = options;

    this.app = new Application();

    await this.app.init({
      canvas,
      width,
      height,
      backgroundColor,
      antialias,
      autoDensity,
      resolution: window.devicePixelRatio || 1
    });

    // Add canvas to DOM if no canvas provided
    if (!canvas) {
      document.body.appendChild(this.app.canvas);
    }

    // Setup default layer structure
    this.setupLayers();

    // Handle resize
    this.setupResize();

    return this;
  }

  /**
   * Setup rendering layers (back to front)
   */
  setupLayers() {
    this.layers = {
      background: new Container(),
      scene: new Container(),
      particles: new Container(),
      effects: new Container(),
      overlay: new Container()
    };

    // Add in order (first = back)
    this.app.stage.addChild(this.layers.background);
    this.app.stage.addChild(this.layers.scene);
    this.app.stage.addChild(this.layers.particles);
    this.app.stage.addChild(this.layers.effects);
    this.app.stage.addChild(this.layers.overlay);
  }

  /**
   * Setup responsive resize handling
   */
  setupResize() {
    const resize = () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      this.scenes.forEach(scene => scene.onResize?.(this.width, this.height));
    };

    window.addEventListener('resize', resize);
  }

  /**
   * Get canvas dimensions
   */
  get width() {
    return this.app.renderer.width;
  }

  get height() {
    return this.app.renderer.height;
  }

  get center() {
    return { x: this.width / 2, y: this.height / 2 };
  }

  /**
   * Add a scene to the update loop
   * @param {Object} scene - Object with update(delta, elapsed) method
   */
  addScene(scene) {
    this.scenes.push(scene);
    scene.onAdd?.(this);
    return this;
  }

  /**
   * Remove a scene from the update loop
   */
  removeScene(scene) {
    const idx = this.scenes.indexOf(scene);
    if (idx !== -1) {
      this.scenes.splice(idx, 1);
      scene.onRemove?.(this);
    }
    return this;
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.app.ticker.add((ticker) => {
      const delta = ticker.deltaMS / 1000; // Convert to seconds
      this.elapsed += delta;

      // Update all scenes
      for (const scene of this.scenes) {
        scene.update?.(delta, this.elapsed);
      }
    });

    return this;
  }

  /**
   * Stop the animation loop
   */
  stop() {
    this.isRunning = false;
    this.app.ticker.stop();
    return this;
  }

  /**
   * Safe setTimeout that gets cleaned up on destroy
   */
  setTimeout(fn, delay) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, delay);
    this.timers.add(id);
    return id;
  }

  /**
   * Safe setInterval that gets cleaned up on destroy
   */
  setInterval(fn, delay) {
    const id = setInterval(fn, delay);
    this.timers.add(id);
    return id;
  }

  /**
   * Clear a timer
   */
  clearTimer(id) {
    clearTimeout(id);
    clearInterval(id);
    this.timers.delete(id);
  }

  /**
   * Clean up everything
   */
  destroy() {
    // Clear all timers
    for (const id of this.timers) {
      clearTimeout(id);
      clearInterval(id);
    }
    this.timers.clear();

    // Cleanup scenes
    for (const scene of this.scenes) {
      scene.onDestroy?.();
    }
    this.scenes = [];

    // Destroy Pixi app
    this.app.destroy(true, { children: true, texture: true });
  }
}

// Singleton instance for convenience
let instance = null;

export async function createApp(options) {
  if (instance) {
    instance.destroy();
  }
  instance = new App();
  await instance.init(options);
  return instance;
}

export function getApp() {
  return instance;
}
