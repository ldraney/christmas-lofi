/**
 * Generic object pool for memory-efficient particle systems
 * Pre-allocates objects at startup, reuses them to avoid GC pressure
 */
export class ObjectPool {
  constructor(factory, initialSize = 100) {
    this.factory = factory;
    this.pool = [];
    this.active = new Set();

    // Pre-allocate
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  /**
   * Get an object from the pool (or create new if exhausted)
   * @param {Function} [initializer] - Optional function to initialize the object
   * @returns {*} Pooled object
   */
  acquire(initializer) {
    const obj = this.pool.length > 0 ? this.pool.pop() : this.factory();
    this.active.add(obj);
    if (initializer) initializer(obj);
    return obj;
  }

  /**
   * Return an object to the pool
   * @param {*} obj - Object to release
   * @param {Function} [reset] - Optional function to reset the object state
   */
  release(obj, reset) {
    if (!this.active.has(obj)) return;
    this.active.delete(obj);
    if (reset) reset(obj);
    this.pool.push(obj);
  }

  /**
   * Release all active objects back to the pool
   * @param {Function} [reset] - Optional function to reset each object
   */
  releaseAll(reset) {
    for (const obj of this.active) {
      if (reset) reset(obj);
      this.pool.push(obj);
    }
    this.active.clear();
  }

  /**
   * Get counts for debugging
   */
  get stats() {
    return {
      available: this.pool.length,
      active: this.active.size,
      total: this.pool.length + this.active.size
    };
  }

  /**
   * Expand the pool with additional pre-allocated objects
   * @param {number} count - Number of objects to add
   */
  expand(count) {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.factory());
    }
  }

  /**
   * Dispose of all objects (call if objects need cleanup)
   * @param {Function} [dispose] - Optional disposal function for each object
   */
  dispose(dispose) {
    if (dispose) {
      for (const obj of this.pool) dispose(obj);
      for (const obj of this.active) dispose(obj);
    }
    this.pool = [];
    this.active.clear();
  }
}
