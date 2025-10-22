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

export interface HapticSettings {
  enabled: boolean;
  intensity: number; // 0-1
}

export type DeviceTier = 'low' | 'mid' | 'high' | 'ultra';

interface SettingsStore {
  // Current quality preset
  quality: QualityPreset;

  // Performance settings
  performance: PerformanceSettings;

  // Accessibility settings
  accessibility: AccessibilitySettings;

  // Haptic settings (Phase 4)
  haptics: HapticSettings;

  // Device detection
  isMobile: boolean;
  isLowEnd: boolean;
  deviceTier: DeviceTier;

  // Actions
  setQuality: (preset: QualityPreset) => void;
  setAccessibility: (key: keyof AccessibilitySettings, value: boolean) => void;
  setHaptics: (settings: Partial<HapticSettings>) => void;
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

// Detect device tier (Phase 4 integration)
function detectDeviceTier(): DeviceTier {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // 4-tier system
  if (cores >= 8 && memory >= 8 && !isMobile) {
    return 'ultra'; // Desktop high-end (RTX 3060+, M1 Pro+)
  } else if (cores >= 6 && memory >= 6) {
    return 'high'; // High-end phones (iPhone 14+, Snapdragon 8 Gen 2+)
  } else if (cores >= 4 && memory >= 4) {
    return 'mid'; // Mid-range phones
  } else {
    return 'low'; // Low-end phones, old devices
  }
}

// Detect device capabilities
function detectDevice(): { isMobile: boolean; isLowEnd: boolean; deviceTier: DeviceTier; recommendedQuality: QualityPreset } {
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

  // Determine device tier (Phase 4)
  const deviceTier = detectDeviceTier();

  // Determine if device is low-end
  const isLowEnd = deviceTier === 'low' || deviceTier === 'mid';

  // Recommend quality based on device tier
  const tierToQuality: Record<DeviceTier, QualityPreset> = {
    low: 'low',
    mid: 'medium',
    high: 'high',
    ultra: 'ultra',
  };
  const recommendedQuality = tierToQuality[deviceTier];

  console.log('[SettingsManager] Device detection:', {
    isMobile,
    isLowEnd,
    deviceTier,
    cores,
    memory,
    renderer,
    recommendedQuality,
  });

  return { isMobile, isLowEnd, deviceTier, recommendedQuality };
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

      haptics: {
        enabled: true,
        intensity: 1.0,
      },

      isMobile: false,
      isLowEnd: false,
      deviceTier: 'high',

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

      setHaptics: (settings: Partial<HapticSettings>) => {
        set({
          haptics: {
            ...get().haptics,
            ...settings,
          },
        });

        console.log(`[SettingsManager] Haptics updated:`, settings);
      },

      detectDeviceCapabilities: () => {
        const { isMobile, isLowEnd, deviceTier, recommendedQuality } = detectDevice();

        set({
          isMobile,
          isLowEnd,
          deviceTier,
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
