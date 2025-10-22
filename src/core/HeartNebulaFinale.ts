/**
 * HeartNebulaFinale.ts — PHASE 5: FINALE ARCHITECTURE
 *
 * Heart Nebula transformation: particle convergence, bloom, flare, slow eclipse
 * The confession moment — emotional arrival, not "next page"
 *
 * Philosophy: The finale should land like a held breath released.
 * Not announced. Earned.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Heart nebula stages
 */
export type HeartNebulaStage =
  | 'anticipation'       // Pre-finale pause (2s)
  | 'gathering'          // Particles converge to center (4s)
  | 'heartbeat'          // Double-pulse formation (1.5s)
  | 'bloom'              // Heart-shaped nebula expands (5s)
  | 'flare'              // Brightness peak (2s)
  | 'eclipse'            // Slow waterfall fade (8s)
  | 'afterglow';         // Lingering glow (infinite)

/**
 * Finale configuration
 */
export interface FinaleConfig {
  particleCount: number;     // Particles to use for heart formation
  bloomIntensity: number;    // Bloom strength (0-2)
  heartScale: number;        // Heart size multiplier (0.5-2)
  emotionColor: string;      // Primary color
  accentColor: string;       // Secondary/flare color
  timings?: {                // Optional custom timings (seconds)
    anticipation?: number;
    gathering?: number;
    heartbeat?: number;
    bloom?: number;
    flare?: number;
    eclipse?: number;
  };
}

/**
 * Default finale timings
 */
const DEFAULT_TIMINGS = {
  anticipation: 2,
  gathering: 4,
  heartbeat: 1.5,
  bloom: 5,
  flare: 2,
  eclipse: 8,
};

/**
 * Heart shape path (parametric)
 */
function heartShape(t: number): THREE.Vector3 {
  // Heart curve: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);

  return new THREE.Vector3(x * 0.1, y * 0.1, 0);
}

/**
 * Heart Nebula Finale orchestrator
 */
export class HeartNebulaFinale {
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  private particleSystem: THREE.Points | null = null;
  private heartMesh: THREE.Mesh | null = null;
  private currentStage: HeartNebulaStage = 'anticipation';
  private stageTimeline: gsap.core.Timeline | null = null;
  private config: FinaleConfig;
  private onStageChange: ((stage: HeartNebulaStage) => void) | null = null;
  private originalParticlePositions: Float32Array | null = null;

  constructor(config: Partial<FinaleConfig> = {}) {
    this.config = {
      particleCount: 3000,
      bloomIntensity: 1.5,
      heartScale: 1.0,
      emotionColor: '#FF6B9D',
      accentColor: '#FFD700',
      timings: DEFAULT_TIMINGS,
      ...config,
    };
  }

  /**
   * Set the Three.js scene and camera
   */
  setScene(scene: THREE.Scene, camera: THREE.Camera): void {
    this.scene = scene;
    this.camera = camera;
  }

  /**
   * Set particle system to transform
   */
  setParticleSystem(particles: THREE.Points): void {
    this.particleSystem = particles;

    // Store original positions
    const positions = particles.geometry.attributes.position.array as Float32Array;
    this.originalParticlePositions = new Float32Array(positions);
  }

  /**
   * Start finale sequence
   */
  async start(onStageChange?: (stage: HeartNebulaStage) => void): Promise<void> {
    if (!this.scene || !this.camera) {
      console.error('[HeartNebulaFinale] Scene or camera not set');
      return;
    }

    this.onStageChange = onStageChange || null;

    console.log('[HeartNebulaFinale] Starting finale sequence');

    // Create timeline
    this.stageTimeline = gsap.timeline();

    // Stage 1: Anticipation (pause, slight brightness dip)
    this.stageTimeline.add(() => this.setStage('anticipation'));
    this.stageTimeline.to({}, { duration: this.config.timings!.anticipation });

    // Stage 2: Gathering (particles converge)
    this.stageTimeline.add(() => this.setStage('gathering'));
    this.stageTimeline.add(() => this.gatherParticles(), '<');
    this.stageTimeline.to({}, { duration: this.config.timings!.gathering });

    // Stage 3: Heartbeat (double-pulse)
    this.stageTimeline.add(() => this.setStage('heartbeat'));
    this.stageTimeline.add(() => this.heartbeatPulse(), '<');
    this.stageTimeline.to({}, { duration: this.config.timings!.heartbeat });

    // Stage 4: Bloom (heart formation expands)
    this.stageTimeline.add(() => this.setStage('bloom'));
    this.stageTimeline.add(() => this.bloomHeart(), '<');
    this.stageTimeline.to({}, { duration: this.config.timings!.bloom });

    // Stage 5: Flare (brightness peak)
    this.stageTimeline.add(() => this.setStage('flare'));
    this.stageTimeline.add(() => this.flarePeak(), '<');
    this.stageTimeline.to({}, { duration: this.config.timings!.flare });

    // Stage 6: Eclipse (slow waterfall fade)
    this.stageTimeline.add(() => this.setStage('eclipse'));
    this.stageTimeline.add(() => this.eclipseFade(), '<');
    this.stageTimeline.to({}, { duration: this.config.timings!.eclipse });

    // Stage 7: Afterglow (lingering)
    this.stageTimeline.add(() => this.setStage('afterglow'));

    await this.stageTimeline.then();
  }

  /**
   * Set current stage
   */
  private setStage(stage: HeartNebulaStage): void {
    this.currentStage = stage;
    console.log(`[HeartNebulaFinale] Stage: ${stage}`);
    this.onStageChange?.(stage);
  }

  /**
   * Stage 2: Gather particles to center
   */
  private gatherParticles(): void {
    if (!this.particleSystem || !this.originalParticlePositions) return;

    const geometry = this.particleSystem.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;

    // Target: center with heart-shaped distribution
    const targetPositions = new Float32Array(positions.length);

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const heartPos = heartShape(t);

      // Add some depth variation
      heartPos.z = (Math.random() - 0.5) * 0.5;

      targetPositions[i * 3] = heartPos.x;
      targetPositions[i * 3 + 1] = heartPos.y;
      targetPositions[i * 3 + 2] = heartPos.z;
    }

    // Animate positions
    const obj = { t: 0 };

    gsap.to(obj, {
      t: 1,
      duration: this.config.timings!.gathering,
      ease: 'power2.inOut',
      onUpdate: () => {
        for (let i = 0; i < count; i++) {
          positions[i * 3] = THREE.MathUtils.lerp(
            this.originalParticlePositions![i * 3],
            targetPositions[i * 3],
            obj.t
          );
          positions[i * 3 + 1] = THREE.MathUtils.lerp(
            this.originalParticlePositions![i * 3 + 1],
            targetPositions[i * 3 + 1],
            obj.t
          );
          positions[i * 3 + 2] = THREE.MathUtils.lerp(
            this.originalParticlePositions![i * 3 + 2],
            targetPositions[i * 3 + 2],
            obj.t
          );
        }
        geometry.attributes.position.needsUpdate = true;
      },
    });
  }

  /**
   * Stage 3: Heartbeat double-pulse
   */
  private heartbeatPulse(): void {
    if (!this.particleSystem) return;

    const timeline = gsap.timeline();

    // First pulse
    timeline.to(this.particleSystem.scale, {
      x: 1.15,
      y: 1.15,
      z: 1.15,
      duration: 0.3,
      ease: 'power2.out',
    });
    timeline.to(this.particleSystem.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.3,
      ease: 'power2.in',
    });

    // Pause
    timeline.to({}, { duration: 0.3 });

    // Second pulse (stronger)
    timeline.to(this.particleSystem.scale, {
      x: 1.25,
      y: 1.25,
      z: 1.25,
      duration: 0.35,
      ease: 'power2.out',
    });
    timeline.to(this.particleSystem.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.35,
      ease: 'power2.in',
    });
  }

  /**
   * Stage 4: Bloom heart expansion
   */
  private bloomHeart(): void {
    if (!this.scene) return;

    // Create heart mesh with glowing material
    const heartShape = this.createHeartGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.config.emotionColor),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });

    this.heartMesh = new THREE.Mesh(heartShape, material);
    this.heartMesh.scale.setScalar(0.1);
    this.scene.add(this.heartMesh);

    // Animate bloom
    gsap.to(this.heartMesh.scale, {
      x: this.config.heartScale,
      y: this.config.heartScale,
      z: this.config.heartScale,
      duration: this.config.timings!.bloom,
      ease: 'power2.out',
    });

    gsap.to(material, {
      opacity: 0.8,
      duration: this.config.timings!.bloom * 0.5,
      ease: 'power1.out',
    });

    // Add glow point light
    const glowLight = new THREE.PointLight(
      new THREE.Color(this.config.emotionColor),
      0,
      10
    );
    this.scene.add(glowLight);

    gsap.to(glowLight, {
      intensity: this.config.bloomIntensity * 2,
      duration: this.config.timings!.bloom,
      ease: 'power2.out',
    });
  }

  /**
   * Stage 5: Flare brightness peak
   */
  private flarePeak(): void {
    if (!this.scene || !this.heartMesh) return;

    const material = this.heartMesh.material as THREE.MeshBasicMaterial;

    // Flash to accent color
    const originalColor = material.color.clone();
    const flareColor = new THREE.Color(this.config.accentColor);

    gsap.to(material.color, {
      r: flareColor.r,
      g: flareColor.g,
      b: flareColor.b,
      duration: this.config.timings!.flare * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        // Return to original
        gsap.to(material.color, {
          r: originalColor.r,
          g: originalColor.g,
          b: originalColor.b,
          duration: this.config.timings!.flare * 0.7,
          ease: 'power2.in',
        });
      },
    });

    // Brightness boost
    gsap.to(material, {
      opacity: 1.0,
      duration: this.config.timings!.flare * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(material, {
          opacity: 0.8,
          duration: this.config.timings!.flare * 0.7,
          ease: 'power2.in',
        });
      },
    });
  }

  /**
   * Stage 6: Eclipse waterfall fade
   */
  private eclipseFade(): void {
    if (!this.heartMesh) return;

    const material = this.heartMesh.material as THREE.MeshBasicMaterial;

    // Slow fade with vertical wipe
    const obj = { wipe: 1 }; // Top to bottom (1 → 0)

    gsap.to(obj, {
      wipe: 0,
      duration: this.config.timings!.eclipse,
      ease: 'power1.in',
      onUpdate: () => {
        // Update shader uniform (if using custom shader)
        // For now, just fade opacity
        material.opacity = obj.wipe * 0.8;
      },
    });

    // Shrink slightly
    gsap.to(this.heartMesh.scale, {
      x: this.config.heartScale * 0.8,
      y: this.config.heartScale * 0.8,
      z: this.config.heartScale * 0.8,
      duration: this.config.timings!.eclipse,
      ease: 'power1.in',
    });
  }

  /**
   * Create heart geometry
   */
  private createHeartGeometry(): THREE.ShapeGeometry {
    const heartShape = new THREE.Shape();

    // Heart path
    heartShape.moveTo(0, 0);
    for (let t = 0; t <= Math.PI * 2; t += 0.1) {
      const pos = heartShape(t);
      heartShape.lineTo(pos.x, pos.y);
    }
    heartShape.closePath();

    return new THREE.ShapeGeometry(heartShape);
  }

  /**
   * Get current stage
   */
  getStage(): HeartNebulaStage {
    return this.currentStage;
  }

  /**
   * Skip to stage
   */
  skipToStage(stage: HeartNebulaStage): void {
    // Cancel current timeline
    this.stageTimeline?.kill();

    // Jump to stage
    this.setStage(stage);

    // Execute stage immediately
    switch (stage) {
      case 'gathering':
        this.gatherParticles();
        break;
      case 'heartbeat':
        this.heartbeatPulse();
        break;
      case 'bloom':
        this.bloomHeart();
        break;
      case 'flare':
        this.flarePeak();
        break;
      case 'eclipse':
        this.eclipseFade();
        break;
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stageTimeline?.kill();

    if (this.heartMesh) {
      this.scene?.remove(this.heartMesh);
      this.heartMesh.geometry.dispose();
      (this.heartMesh.material as THREE.Material).dispose();
    }

    this.scene = null;
    this.camera = null;
    this.particleSystem = null;
    this.heartMesh = null;
    this.originalParticlePositions = null;
  }
}

/**
 * React hook for Heart Nebula finale
 */
export function useHeartNebulaFinale(config?: Partial<FinaleConfig>) {
  const finaleRef = React.useRef<HeartNebulaFinale | null>(null);

  React.useEffect(() => {
    finaleRef.current = new HeartNebulaFinale(config);

    return () => {
      finaleRef.current?.dispose();
      finaleRef.current = null;
    };
  }, []);

  return finaleRef.current;
}

import React from 'react';

export default HeartNebulaFinale;
