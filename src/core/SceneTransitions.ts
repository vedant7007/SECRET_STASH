/**
 * SceneTransitions.ts — PHASE 5: CINEMATIC SCENE TRANSITIONS
 *
 * Crossfade, dissolve, nebula-bloom transitions between major scenes
 * Emotion-based lighting shifts and camera choreography
 *
 * Philosophy: Transitions are not page flips — they are emotional bridges.
 * Each transition should feel like a confession unfolding.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Transition types
 */
export type TransitionType =
  | 'crossfade'          // Simple opacity crossfade (2s)
  | 'dissolve'           // Particle dissolve (3s)
  | 'nebula-bloom'       // Nebula expansion from center (4s)
  | 'ripple-wipe'        // Radial ripple wipe (2.5s)
  | 'particle-morph'     // Particles morph between scenes (3.5s)
  | 'light-shift'        // Lighting color shift only (1.5s)
  | 'curtain-fall'       // Vertical wipe with particle curtain (3s)
  | 'heart-pulse';       // Heart-shaped bloom (finale only, 5s)

/**
 * Emotion-based lighting configurations
 */
export type EmotionLighting = {
  ambient: string;       // Ambient light color
  directional: string;   // Directional light color
  intensity: number;     // Light intensity (0-2)
  fogColor: string;      // Scene fog color
  fogDensity: number;    // Fog density (0-0.1)
};

/**
 * Emotion to lighting mapping
 */
export const EMOTION_LIGHTING: Record<string, EmotionLighting> = {
  joy: {
    ambient: '#FFE5B4',        // Warm peach
    directional: '#FFD700',    // Gold
    intensity: 1.5,
    fogColor: '#FFF5E1',       // Cream
    fogDensity: 0.01,
  },
  tenderness: {
    ambient: '#FFE0F0',        // Soft pink
    directional: '#FFB6D9',    // Rose
    intensity: 1.2,
    fogColor: '#FFF0F5',       // Lavender blush
    fogDensity: 0.015,
  },
  longing: {
    ambient: '#B0C4DE',        // Light steel blue
    directional: '#4682B4',    // Steel blue
    intensity: 0.9,
    fogColor: '#D8E4F0',       // Pale blue
    fogDensity: 0.025,
  },
  awe: {
    ambient: '#E0BBE4',        // Lavender
    directional: '#957DAD',    // Purple
    intensity: 1.8,
    fogColor: '#F3E5F5',       // Light lavender
    fogDensity: 0.005,
  },
  serenity: {
    ambient: '#D4F1F4',        // Pale cyan
    directional: '#75E6DA',    // Turquoise
    intensity: 1.0,
    fogColor: '#E0F7FA',       // Pale aqua
    fogDensity: 0.02,
  },
  elation: {
    ambient: '#FFECB3',        // Light amber
    directional: '#FFC107',    // Amber
    intensity: 2.0,
    fogColor: '#FFF9C4',       // Pale yellow
    fogDensity: 0.003,
  },
  nostalgia: {
    ambient: '#D7CCC8',        // Warm gray
    directional: '#A1887F',    // Brown gray
    intensity: 0.8,
    fogColor: '#EFEBE9',       // Pale brown
    fogDensity: 0.03,
  },
  completion: {
    ambient: '#C5E1A5',        // Light lime
    directional: '#9CCC65',    // Lime
    intensity: 1.3,
    fogColor: '#F1F8E9',       // Pale lime
    fogDensity: 0.012,
  },
  wonder: {
    ambient: '#B3E5FC',        // Light sky blue
    directional: '#4FC3F7',    // Sky blue
    intensity: 1.4,
    fogColor: '#E1F5FE',       // Pale sky
    fogDensity: 0.008,
  },
  grace: {
    ambient: '#F8BBD0',        // Light pink
    directional: '#F48FB1',    // Pink
    intensity: 1.1,
    fogColor: '#FCE4EC',       // Pale pink
    fogDensity: 0.018,
  },
  courage: {
    ambient: '#FFCCBC',        // Light coral
    directional: '#FF7043',    // Deep coral
    intensity: 1.6,
    fogColor: '#FBE9E7',       // Pale coral
    fogDensity: 0.007,
  },
};

/**
 * Camera movement configurations
 */
export type CameraMovement = {
  type: 'push-in' | 'pull-out' | 'orbit' | 'tilt' | 'drift' | 'static';
  duration: number;
  easing: string;
  distance?: number;  // For push/pull
  angle?: number;     // For orbit/tilt
};

/**
 * Transition configuration
 */
export interface TransitionConfig {
  type: TransitionType;
  duration: number;
  easing: string;
  lighting?: {
    from: string;  // Emotion name
    to: string;    // Emotion name
  };
  camera?: CameraMovement;
  particles?: {
    count: number;
    behavior: 'dissolve' | 'morph' | 'burst' | 'converge';
  };
}

/**
 * Scene transition orchestrator
 */
export class SceneTransitionManager {
  private currentScene: string | null = null;
  private isTransitioning: boolean = false;
  private onCompleteCallback: (() => void) | null = null;

  /**
   * Execute a transition between scenes
   */
  async transition(
    fromScene: string,
    toScene: string,
    config: TransitionConfig,
    options?: {
      scene?: THREE.Scene;
      camera?: THREE.Camera;
      onProgress?: (progress: number) => void;
    }
  ): Promise<void> {
    if (this.isTransitioning) {
      console.warn('[SceneTransitions] Transition already in progress');
      return;
    }

    this.isTransitioning = true;
    this.currentScene = toScene;

    console.log(`[SceneTransitions] ${fromScene} → ${toScene} (${config.type})`);

    try {
      // Execute transition based on type
      switch (config.type) {
        case 'crossfade':
          await this.executeCrossfade(config, options);
          break;
        case 'dissolve':
          await this.executeDissolve(config, options);
          break;
        case 'nebula-bloom':
          await this.executeNebulaBloom(config, options);
          break;
        case 'ripple-wipe':
          await this.executeRippleWipe(config, options);
          break;
        case 'particle-morph':
          await this.executeParticleMorph(config, options);
          break;
        case 'light-shift':
          await this.executeLightShift(config, options);
          break;
        case 'curtain-fall':
          await this.executeCurtainFall(config, options);
          break;
        case 'heart-pulse':
          await this.executeHeartPulse(config, options);
          break;
      }

      // Apply lighting transition if specified
      if (config.lighting && options?.scene) {
        await this.transitionLighting(
          config.lighting.from,
          config.lighting.to,
          config.duration,
          options.scene
        );
      }

      // Apply camera movement if specified
      if (config.camera && options?.camera) {
        await this.animateCamera(config.camera, options.camera);
      }
    } finally {
      this.isTransitioning = false;
      this.onCompleteCallback?.();
      this.onCompleteCallback = null;
    }
  }

  /**
   * Crossfade transition (simple opacity)
   */
  private async executeCrossfade(
    config: TransitionConfig,
    options?: { onProgress?: (progress: number) => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      const obj = { opacity: 0 };

      gsap.to(obj, {
        opacity: 1,
        duration: config.duration,
        ease: config.easing,
        onUpdate: () => {
          options?.onProgress?.(obj.opacity);
        },
        onComplete: resolve,
      });
    });
  }

  /**
   * Particle dissolve transition
   */
  private async executeDissolve(
    config: TransitionConfig,
    options?: { scene?: THREE.Scene; onProgress?: (progress: number) => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      const obj = { dissolve: 0 };

      gsap.to(obj, {
        dissolve: 1,
        duration: config.duration,
        ease: config.easing,
        onUpdate: () => {
          options?.onProgress?.(obj.dissolve);
          // Update shader uniform if scene has dissolve material
          if (options?.scene) {
            options.scene.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                if (child.material.uniforms.dissolve) {
                  child.material.uniforms.dissolve.value = obj.dissolve;
                }
              }
            });
          }
        },
        onComplete: resolve,
      });
    });
  }

  /**
   * Nebula bloom transition
   */
  private async executeNebulaBloom(
    config: TransitionConfig,
    options?: { scene?: THREE.Scene; onProgress?: (progress: number) => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      const obj = { bloom: 0, scale: 0.1 };

      gsap.to(obj, {
        bloom: 1,
        scale: 1,
        duration: config.duration,
        ease: 'power2.out',
        onUpdate: () => {
          options?.onProgress?.(obj.bloom);
          // Update bloom effect if available
          if (options?.scene) {
            options.scene.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                if (child.material.uniforms.bloom) {
                  child.material.uniforms.bloom.value = obj.bloom;
                }
              }
              // Scale effect
              if (child.name === 'nebula-core') {
                child.scale.setScalar(obj.scale);
              }
            });
          }
        },
        onComplete: resolve,
      });
    });
  }

  /**
   * Ripple wipe transition
   */
  private async executeRippleWipe(
    config: TransitionConfig,
    options?: { scene?: THREE.Scene; onProgress?: (progress: number) => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      const obj = { radius: 0 };

      gsap.to(obj, {
        radius: 1.5, // Expands beyond viewport
        duration: config.duration,
        ease: 'power2.in',
        onUpdate: () => {
          options?.onProgress?.(obj.radius / 1.5);
          // Update ripple shader uniform
          if (options?.scene) {
            options.scene.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                if (child.material.uniforms.rippleRadius) {
                  child.material.uniforms.rippleRadius.value = obj.radius;
                }
              }
            });
          }
        },
        onComplete: resolve,
      });
    });
  }

  /**
   * Particle morph transition
   */
  private async executeParticleMorph(
    config: TransitionConfig,
    options?: { scene?: THREE.Scene; onProgress?: (progress: number) => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      const obj = { morph: 0 };

      gsap.to(obj, {
        morph: 1,
        duration: config.duration,
        ease: 'power1.inOut',
        onUpdate: () => {
          options?.onProgress?.(obj.morph);
          // Update particle positions via shader uniform
          if (options?.scene) {
            options.scene.traverse((child) => {
              if (child instanceof THREE.Points) {
                const material = child.material as THREE.ShaderMaterial;
                if (material.uniforms?.morphProgress) {
                  material.uniforms.morphProgress.value = obj.morph;
                }
              }
            });
          }
        },
        onComplete: resolve,
      });
    });
  }

  /**
   * Light shift transition
   */
  private async executeLightShift(
    config: TransitionConfig,
    options?: { scene?: THREE.Scene; onProgress?: (progress: number) => void }
  ): Promise<void> {
    // Handled by transitionLighting method
    return Promise.resolve();
  }

  /**
   * Curtain fall transition
   */
  private async executeCurtainFall(
    config: TransitionConfig,
    options?: { scene?: THREE.Scene; onProgress?: (progress: number) => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      const obj = { curtain: 0 };

      gsap.to(obj, {
        curtain: 1,
        duration: config.duration,
        ease: 'power2.in',
        onUpdate: () => {
          options?.onProgress?.(obj.curtain);
          // Update curtain position
          if (options?.scene) {
            options.scene.traverse((child) => {
              if (child.name === 'transition-curtain') {
                child.position.y = THREE.MathUtils.lerp(10, -10, obj.curtain);
              }
            });
          }
        },
        onComplete: resolve,
      });
    });
  }

  /**
   * Heart pulse transition (finale only)
   */
  private async executeHeartPulse(
    config: TransitionConfig,
    options?: { scene?: THREE.Scene; onProgress?: (progress: number) => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      const obj = { pulse: 0, glow: 0 };

      // Two-stage animation: pulse → glow
      const timeline = gsap.timeline();

      // Stage 1: Heart pulse (0-0.4)
      timeline.to(obj, {
        pulse: 1,
        duration: config.duration * 0.4,
        ease: 'power2.out',
        onUpdate: () => {
          options?.onProgress?.(obj.pulse * 0.4);
        },
      });

      // Stage 2: Glow expansion (0.4-1.0)
      timeline.to(obj, {
        glow: 1,
        duration: config.duration * 0.6,
        ease: 'power1.in',
        onUpdate: () => {
          options?.onProgress?.(0.4 + obj.glow * 0.6);
          // Update heart shader
          if (options?.scene) {
            options.scene.traverse((child) => {
              if (child.name === 'heart-nebula') {
                const material = child.material as THREE.ShaderMaterial;
                if (material.uniforms) {
                  material.uniforms.pulse.value = obj.pulse;
                  material.uniforms.glow.value = obj.glow;
                }
              }
            });
          }
        },
        onComplete: resolve,
      });
    });
  }

  /**
   * Transition lighting between emotions
   */
  private async transitionLighting(
    fromEmotion: string,
    toEmotion: string,
    duration: number,
    scene: THREE.Scene
  ): Promise<void> {
    const fromLighting = EMOTION_LIGHTING[fromEmotion] || EMOTION_LIGHTING.serenity;
    const toLighting = EMOTION_LIGHTING[toEmotion] || EMOTION_LIGHTING.serenity;

    return new Promise((resolve) => {
      const obj = { t: 0 };

      gsap.to(obj, {
        t: 1,
        duration,
        ease: 'power1.inOut',
        onUpdate: () => {
          // Lerp colors
          const ambientColor = new THREE.Color(fromLighting.ambient).lerp(
            new THREE.Color(toLighting.ambient),
            obj.t
          );
          const directionalColor = new THREE.Color(fromLighting.directional).lerp(
            new THREE.Color(toLighting.directional),
            obj.t
          );
          const fogColor = new THREE.Color(fromLighting.fogColor).lerp(
            new THREE.Color(toLighting.fogColor),
            obj.t
          );

          // Apply to scene lights
          scene.traverse((child) => {
            if (child instanceof THREE.AmbientLight) {
              child.color.copy(ambientColor);
              child.intensity = THREE.MathUtils.lerp(
                fromLighting.intensity * 0.5,
                toLighting.intensity * 0.5,
                obj.t
              );
            } else if (child instanceof THREE.DirectionalLight) {
              child.color.copy(directionalColor);
              child.intensity = THREE.MathUtils.lerp(
                fromLighting.intensity,
                toLighting.intensity,
                obj.t
              );
            }
          });

          // Apply fog
          if (scene.fog && scene.fog instanceof THREE.FogExp2) {
            scene.fog.color.copy(fogColor);
            scene.fog.density = THREE.MathUtils.lerp(
              fromLighting.fogDensity,
              toLighting.fogDensity,
              obj.t
            );
          }
        },
        onComplete: resolve,
      });
    });
  }

  /**
   * Animate camera movement
   */
  private async animateCamera(
    movement: CameraMovement,
    camera: THREE.Camera
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = camera.position.clone();
      const startRot = camera.rotation.clone();

      switch (movement.type) {
        case 'push-in':
          gsap.to(camera.position, {
            z: startPos.z - (movement.distance || 2),
            duration: movement.duration,
            ease: movement.easing,
            onComplete: resolve,
          });
          break;

        case 'pull-out':
          gsap.to(camera.position, {
            z: startPos.z + (movement.distance || 2),
            duration: movement.duration,
            ease: movement.easing,
            onComplete: resolve,
          });
          break;

        case 'orbit':
          const angle = movement.angle || Math.PI / 4;
          const radius = Math.sqrt(startPos.x ** 2 + startPos.z ** 2);
          const startAngle = Math.atan2(startPos.z, startPos.x);

          gsap.to({ angle: 0 }, {
            angle,
            duration: movement.duration,
            ease: movement.easing,
            onUpdate: function() {
              const currentAngle = startAngle + this.targets()[0].angle;
              camera.position.x = radius * Math.cos(currentAngle);
              camera.position.z = radius * Math.sin(currentAngle);
              camera.lookAt(0, 0, 0);
            },
            onComplete: resolve,
          });
          break;

        case 'tilt':
          gsap.to(camera.rotation, {
            x: startRot.x + (movement.angle || 0.1),
            duration: movement.duration,
            ease: movement.easing,
            onComplete: resolve,
          });
          break;

        case 'drift':
          gsap.to(camera.position, {
            y: startPos.y + (movement.distance || 1),
            duration: movement.duration,
            ease: movement.easing,
            onComplete: resolve,
          });
          break;

        case 'static':
        default:
          resolve();
      }
    });
  }

  /**
   * Check if currently transitioning
   */
  isActive(): boolean {
    return this.isTransitioning;
  }

  /**
   * Get current scene
   */
  getCurrentScene(): string | null {
    return this.currentScene;
  }
}

/**
 * Preset transition configurations
 */
export const TRANSITION_PRESETS: Record<string, TransitionConfig> = {
  'default': {
    type: 'crossfade',
    duration: 2,
    easing: 'power1.inOut',
  },
  'galaxy-to-garden': {
    type: 'particle-morph',
    duration: 3.5,
    easing: 'power2.inOut',
    lighting: { from: 'wonder', to: 'tenderness' },
    camera: { type: 'drift', duration: 3.5, easing: 'power1.out', distance: 2 },
  },
  'garden-to-promises': {
    type: 'dissolve',
    duration: 3,
    easing: 'power1.inOut',
    lighting: { from: 'tenderness', to: 'longing' },
    camera: { type: 'push-in', duration: 3, easing: 'power2.in', distance: 3 },
  },
  'promises-to-melody': {
    type: 'ripple-wipe',
    duration: 2.5,
    easing: 'power2.out',
    lighting: { from: 'longing', to: 'joy' },
  },
  'melody-to-constellation': {
    type: 'nebula-bloom',
    duration: 4,
    easing: 'power2.out',
    lighting: { from: 'joy', to: 'serenity' },
    camera: { type: 'pull-out', duration: 4, easing: 'power1.out', distance: 4 },
  },
  'constellation-to-finale': {
    type: 'heart-pulse',
    duration: 5,
    easing: 'power2.inOut',
    lighting: { from: 'serenity', to: 'elation' },
    camera: { type: 'static', duration: 5, easing: 'linear' },
  },
};

// Singleton instance
export const sceneTransitionManager = new SceneTransitionManager();

export default sceneTransitionManager;
