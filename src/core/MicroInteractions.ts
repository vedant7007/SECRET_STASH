/**
 * MicroInteractions.ts — PHASE 5: MICRO-INTERACTION POLISH
 *
 * Hover → soft glow, Tap → spark/petal burst, Long-press → lingering halo, Drag → depth shift
 * Every touch is a ripple of intention
 *
 * Philosophy: The smallest gestures deserve the most beautiful responses.
 * Details build trust in magic.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Micro-interaction types
 */
export type MicroInteractionType =
  | 'hover-glow'         // Soft glow on hover
  | 'tap-spark'          // Spark burst on tap
  | 'tap-petal'          // Petal burst on tap
  | 'longpress-halo'     // Lingering halo on long-press
  | 'drag-depth'         // Depth shift on drag
  | 'ripple'             // Radial ripple from point
  | 'shimmer'            // Shimmer wave across surface
  | 'bloom';             // Bloom expansion

/**
 * Hover glow configuration
 */
export interface HoverGlowConfig {
  color: string;
  intensity: number;      // 0-1
  radius: number;         // Glow radius (px or world units)
  duration: number;       // Fade-in duration (ms)
  easing: string;
}

/**
 * Tap spark configuration
 */
export interface TapSparkConfig {
  color: string;
  particleCount: number;  // Number of spark particles (5-20)
  speed: number;          // Expansion speed (0.5-2)
  lifetime: number;       // Particle lifetime (ms)
  spread: number;         // Angular spread (radians)
}

/**
 * Petal burst configuration
 */
export interface PetalBurstConfig {
  color: string;
  petalCount: number;     // Number of petals (3-8)
  speed: number;          // Float speed (0.3-1)
  rotation: number;       // Rotation speed (rad/s)
  lifetime: number;       // Petal lifetime (ms)
}

/**
 * Long-press halo configuration
 */
export interface LongPressHaloConfig {
  color: string;
  maxRadius: number;      // Max halo radius
  growDuration: number;   // Growth duration (ms)
  pulseDuration: number;  // Pulse cycle duration (ms)
  intensity: number;      // Glow intensity (0-1)
}

/**
 * Drag depth shift configuration
 */
export interface DragDepthConfig {
  sensitivity: number;    // Depth per pixel dragged (0.001-0.01)
  maxDepth: number;       // Max depth shift
  damping: number;        // Return damping (0-1)
  easing: string;
}

/**
 * Micro-interaction manager
 */
export class MicroInteractionManager {
  private activeInteractions: Map<string, any> = new Map();
  private scene: THREE.Scene | null = null;

  /**
   * Set the Three.js scene
   */
  setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  /**
   * Hover glow effect
   */
  hoverGlow(
    target: HTMLElement | THREE.Object3D,
    config: Partial<HoverGlowConfig> = {}
  ): () => void {
    const mergedConfig: HoverGlowConfig = {
      color: '#FFD4DC',
      intensity: 0.6,
      radius: 20,
      duration: 300,
      easing: 'power2.out',
      ...config,
    };

    const id = `hover-${Math.random()}`;

    // DOM element
    if (target instanceof HTMLElement) {
      const originalFilter = target.style.filter;
      const originalBoxShadow = target.style.boxShadow;

      const obj = { intensity: 0 };

      const timeline = gsap.to(obj, {
        intensity: mergedConfig.intensity,
        duration: mergedConfig.duration / 1000,
        ease: mergedConfig.easing,
        onUpdate: () => {
          target.style.filter = `brightness(${1 + obj.intensity * 0.3}) drop-shadow(0 0 ${mergedConfig.radius * obj.intensity}px ${mergedConfig.color})`;
          target.style.boxShadow = `0 0 ${mergedConfig.radius * obj.intensity}px ${mergedConfig.color}`;
        },
      });

      this.activeInteractions.set(id, timeline);

      // Cleanup function
      return () => {
        timeline.reverse().then(() => {
          target.style.filter = originalFilter;
          target.style.boxShadow = originalBoxShadow;
          this.activeInteractions.delete(id);
        });
      };
    }

    // Three.js object
    else if (target instanceof THREE.Object3D) {
      // Add point light at object position
      const light = new THREE.PointLight(
        new THREE.Color(mergedConfig.color),
        0,
        mergedConfig.radius
      );
      light.position.copy(target.position);
      this.scene?.add(light);

      const obj = { intensity: 0 };

      const timeline = gsap.to(obj, {
        intensity: mergedConfig.intensity * 2,
        duration: mergedConfig.duration / 1000,
        ease: mergedConfig.easing,
        onUpdate: () => {
          light.intensity = obj.intensity;
        },
      });

      this.activeInteractions.set(id, { timeline, light });

      return () => {
        timeline.reverse().then(() => {
          this.scene?.remove(light);
          this.activeInteractions.delete(id);
        });
      };
    }

    return () => {};
  }

  /**
   * Tap spark effect
   */
  tapSpark(
    position: THREE.Vector3,
    config: Partial<TapSparkConfig> = {}
  ): void {
    const mergedConfig: TapSparkConfig = {
      color: '#FFD700',
      particleCount: 12,
      speed: 1.2,
      lifetime: 800,
      spread: Math.PI * 2,
      ...config,
    };

    if (!this.scene) return;

    // Create spark particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(mergedConfig.particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < mergedConfig.particleCount; i++) {
      // Start at tap position
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // Random velocity
      const angle = (i / mergedConfig.particleCount) * mergedConfig.spread;
      const speed = mergedConfig.speed * (0.8 + Math.random() * 0.4);
      velocities.push(
        new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * speed * 0.3
        )
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(mergedConfig.color),
      size: 0.1,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });

    const sparks = new THREE.Points(geometry, material);
    this.scene.add(sparks);

    // Animate sparks
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / mergedConfig.lifetime;

      if (progress >= 1) {
        this.scene?.remove(sparks);
        geometry.dispose();
        material.dispose();
        return;
      }

      // Update positions
      const positions = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < mergedConfig.particleCount; i++) {
        positions[i * 3] += velocities[i].x * 0.016;
        positions[i * 3 + 1] += velocities[i].y * 0.016;
        positions[i * 3 + 2] += velocities[i].z * 0.016;

        // Apply gravity
        velocities[i].y -= 0.01;
      }
      geometry.attributes.position.needsUpdate = true;

      // Fade out
      material.opacity = 1 - progress;

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Petal burst effect
   */
  petalBurst(
    position: THREE.Vector3,
    config: Partial<PetalBurstConfig> = {}
  ): void {
    const mergedConfig: PetalBurstConfig = {
      color: '#FFB6D9',
      petalCount: 5,
      speed: 0.6,
      rotation: 2,
      lifetime: 2000,
      ...config,
    };

    if (!this.scene) return;

    // Create petal geometry (simple triangle)
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.1, 0.2, 0, 0.4);
    petalShape.quadraticCurveTo(-0.1, 0.2, 0, 0);

    const petalGeometry = new THREE.ShapeGeometry(petalShape);
    const petalMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(mergedConfig.color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
    });

    const petals: THREE.Mesh[] = [];
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < mergedConfig.petalCount; i++) {
      const petal = new THREE.Mesh(petalGeometry, petalMaterial.clone());
      petal.position.copy(position);

      const angle = (i / mergedConfig.petalCount) * Math.PI * 2;
      const speed = mergedConfig.speed * (0.8 + Math.random() * 0.4);
      velocities.push(
        new THREE.Vector3(
          Math.cos(angle) * speed,
          speed * 0.5,
          Math.sin(angle) * speed
        )
      );

      this.scene.add(petal);
      petals.push(petal);
    }

    // Animate petals
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / mergedConfig.lifetime;

      if (progress >= 1) {
        petals.forEach(petal => {
          this.scene?.remove(petal);
          petal.geometry.dispose();
          (petal.material as THREE.Material).dispose();
        });
        return;
      }

      // Update petals
      petals.forEach((petal, i) => {
        petal.position.add(velocities[i].clone().multiplyScalar(0.016));
        petal.rotation.z += mergedConfig.rotation * 0.016;

        // Apply gravity
        velocities[i].y -= 0.008;

        // Fade out
        (petal.material as THREE.MeshBasicMaterial).opacity = 1 - progress;
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Long-press halo effect
   */
  longPressHalo(
    target: HTMLElement | THREE.Vector3,
    config: Partial<LongPressHaloConfig> = {}
  ): () => void {
    const mergedConfig: LongPressHaloConfig = {
      color: '#FFE5B4',
      maxRadius: 100,
      growDuration: 800,
      pulseDuration: 1500,
      intensity: 0.8,
      ...config,
    };

    const id = `halo-${Math.random()}`;

    // DOM element
    if (target instanceof HTMLElement) {
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '50%';
      overlay.style.left = '50%';
      overlay.style.transform = 'translate(-50%, -50%)';
      overlay.style.width = '0px';
      overlay.style.height = '0px';
      overlay.style.borderRadius = '50%';
      overlay.style.background = `radial-gradient(circle, ${mergedConfig.color}80, transparent 70%)`;
      overlay.style.pointerEvents = 'none';
      target.appendChild(overlay);

      const obj = { radius: 0 };

      // Grow halo
      const growTimeline = gsap.to(obj, {
        radius: mergedConfig.maxRadius,
        duration: mergedConfig.growDuration / 1000,
        ease: 'power2.out',
        onUpdate: () => {
          overlay.style.width = `${obj.radius * 2}px`;
          overlay.style.height = `${obj.radius * 2}px`;
        },
        onComplete: () => {
          // Start pulse
          const pulseTimeline = gsap.to(overlay.style, {
            opacity: 0.6,
            duration: mergedConfig.pulseDuration / 1000,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });

          this.activeInteractions.set(id, { growTimeline, pulseTimeline, overlay });
        },
      });

      // Cleanup function
      return () => {
        const interaction = this.activeInteractions.get(id);
        if (interaction) {
          interaction.growTimeline?.kill();
          interaction.pulseTimeline?.kill();
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              overlay.remove();
            },
          });
          this.activeInteractions.delete(id);
        }
      };
    }

    // Three.js position
    else if (target instanceof THREE.Vector3 && this.scene) {
      // Create halo ring geometry
      const haloGeometry = new THREE.RingGeometry(0, 0, 32);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(mergedConfig.color),
        transparent: true,
        opacity: mergedConfig.intensity,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.position.copy(target);
      this.scene.add(halo);

      const obj = { radius: 0 };

      // Grow halo
      const growTimeline = gsap.to(obj, {
        radius: mergedConfig.maxRadius * 0.01, // World units
        duration: mergedConfig.growDuration / 1000,
        ease: 'power2.out',
        onUpdate: () => {
          halo.scale.setScalar(obj.radius);
        },
        onComplete: () => {
          // Start pulse
          const pulseTimeline = gsap.to(haloMaterial, {
            opacity: mergedConfig.intensity * 0.6,
            duration: mergedConfig.pulseDuration / 1000,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });

          this.activeInteractions.set(id, { growTimeline, pulseTimeline, halo });
        },
      });

      return () => {
        const interaction = this.activeInteractions.get(id);
        if (interaction) {
          interaction.growTimeline?.kill();
          interaction.pulseTimeline?.kill();
          gsap.to(haloMaterial, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              this.scene?.remove(halo);
              haloGeometry.dispose();
              haloMaterial.dispose();
            },
          });
          this.activeInteractions.delete(id);
        }
      };
    }

    return () => {};
  }

  /**
   * Drag depth shift (returns cleanup function)
   */
  dragDepthShift(
    camera: THREE.Camera,
    config: Partial<DragDepthConfig> = {}
  ): (delta: { x: number; y: number }) => void {
    const mergedConfig: DragDepthConfig = {
      sensitivity: 0.005,
      maxDepth: 3,
      damping: 0.85,
      easing: 'power2.out',
      ...config,
    };

    const originalZ = camera.position.z;
    let currentDepth = 0;

    return (delta: { x: number; y: number }) => {
      // Calculate depth shift from vertical drag
      const depthShift = -delta.y * mergedConfig.sensitivity;
      currentDepth = THREE.MathUtils.clamp(
        currentDepth + depthShift,
        -mergedConfig.maxDepth,
        mergedConfig.maxDepth
      );

      // Apply to camera
      gsap.to(camera.position, {
        z: originalZ + currentDepth,
        duration: 0.3,
        ease: mergedConfig.easing,
      });

      // Apply damping
      currentDepth *= mergedConfig.damping;
    };
  }

  /**
   * Cleanup all active interactions
   */
  dispose(): void {
    this.activeInteractions.forEach((interaction) => {
      if (interaction.timeline) {
        interaction.timeline.kill();
      }
      if (interaction.pulseTimeline) {
        interaction.pulseTimeline.kill();
      }
      if (interaction.overlay) {
        interaction.overlay.remove();
      }
      if (interaction.light) {
        this.scene?.remove(interaction.light);
      }
      if (interaction.halo) {
        this.scene?.remove(interaction.halo);
      }
    });

    this.activeInteractions.clear();
  }
}

/**
 * React hook for micro-interactions
 */
export function useMicroInteractions(scene?: THREE.Scene) {
  const managerRef = React.useRef<MicroInteractionManager | null>(null);

  React.useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new MicroInteractionManager();
    }

    if (scene) {
      managerRef.current.setScene(scene);
    }

    return () => {
      managerRef.current?.dispose();
    };
  }, [scene]);

  return managerRef.current;
}

import React from 'react';

export default MicroInteractionManager;
