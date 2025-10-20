/**
 * SceneCleanup.ts — CINEMATIC REBUILD
 *
 * Memory management for smooth scene transitions
 * Prevents GPU memory leaks, disposes geometries, and cleans up event listeners
 *
 * Philosophy: What we create, we must tenderly release.
 * Each scene must leave gracefully, making room for the next.
 */

import * as THREE from 'three';

export interface CleanupRegistry {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
  renderTargets: THREE.WebGLRenderTarget[];
  eventListeners: Array<{
    target: EventTarget;
    event: string;
    handler: EventListener;
  }>;
  animationFrames: number[];
  timeouts: number[];
  intervals: number[];
  customCleanups: Array<() => void>;
}

export class SceneCleanupManager {
  private registry: CleanupRegistry;

  constructor() {
    this.registry = {
      geometries: [],
      materials: [],
      textures: [],
      renderTargets: [],
      eventListeners: [],
      animationFrames: [],
      timeouts: [],
      intervals: [],
      customCleanups: [],
    };
  }

  /**
   * Register a geometry for cleanup
   */
  registerGeometry(geometry: THREE.BufferGeometry): void {
    this.registry.geometries.push(geometry);
  }

  /**
   * Register a material for cleanup
   */
  registerMaterial(material: THREE.Material): void {
    this.registry.materials.push(material);
  }

  /**
   * Register a texture for cleanup
   */
  registerTexture(texture: THREE.Texture): void {
    this.registry.textures.push(texture);
  }

  /**
   * Register a render target for cleanup
   */
  registerRenderTarget(target: THREE.WebGLRenderTarget): void {
    this.registry.renderTargets.push(target);
  }

  /**
   * Register an event listener for cleanup
   */
  registerEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener
  ): void {
    this.registry.eventListeners.push({ target, event, handler });
    target.addEventListener(event, handler);
  }

  /**
   * Register an animation frame for cleanup
   */
  registerAnimationFrame(id: number): void {
    this.registry.animationFrames.push(id);
  }

  /**
   * Register a timeout for cleanup
   */
  registerTimeout(id: number): void {
    this.registry.timeouts.push(id);
  }

  /**
   * Register an interval for cleanup
   */
  registerInterval(id: number): void {
    this.registry.intervals.push(id);
  }

  /**
   * Register a custom cleanup function
   */
  registerCustomCleanup(cleanup: () => void): void {
    this.registry.customCleanups.push(cleanup);
  }

  /**
   * Recursively dispose of a Three.js object and its children
   */
  disposeObject3D(object: THREE.Object3D): void {
    // Traverse and dispose
    object.traverse((child: THREE.Object3D) => {
      // Dispose geometry
      if ('geometry' in child && child.geometry instanceof THREE.BufferGeometry) {
        child.geometry.dispose();
      }

      // Dispose material(s)
      if ('material' in child) {
        const material = (child as any).material;
        if (Array.isArray(material)) {
          material.forEach((m) => {
            this.disposeMaterial(m);
          });
        } else if (material) {
          this.disposeMaterial(material);
        }
      }
    });

    // Remove from parent
    if (object.parent) {
      object.parent.remove(object);
    }
  }

  /**
   * Dispose of a material and its textures
   */
  private disposeMaterial(material: THREE.Material): void {
    // Dispose textures in material
    Object.keys(material).forEach((key) => {
      const value = (material as any)[key];
      if (value && typeof value === 'object' && 'isTexture' in value) {
        value.dispose();
      }
    });

    material.dispose();
  }

  /**
   * Execute full cleanup
   * Call this when transitioning away from a scene
   */
  cleanup(): void {
    console.log('[SceneCleanup] Beginning cleanup...', {
      geometries: this.registry.geometries.length,
      materials: this.registry.materials.length,
      textures: this.registry.textures.length,
      renderTargets: this.registry.renderTargets.length,
      eventListeners: this.registry.eventListeners.length,
      animationFrames: this.registry.animationFrames.length,
      timeouts: this.registry.timeouts.length,
      intervals: this.registry.intervals.length,
      customCleanups: this.registry.customCleanups.length,
    });

    // Dispose geometries
    this.registry.geometries.forEach((geometry) => {
      geometry.dispose();
    });

    // Dispose materials
    this.registry.materials.forEach((material) => {
      this.disposeMaterial(material);
    });

    // Dispose textures
    this.registry.textures.forEach((texture) => {
      texture.dispose();
    });

    // Dispose render targets
    this.registry.renderTargets.forEach((target) => {
      target.dispose();
    });

    // Remove event listeners
    this.registry.eventListeners.forEach(({ target, event, handler }) => {
      target.removeEventListener(event, handler);
    });

    // Cancel animation frames
    this.registry.animationFrames.forEach((id) => {
      cancelAnimationFrame(id);
    });

    // Clear timeouts
    this.registry.timeouts.forEach((id) => {
      clearTimeout(id);
    });

    // Clear intervals
    this.registry.intervals.forEach((id) => {
      clearInterval(id);
    });

    // Run custom cleanup functions
    this.registry.customCleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error('[SceneCleanup] Custom cleanup error:', error);
      }
    });

    // Clear registry
    this.registry = {
      geometries: [],
      materials: [],
      textures: [],
      renderTargets: [],
      eventListeners: [],
      animationFrames: [],
      timeouts: [],
      intervals: [],
      customCleanups: [],
    };

    console.log('[SceneCleanup] Cleanup complete');
  }

  /**
   * Get current memory usage stats (for debugging)
   */
  getStats(): CleanupRegistry {
    return { ...this.registry };
  }
}

/**
 * Create a new cleanup manager for each scene
 */
export function createSceneCleanup(): SceneCleanupManager {
  return new SceneCleanupManager();
}

export default SceneCleanupManager;
