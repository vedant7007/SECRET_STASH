/**
 * MelodyEnhancements.ts — PHASE 5: MELODY SPHERE ENHANCEMENTS
 *
 * BPM-based lyric staging, emotion-triggered VFX on key lines,
 * soft reverb tail after emotional peaks, ambient secondary layers
 *
 * Philosophy: Music is already emotional architecture.
 * We're just making its bones visible.
 */

import { Howl } from 'howler';
import { gsap } from 'gsap';
import * as THREE from 'three';

/**
 * Song metadata with BPM and emotion markers
 */
export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  audioPath: string;
  bpm: number;               // Beats per minute
  duration: number;          // Song duration in seconds
  emotion: string;           // Primary emotion
  lyrics: LyricLine[];
  emotionalPeaks: EmotionalPeak[];
  ambientLayer?: AmbientLayerConfig;
}

/**
 * Lyric line with timing and emotion
 */
export interface LyricLine {
  text: string;
  startTime: number;         // Seconds from song start
  duration: number;          // Line duration in seconds
  emotion?: string;          // Emotion for this line (overrides song emotion)
  emphasis?: 'normal' | 'key' | 'climax';  // Visual emphasis level
  beat?: number;             // Beat number (for sync)
}

/**
 * Emotional peak markers (for VFX triggers)
 */
export interface EmotionalPeak {
  time: number;              // Seconds from song start
  emotion: string;
  intensity: number;         // 0-1
  vfx?: 'bloom' | 'ripple' | 'burst' | 'shimmer' | 'heartbeat';
  duration?: number;         // VFX duration in seconds
}

/**
 * Ambient secondary layer (rain, chimes, heartbeat)
 */
export interface AmbientLayerConfig {
  type: 'rain' | 'chimes' | 'heartbeat' | 'wind' | 'waves';
  volume: number;            // 0-1
  fadeIn?: number;           // Fade in duration (seconds)
  fadeOut?: number;          // Fade out duration (seconds)
  startTime?: number;        // When to start ambient layer
  endTime?: number;          // When to end ambient layer
}

/**
 * Reverb configuration
 */
export interface ReverbConfig {
  decay: number;             // Decay time in seconds (0.5-5)
  wet: number;               // Wet signal (0-1)
  dry: number;               // Dry signal (0-1)
}

/**
 * BPM-based lyric stager
 */
export class BPMLyricStager {
  private currentSong: SongMetadata | null = null;
  private currentLyricIndex: number = -1;
  private startTime: number = 0;
  private animationFrame: number | null = null;
  private isPlaying: boolean = false;
  private onLyricReveal: ((line: LyricLine, index: number) => void) | null = null;
  private onPeakTrigger: ((peak: EmotionalPeak) => void) | null = null;

  /**
   * Load a song
   */
  loadSong(song: SongMetadata): void {
    this.currentSong = song;
    this.currentLyricIndex = -1;
  }

  /**
   * Start lyric staging
   */
  start(onLyricReveal: (line: LyricLine, index: number) => void): void {
    if (!this.currentSong) {
      console.warn('[BPMLyricStager] No song loaded');
      return;
    }

    this.startTime = Date.now();
    this.currentLyricIndex = -1;
    this.isPlaying = true;
    this.onLyricReveal = onLyricReveal;

    console.log(`[BPMLyricStager] Started: ${this.currentSong.title} (${this.currentSong.bpm} BPM)`);

    this.update();
  }

  /**
   * Stop lyric staging
   */
  stop(): void {
    this.isPlaying = false;

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Update loop (checks for lyric reveals and peak triggers)
   */
  private update = (): void => {
    if (!this.isPlaying || !this.currentSong) return;

    const elapsed = (Date.now() - this.startTime) / 1000;

    // Check for next lyric
    const nextIndex = this.currentLyricIndex + 1;
    if (
      nextIndex < this.currentSong.lyrics.length &&
      elapsed >= this.currentSong.lyrics[nextIndex].startTime
    ) {
      this.currentLyricIndex = nextIndex;
      const line = this.currentSong.lyrics[nextIndex];
      this.onLyricReveal?.(line, nextIndex);

      console.log(`[BPMLyricStager] Lyric ${nextIndex}: "${line.text.substring(0, 30)}..."`);
    }

    // Check for emotional peaks
    this.currentSong.emotionalPeaks.forEach((peak) => {
      if (Math.abs(elapsed - peak.time) < 0.05) {
        // Within 50ms tolerance
        this.onPeakTrigger?.(peak);
        console.log(`[BPMLyricStager] Peak triggered: ${peak.emotion} (${peak.vfx})`);
      }
    });

    this.animationFrame = requestAnimationFrame(this.update);
  };

  /**
   * Set peak trigger callback
   */
  setPeakCallback(callback: (peak: EmotionalPeak) => void): void {
    this.onPeakTrigger = callback;
  }

  /**
   * Get current beat number
   */
  getCurrentBeat(): number {
    if (!this.currentSong || !this.isPlaying) return 0;

    const elapsed = (Date.now() - this.startTime) / 1000;
    const beatsPerSecond = this.currentSong.bpm / 60;
    return Math.floor(elapsed * beatsPerSecond);
  }

  /**
   * Seek to time
   */
  seek(time: number): void {
    this.startTime = Date.now() - time * 1000;

    // Find current lyric index
    if (this.currentSong) {
      this.currentLyricIndex = this.currentSong.lyrics.findIndex(
        (line) => line.startTime > time
      ) - 1;
    }
  }
}

/**
 * Audio manager with reverb and ambient layers
 */
export class MelodyAudioManager {
  private mainTrack: Howl | null = null;
  private ambientTrack: Howl | null = null;
  private audioContext: AudioContext | null = null;
  private reverbNode: ConvolverNode | null = null;
  private currentReverb: ReverbConfig = { decay: 2, wet: 0.3, dry: 0.7 };

  /**
   * Initialize audio context
   */
  initialize(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Load and play main track
   */
  playTrack(
    audioPath: string,
    options?: {
      volume?: number;
      onLoad?: () => void;
      onEnd?: () => void;
    }
  ): void {
    if (this.mainTrack) {
      this.mainTrack.stop();
      this.mainTrack.unload();
    }

    this.mainTrack = new Howl({
      src: [audioPath],
      volume: options?.volume || 1.0,
      onload: options?.onLoad,
      onend: options?.onEnd,
    });

    this.mainTrack.play();
  }

  /**
   * Play ambient layer
   */
  playAmbientLayer(config: AmbientLayerConfig): void {
    const ambientPaths: Record<string, string> = {
      rain: '/assets/audio/ambient/rain.mp3',
      chimes: '/assets/audio/ambient/chimes.mp3',
      heartbeat: '/assets/audio/ambient/heartbeat.mp3',
      wind: '/assets/audio/ambient/wind.mp3',
      waves: '/assets/audio/ambient/waves.mp3',
    };

    const path = ambientPaths[config.type];
    if (!path) {
      console.warn(`[MelodyAudioManager] Unknown ambient type: ${config.type}`);
      return;
    }

    if (this.ambientTrack) {
      this.ambientTrack.stop();
      this.ambientTrack.unload();
    }

    this.ambientTrack = new Howl({
      src: [path],
      volume: 0,
      loop: true,
    });

    this.ambientTrack.play();

    // Fade in
    this.ambientTrack.fade(0, config.volume, (config.fadeIn || 2) * 1000);

    // Schedule fade out if specified
    if (config.endTime && config.startTime) {
      const duration = (config.endTime - config.startTime) * 1000;
      setTimeout(() => {
        this.ambientTrack?.fade(
          config.volume,
          0,
          (config.fadeOut || 2) * 1000
        );
      }, duration - (config.fadeOut || 2) * 1000);
    }
  }

  /**
   * Apply reverb to main track
   */
  async applyReverb(config: ReverbConfig): Promise<void> {
    if (!this.audioContext) {
      this.initialize();
    }

    if (!this.audioContext) return;

    this.currentReverb = config;

    // Create reverb impulse response
    const impulseResponse = this.createImpulseResponse(
      this.audioContext,
      config.decay
    );

    this.reverbNode = this.audioContext.createConvolver();
    this.reverbNode.buffer = impulseResponse;

    // Note: Howler.js doesn't expose Web Audio nodes directly
    // In production, use tone.js or custom audio routing
    console.log(`[MelodyAudioManager] Reverb applied: decay=${config.decay}s`);
  }

  /**
   * Create impulse response for reverb
   */
  private createImpulseResponse(
    audioContext: AudioContext,
    decay: number
  ): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * decay;
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    return impulse;
  }

  /**
   * Trigger reverb tail after emotional peak
   */
  reverbTail(duration: number = 3): void {
    // Temporarily increase wet signal
    const originalWet = this.currentReverb.wet;

    gsap.to(this.currentReverb, {
      wet: Math.min(originalWet + 0.3, 1),
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        // Decay back
        gsap.to(this.currentReverb, {
          wet: originalWet,
          duration,
          ease: 'power2.in',
        });
      },
    });

    console.log(`[MelodyAudioManager] Reverb tail triggered (${duration}s)`);
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.mainTrack?.stop();
    this.ambientTrack?.stop();
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.mainTrack?.unload();
    this.ambientTrack?.unload();
    this.audioContext?.close();

    this.mainTrack = null;
    this.ambientTrack = null;
    this.audioContext = null;
    this.reverbNode = null;
  }
}

/**
 * VFX trigger for emotional peaks
 */
export class EmotionalPeakVFX {
  private scene: THREE.Scene | null = null;

  setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  /**
   * Trigger VFX based on peak configuration
   */
  trigger(peak: EmotionalPeak, position?: THREE.Vector3): void {
    if (!this.scene) return;

    const pos = position || new THREE.Vector3(0, 0, 0);

    console.log(`[EmotionalPeakVFX] Triggering ${peak.vfx} at ${peak.emotion} intensity=${peak.intensity}`);

    switch (peak.vfx) {
      case 'bloom':
        this.bloomEffect(pos, peak);
        break;
      case 'ripple':
        this.rippleEffect(pos, peak);
        break;
      case 'burst':
        this.burstEffect(pos, peak);
        break;
      case 'shimmer':
        this.shimmerEffect(pos, peak);
        break;
      case 'heartbeat':
        this.heartbeatEffect(pos, peak);
        break;
    }
  }

  private bloomEffect(position: THREE.Vector3, peak: EmotionalPeak): void {
    // Create expanding bloom sphere
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: this.getEmotionColor(peak.emotion),
      transparent: true,
      opacity: peak.intensity,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    this.scene?.add(sphere);

    // Animate
    gsap.to(sphere.scale, {
      x: 3,
      y: 3,
      z: 3,
      duration: peak.duration || 2,
      ease: 'power2.out',
    });

    gsap.to(material, {
      opacity: 0,
      duration: peak.duration || 2,
      ease: 'power2.in',
      onComplete: () => {
        this.scene?.remove(sphere);
        geometry.dispose();
        material.dispose();
      },
    });
  }

  private rippleEffect(position: THREE.Vector3, peak: EmotionalPeak): void {
    // Create expanding ring
    const geometry = new THREE.RingGeometry(0, 0.1, 32);
    const material = new THREE.MeshBasicMaterial({
      color: this.getEmotionColor(peak.emotion),
      transparent: true,
      opacity: peak.intensity,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(position);
    this.scene?.add(ring);

    gsap.to(ring.scale, {
      x: 5,
      y: 5,
      z: 5,
      duration: peak.duration || 1.5,
      ease: 'power1.out',
    });

    gsap.to(material, {
      opacity: 0,
      duration: peak.duration || 1.5,
      ease: 'linear',
      onComplete: () => {
        this.scene?.remove(ring);
        geometry.dispose();
        material.dispose();
      },
    });
  }

  private burstEffect(position: THREE.Vector3, peak: EmotionalPeak): void {
    // Particle burst (similar to tap spark)
    const particleCount = Math.floor(20 * peak.intensity);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const angle = (i / particleCount) * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2 * peak.intensity;

      velocities.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(angle) * speed,
          Math.sin(phi) * Math.sin(angle) * speed,
          Math.cos(phi) * speed
        )
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: this.getEmotionColor(peak.emotion),
      size: 0.15,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    this.scene?.add(particles);

    // Animate
    const duration = peak.duration || 1.5;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= duration) {
        this.scene?.remove(particles);
        geometry.dispose();
        material.dispose();
        return;
      }

      const positions = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i].x * 0.016;
        positions[i * 3 + 1] += velocities[i].y * 0.016;
        positions[i * 3 + 2] += velocities[i].z * 0.016;
      }
      geometry.attributes.position.needsUpdate = true;

      material.opacity = 1 - elapsed / duration;

      requestAnimationFrame(animate);
    };

    animate();
  }

  private shimmerEffect(position: THREE.Vector3, peak: EmotionalPeak): void {
    // Wave of light across scene
    console.log(`[EmotionalPeakVFX] Shimmer effect (${peak.emotion})`);
    // Implementation would use shader-based shimmer wave
  }

  private heartbeatEffect(position: THREE.Vector3, peak: EmotionalPeak): void {
    // Double-pulse effect
    const pulse = (delay: number) => {
      setTimeout(() => {
        this.bloomEffect(position, { ...peak, duration: 0.3, intensity: peak.intensity * 0.8 });
      }, delay);
    };

    pulse(0);
    pulse(300);
  }

  private getEmotionColor(emotion: string): THREE.Color {
    const colors: Record<string, string> = {
      joy: '#FFD700',
      tenderness: '#FFB6D9',
      longing: '#4682B4',
      awe: '#957DAD',
      serenity: '#75E6DA',
      elation: '#FFC107',
      nostalgia: '#A1887F',
      completion: '#9CCC65',
      wonder: '#4FC3F7',
      grace: '#F48FB1',
      courage: '#FF7043',
    };

    return new THREE.Color(colors[emotion] || '#FFFFFF');
  }
}

export default BPMLyricStager;
