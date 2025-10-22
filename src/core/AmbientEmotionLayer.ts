/**
 * AmbientEmotionLayer.ts — PHASE 5: AMBIENT EMOTION LAYER
 *
 * Background breathing, particle drift, glint/sparkle tied to emotional state
 * Every scene feels alive even when idle
 *
 * Philosophy: Silence should shimmer. Stillness should breathe.
 * The scene watches you back.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Emotion breathing patterns (subtle pulsation)
 */
export type BreathingPattern = {
  rate: number;          // Breaths per minute (8-20)
  depth: number;         // Amplitude (0.05-0.3)
  easing: string;        // GSAP easing
  hold?: {               // Optional pause at peak/trough
    peak: number;        // Duration in seconds
    trough: number;
  };
};

/**
 * Emotion to breathing pattern mapping
 */
export const EMOTION_BREATHING: Record<string, BreathingPattern> = {
  joy: {
    rate: 16,              // Lively, quick
    depth: 0.2,
    easing: 'power1.inOut',
  },
  tenderness: {
    rate: 10,              // Slow, gentle
    depth: 0.15,
    easing: 'sine.inOut',
    hold: { peak: 0.3, trough: 0.2 },
  },
  longing: {
    rate: 8,               // Deep, slow sighs
    depth: 0.25,
    easing: 'power2.inOut',
    hold: { peak: 0.5, trough: 0.3 },
  },
  awe: {
    rate: 12,              // Suspended breath
    depth: 0.3,
    easing: 'expo.inOut',
    hold: { peak: 0.8, trough: 0.1 },
  },
  serenity: {
    rate: 9,               // Calm, rhythmic
    depth: 0.1,
    easing: 'sine.inOut',
  },
  elation: {
    rate: 18,              // Excited, rapid
    depth: 0.25,
    easing: 'power1.inOut',
  },
  nostalgia: {
    rate: 7,               // Melancholic, slow
    depth: 0.2,
    easing: 'power2.inOut',
    hold: { peak: 0.4, trough: 0.6 },
  },
  completion: {
    rate: 10,              // Satisfied, steady
    depth: 0.15,
    easing: 'sine.inOut',
  },
  wonder: {
    rate: 14,              // Curious, light
    depth: 0.18,
    easing: 'power1.inOut',
  },
  grace: {
    rate: 11,              // Elegant, flowing
    depth: 0.12,
    easing: 'sine.inOut',
  },
  courage: {
    rate: 13,              // Determined, strong
    depth: 0.22,
    easing: 'power2.inOut',
  },
};

/**
 * Particle drift behaviors
 */
export type DriftBehavior = {
  speed: number;         // Base drift speed (0.001-0.01)
  turbulence: number;    // Noise amplitude (0-1)
  direction: THREE.Vector3;  // Primary drift direction
  variation: number;     // Random variation (0-1)
};

/**
 * Emotion to drift mapping
 */
export const EMOTION_DRIFT: Record<string, DriftBehavior> = {
  joy: {
    speed: 0.008,
    turbulence: 0.5,
    direction: new THREE.Vector3(0, 0.8, 0),  // Upward
    variation: 0.7,
  },
  tenderness: {
    speed: 0.003,
    turbulence: 0.2,
    direction: new THREE.Vector3(0, 0.3, 0),  // Gentle rise
    variation: 0.3,
  },
  longing: {
    speed: 0.004,
    turbulence: 0.6,
    direction: new THREE.Vector3(0, -0.2, 0), // Slight fall
    variation: 0.5,
  },
  awe: {
    speed: 0.002,
    turbulence: 0.8,
    direction: new THREE.Vector3(0, 0, 0),    // Suspended
    variation: 0.9,
  },
  serenity: {
    speed: 0.002,
    turbulence: 0.1,
    direction: new THREE.Vector3(0, 0.1, 0),
    variation: 0.2,
  },
  elation: {
    speed: 0.01,
    turbulence: 0.7,
    direction: new THREE.Vector3(0, 1, 0),    // Strong upward
    variation: 0.8,
  },
  nostalgia: {
    speed: 0.003,
    turbulence: 0.4,
    direction: new THREE.Vector3(-0.2, -0.3, 0), // Gentle drift down-left
    variation: 0.4,
  },
  completion: {
    speed: 0.004,
    turbulence: 0.3,
    direction: new THREE.Vector3(0, 0, 0),
    variation: 0.3,
  },
  wonder: {
    speed: 0.006,
    turbulence: 0.6,
    direction: new THREE.Vector3(0, 0.5, 0),
    variation: 0.6,
  },
  grace: {
    speed: 0.005,
    turbulence: 0.2,
    direction: new THREE.Vector3(0.2, 0.4, 0), // Gentle arc
    variation: 0.2,
  },
  courage: {
    speed: 0.007,
    turbulence: 0.4,
    direction: new THREE.Vector3(0, 0.6, 0),
    variation: 0.5,
  },
};

/**
 * Glint/sparkle configurations
 */
export type GlintConfig = {
  frequency: number;     // Glints per second (0.1-2)
  intensity: number;     // Brightness (0-1)
  duration: number;      // Glint duration in ms (100-800)
  scatter: number;       // Spatial scatter (0-1)
};

/**
 * Emotion to glint mapping
 */
export const EMOTION_GLINTS: Record<string, GlintConfig> = {
  joy: {
    frequency: 1.5,
    intensity: 0.9,
    duration: 300,
    scatter: 0.8,
  },
  tenderness: {
    frequency: 0.4,
    intensity: 0.6,
    duration: 600,
    scatter: 0.3,
  },
  longing: {
    frequency: 0.3,
    intensity: 0.5,
    duration: 800,
    scatter: 0.4,
  },
  awe: {
    frequency: 0.8,
    intensity: 1.0,
    duration: 500,
    scatter: 0.9,
  },
  serenity: {
    frequency: 0.2,
    intensity: 0.4,
    duration: 700,
    scatter: 0.2,
  },
  elation: {
    frequency: 2.0,
    intensity: 1.0,
    duration: 200,
    scatter: 1.0,
  },
  nostalgia: {
    frequency: 0.3,
    intensity: 0.5,
    duration: 700,
    scatter: 0.3,
  },
  completion: {
    frequency: 0.5,
    intensity: 0.7,
    duration: 500,
    scatter: 0.5,
  },
  wonder: {
    frequency: 1.0,
    intensity: 0.8,
    duration: 400,
    scatter: 0.7,
  },
  grace: {
    frequency: 0.6,
    intensity: 0.6,
    duration: 600,
    scatter: 0.4,
  },
  courage: {
    frequency: 0.7,
    intensity: 0.8,
    duration: 400,
    scatter: 0.6,
  },
};

/**
 * Ambient emotion layer manager
 */
export class AmbientEmotionLayer {
  private currentEmotion: string = 'serenity';
  private breathingTimeline: gsap.core.Timeline | null = null;
  private glintInterval: number | null = null;
  private driftAnimationFrame: number | null = null;
  private particleSystem: THREE.Points | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private startTime: number = Date.now();

  /**
   * Set the current emotion (updates breathing, drift, glints)
   */
  setEmotion(emotion: string): void {
    if (this.currentEmotion === emotion) return;

    console.log(`[AmbientEmotion] Transitioning to: ${emotion}`);
    this.currentEmotion = emotion;

    // Update breathing pattern
    this.updateBreathing();

    // Update glint pattern
    this.updateGlints();

    // Drift is updated per-frame, no action needed
  }

  /**
   * Start ambient breathing animation
   */
  private updateBreathing(): void {
    // Stop existing timeline
    if (this.breathingTimeline) {
      this.breathingTimeline.kill();
    }

    const pattern = EMOTION_BREATHING[this.currentEmotion] || EMOTION_BREATHING.serenity;
    const cycleDuration = 60 / pattern.rate; // Seconds per breath

    // Create breathing timeline
    this.breathingTimeline = gsap.timeline({ repeat: -1 });

    // Inhale
    this.breathingTimeline.to(this, {
      breathValue: pattern.depth,
      duration: cycleDuration * 0.4,
      ease: pattern.easing,
      onUpdate: () => {
        this.applyBreathing();
      },
    });

    // Hold at peak (if specified)
    if (pattern.hold?.peak) {
      this.breathingTimeline.to(this, {
        duration: pattern.hold.peak,
      });
    }

    // Exhale
    this.breathingTimeline.to(this, {
      breathValue: -pattern.depth * 0.5, // Slight dip below baseline
      duration: cycleDuration * 0.4,
      ease: pattern.easing,
      onUpdate: () => {
        this.applyBreathing();
      },
    });

    // Hold at trough (if specified)
    if (pattern.hold?.trough) {
      this.breathingTimeline.to(this, {
        duration: pattern.hold.trough,
      });
    }

    // Return to baseline
    this.breathingTimeline.to(this, {
      breathValue: 0,
      duration: cycleDuration * 0.2,
      ease: pattern.easing,
      onUpdate: () => {
        this.applyBreathing();
      },
    });
  }

  private breathValue: number = 0;

  /**
   * Apply breathing to scene elements
   */
  private applyBreathing(): void {
    // Scale ambient light intensity
    if (this.ambientLight) {
      const baseIntensity = 1.0;
      this.ambientLight.intensity = baseIntensity + this.breathValue * 0.3;
    }

    // Scale particle system
    if (this.particleSystem) {
      const baseScale = 1.0;
      this.particleSystem.scale.setScalar(baseScale + this.breathValue * 0.1);
    }
  }

  /**
   * Update glint pattern
   */
  private updateGlints(): void {
    // Clear existing interval
    if (this.glintInterval !== null) {
      clearInterval(this.glintInterval);
    }

    const config = EMOTION_GLINTS[this.currentEmotion] || EMOTION_GLINTS.serenity;
    const intervalMs = 1000 / config.frequency;

    this.glintInterval = window.setInterval(() => {
      this.spawnGlint(config);
    }, intervalMs);
  }

  /**
   * Spawn a single glint
   */
  private spawnGlint(config: GlintConfig): void {
    if (!this.particleSystem) return;

    const geometry = this.particleSystem.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.customColor?.array as Float32Array;

    if (!positions || !colors) return;

    // Select random particle
    const particleCount = positions.length / 3;
    const index = Math.floor(Math.random() * particleCount);

    // Store original color
    const originalColor = new THREE.Color(
      colors[index * 3],
      colors[index * 3 + 1],
      colors[index * 3 + 2]
    );

    // Glint color (brighter)
    const glintColor = originalColor.clone().multiplyScalar(1.0 + config.intensity);

    // Animate glint
    const obj = { t: 0 };
    gsap.to(obj, {
      t: 1,
      duration: config.duration / 1000,
      ease: 'power2.out',
      onUpdate: () => {
        const lerpedColor = originalColor.clone().lerp(glintColor, Math.sin(obj.t * Math.PI));
        colors[index * 3] = lerpedColor.r;
        colors[index * 3 + 1] = lerpedColor.g;
        colors[index * 3 + 2] = lerpedColor.b;
        geometry.attributes.customColor.needsUpdate = true;
      },
    });
  }

  /**
   * Update particle drift (call in animation loop)
   */
  updateDrift(deltaTime: number): void {
    if (!this.particleSystem) return;

    const drift = EMOTION_DRIFT[this.currentEmotion] || EMOTION_DRIFT.serenity;
    const geometry = this.particleSystem.geometry;
    const positions = geometry.attributes.position.array as Float32Array;

    const time = (Date.now() - this.startTime) / 1000;

    for (let i = 0; i < positions.length; i += 3) {
      // Apply primary drift direction
      positions[i] += drift.direction.x * drift.speed * deltaTime;
      positions[i + 1] += drift.direction.y * drift.speed * deltaTime;
      positions[i + 2] += drift.direction.z * drift.speed * deltaTime;

      // Apply turbulence (simplex noise would be ideal, using sin approximation)
      const noiseX = Math.sin(time * 0.5 + positions[i] * 0.1) * drift.turbulence;
      const noiseY = Math.sin(time * 0.7 + positions[i + 1] * 0.1) * drift.turbulence;
      const noiseZ = Math.sin(time * 0.3 + positions[i + 2] * 0.1) * drift.turbulence;

      positions[i] += noiseX * drift.speed * deltaTime;
      positions[i + 1] += noiseY * drift.speed * deltaTime;
      positions[i + 2] += noiseZ * drift.speed * deltaTime;

      // Wrap particles that drift too far
      if (positions[i + 1] > 10) positions[i + 1] = -10;
      if (positions[i + 1] < -10) positions[i + 1] = 10;
    }

    geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Attach to scene elements
   */
  attach(options: {
    particleSystem?: THREE.Points;
    ambientLight?: THREE.AmbientLight;
  }): void {
    this.particleSystem = options.particleSystem || null;
    this.ambientLight = options.ambientLight || null;

    // Start breathing and glints
    this.updateBreathing();
    this.updateGlints();
  }

  /**
   * Start drift animation loop
   */
  startDrift(): void {
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      this.updateDrift(deltaTime);

      this.driftAnimationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Stop drift animation loop
   */
  stopDrift(): void {
    if (this.driftAnimationFrame !== null) {
      cancelAnimationFrame(this.driftAnimationFrame);
      this.driftAnimationFrame = null;
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopDrift();

    if (this.breathingTimeline) {
      this.breathingTimeline.kill();
      this.breathingTimeline = null;
    }

    if (this.glintInterval !== null) {
      clearInterval(this.glintInterval);
      this.glintInterval = null;
    }

    this.particleSystem = null;
    this.ambientLight = null;
  }
}

/**
 * React hook for ambient emotion layer
 */
export function useAmbientEmotion(
  emotion: string,
  options?: {
    particleSystem?: THREE.Points;
    ambientLight?: THREE.AmbientLight;
  }
) {
  const layerRef = React.useRef<AmbientEmotionLayer | null>(null);

  React.useEffect(() => {
    // Initialize layer
    if (!layerRef.current) {
      layerRef.current = new AmbientEmotionLayer();
      if (options) {
        layerRef.current.attach(options);
      }
      layerRef.current.startDrift();
    }

    // Update emotion
    layerRef.current.setEmotion(emotion);

    return () => {
      layerRef.current?.dispose();
      layerRef.current = null;
    };
  }, [emotion, options?.particleSystem, options?.ambientLight]);

  return layerRef.current;
}

// Note: Need to import React for hook
import React from 'react';

export default AmbientEmotionLayer;
