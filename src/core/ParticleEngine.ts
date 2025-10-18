/**
 * ParticleEngine.ts
 *
 * Life emerges from small things moving with purpose.
 * Each particle is a photon of affection, drifting through the void.
 *
 * Philosophy: Beauty is born from multiplicity.
 * A thousand tiny lights become one overwhelming glow.
 */

import * as THREE from 'three';

export interface ParticleConfig {
  count: number;
  size: number;
  color: string | string[]; // Single color or array for variety
  spread: number; // How far particles spread in 3D space
  opacity: number;
  speed: number; // Base movement speed
  randomness: number; // 0-1, how chaotic the motion
}

export interface ParticleSystemOptions extends Partial<ParticleConfig> {
  type?: 'stars' | 'dust' | 'petals' | 'sparks';
}

export class ParticleSystem {
  public points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private velocities: Float32Array;
  private config: ParticleConfig;

  constructor(options: ParticleSystemOptions = {}) {
    // Default configuration
    this.config = {
      count: options.count ?? 1000,
      size: options.size ?? 0.1,
      color: options.color ?? '#ffffff',
      spread: options.spread ?? 10,
      opacity: options.opacity ?? 0.8,
      speed: options.speed ?? 0.01,
      randomness: options.randomness ?? 0.5,
    };

    // Geometry setup
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.config.count * 3);
    this.velocities = new Float32Array(this.config.count * 3);

    this.initializeParticles(options.type || 'stars');

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    );

    // Material setup with alpha blending for that soft glow
    this.material = new THREE.PointsMaterial({
      size: this.config.size,
      color: Array.isArray(this.config.color)
        ? this.config.color[0]
        : this.config.color,
      transparent: true,
      opacity: this.config.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  /**
   * Initialize particle positions based on type
   */
  private initializeParticles(type: 'stars' | 'dust' | 'petals' | 'sparks'): void {
    for (let i = 0; i < this.config.count; i++) {
      const i3 = i * 3;

      switch (type) {
        case 'stars':
          // Spherical distribution (like a celestial dome)
          const radius = this.config.spread * (0.5 + Math.random() * 0.5);
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);

          this.positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          this.positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          this.positions[i3 + 2] = radius * Math.cos(phi);
          break;

        case 'dust':
          // Random cloud distribution
          this.positions[i3] = (Math.random() - 0.5) * this.config.spread;
          this.positions[i3 + 1] = (Math.random() - 0.5) * this.config.spread;
          this.positions[i3 + 2] = (Math.random() - 0.5) * this.config.spread;
          break;

        case 'petals':
          // Falling from above
          this.positions[i3] = (Math.random() - 0.5) * this.config.spread;
          this.positions[i3 + 1] = Math.random() * this.config.spread;
          this.positions[i3 + 2] = (Math.random() - 0.5) * this.config.spread * 0.5;
          break;

        case 'sparks':
          // Exploding from center
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * this.config.spread * 0.3;
          this.positions[i3] = Math.cos(angle) * distance;
          this.positions[i3 + 1] = (Math.random() - 0.5) * distance;
          this.positions[i3 + 2] = Math.sin(angle) * distance;
          break;
      }

      // Initialize velocities
      this.velocities[i3] = (Math.random() - 0.5) * this.config.speed;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * this.config.speed;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * this.config.speed;
    }
  }

  /**
   * Animate particles each frame
   * Like breathing — subtle, constant, alive
   */
  update(deltaTime: number = 0.016): void {
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.config.count; i++) {
      const i3 = i * 3;

      // Apply velocity with randomness
      positions[i3] += this.velocities[i3] * deltaTime * 60;
      positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime * 60;
      positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime * 60;

      // Add organic drift
      if (this.config.randomness > 0) {
        positions[i3] += Math.sin(Date.now() * 0.001 + i) * 0.001 * this.config.randomness;
        positions[i3 + 1] += Math.cos(Date.now() * 0.001 + i) * 0.001 * this.config.randomness;
      }

      // Boundary wrapping (particles that drift too far return)
      const limit = this.config.spread;
      if (Math.abs(positions[i3]) > limit) positions[i3] *= -0.9;
      if (Math.abs(positions[i3 + 1]) > limit) positions[i3 + 1] *= -0.9;
      if (Math.abs(positions[i3 + 2]) > limit) positions[i3 + 2] *= -0.9;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Pulse the particles (for beat-synced animations)
   */
  pulse(intensity: number = 1.5, duration: number = 0.5): void {
    const originalSize = this.material.size;
    this.material.size = originalSize * intensity;

    // Ease back to original
    const startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic

      this.material.size = originalSize * (1 + (intensity - 1) * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  /**
   * Change color gradually
   */
  transitionColor(targetColor: string, duration: number = 2): void {
    const startColor = new THREE.Color(this.material.color);
    const endColor = new THREE.Color(targetColor);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      this.material.color.lerpColors(startColor, endColor, progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

/**
 * Factory function for quick particle system creation
 */
export function createParticleSystem(
  type: 'stars' | 'dust' | 'petals' | 'sparks',
  options?: ParticleSystemOptions
): ParticleSystem {
  return new ParticleSystem({ ...options, type });
}

export default ParticleSystem;
