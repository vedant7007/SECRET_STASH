/**
 * SettingsManager.ts
 *
 * Centralized performance and accessibility settings
 * Adapts the experience to device capabilities and user preferences
 *
 * Philosophy: Beauty should be accessible to everyone, on every device.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface PerformanceSettings {
  // Particle counts
  heroParticles: number;
  galaxyParticles: number;
  gardenPetals: number;
  rainDrops: number;

  // Visual effects
  enableBloom: boolean;
  enableChromaticAberration: boolean;
  enableVolumetricLight: boolean;
  enableParallax: boolean;

  // Shader quality
  shaderPrecision: 'lowp' | 'mediump' | 'highp';

  // Performance
  targetFPS: number;
  pixelRatio: number;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  enableCaptions: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  audioDescriptions: boolean;
}

interface SettingsStore {
  // Current quality preset
  quality: QualityPreset;

  // Performance settings
  performance: PerformanceSettings;

  // Accessibility settings
  accessibility: AccessibilitySettings;

  // Device detection
  isMobile: boolean;
  isLowEnd: boolean;

  // Actions
  setQuality: (preset: QualityPreset) => void;
  setAccessibility: (key: keyof AccessibilitySettings, value: boolean) => void;
  detectDeviceCapabilities: () => void;
}

// Quality presets based on device capabilities
// CINEMATIC REBUILD: Optimized for stable 60FPS across all tiers
const QUALITY_PRESETS: Record<QualityPreset, PerformanceSettings> = {
  low: {
    heroParticles: 300,
    galaxyParticles: 600,
    gardenPetals: 15,
    rainDrops: 80,
    enableBloom: false,
    enableChromaticAberration: false,
    enableVolumetricLight: false,
    enableParallax: false,
    shaderPrecision: 'lowp',
    targetFPS: 30,
    pixelRatio: 1,
  },
  medium: {
    heroParticles: 800,
    galaxyParticles: 1200,
    gardenPetals: 30,
    rainDrops: 200,
    enableBloom: true,
    enableChromaticAberration: false,
    enableVolumetricLight: true,
    enableParallax: true,
    shaderPrecision: 'mediump',
    targetFPS: 50,
    pixelRatio: 1.5,
  },
  high: {
    heroParticles: 1500,
    galaxyParticles: 2000,
    gardenPetals: 50,
    rainDrops: 500,
    enableBloom: true,
    enableChromaticAberration: true,
    enableVolumetricLight: true,
    enableParallax: true,
    shaderPrecision: 'mediump',
    targetFPS: 60,
    pixelRatio: 2,
  },
  ultra: {
    heroParticles: 2500,
    galaxyParticles: 3500,
    gardenPetals: 80,
    rainDrops: 1200,
    enableBloom: true,
    enableChromaticAberration: true,
    enableVolumetricLight: true,
    enableParallax: true,
    shaderPrecision: 'highp',
    targetFPS: 60,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  },
};

// Detect device capabilities
function detectDevice(): { isMobile: boolean; isLowEnd: boolean; recommendedQuality: QualityPreset } {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;

  // Check memory (if available)
  const memory = (navigator as any).deviceMemory || 4;

  // Check GPU tier (basic heuristic)
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

  // Determine if device is low-end
  const isLowEnd = cores < 4 || memory < 4 || isMobile;

  // Recommend quality based on capabilities
  let recommendedQuality: QualityPreset;
  if (isLowEnd) {
    recommendedQuality = isMobile ? 'low' : 'medium';
  } else if (cores >= 8 && memory >= 8) {
    recommendedQuality = 'ultra';
  } else {
    recommendedQuality = 'high';
  }

  console.log('[SettingsManager] Device detection:', {
    isMobile,
    isLowEnd,
    cores,
    memory,
    renderer,
    recommendedQuality,
  });

  return { isMobile, isLowEnd, recommendedQuality };
}

// Check for prefers-reduced-motion
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Create the settings store
const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      quality: 'high',

      performance: QUALITY_PRESETS.high,

      accessibility: {
        reducedMotion: prefersReducedMotion(),
        enableCaptions: true,
        highContrast: false,
        keyboardNavigation: true,
        audioDescriptions: false,
      },

      isMobile: false,
      isLowEnd: false,

      setQuality: (preset: QualityPreset) => {
        set({
          quality: preset,
          performance: QUALITY_PRESETS[preset],
        });

        console.log(`[SettingsManager] Quality set to: ${preset}`, QUALITY_PRESETS[preset]);
      },

      setAccessibility: (key: keyof AccessibilitySettings, value: boolean) => {
        set({
          accessibility: {
            ...get().accessibility,
            [key]: value,
          },
        });

        console.log(`[SettingsManager] Accessibility: ${key} = ${value}`);
      },

      detectDeviceCapabilities: () => {
        const { isMobile, isLowEnd, recommendedQuality } = detectDevice();

        set({
          isMobile,
          isLowEnd,
          quality: recommendedQuality,
          performance: QUALITY_PRESETS[recommendedQuality],
        });

        // Override with reduced motion if user prefers
        if (prefersReducedMotion()) {
          set({
            accessibility: {
              ...get().accessibility,
              reducedMotion: true,
            },
            performance: {
              ...get().performance,
              enableParallax: false,
            },
          });
        }
      },
    }),
    {
      name: 'loveverse-settings',
    }
  )
);

export default useSettingsStore;
