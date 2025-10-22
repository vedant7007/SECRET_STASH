/**
 * ResponsiveCalibration.ts — PHASE 4: RESPONSIVE SCENE CALIBRATION
 *
 * Screen-size aware optimization for mobile-first experience
 * Adjusts particle density, shader intensity, and layout based on device
 *
 * Philosophy: Beauty adapts to the canvas.
 * Mobile should feel crafted, not compromised.
 */

import { useState, useEffect } from 'react';

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type DeviceTier = 'low' | 'mid' | 'high' | 'ultra';

export interface ResponsiveConfig {
  screenSize: ScreenSize;
  deviceTier: DeviceTier;
  particleDensity: number;      // 0-1 multiplier
  shaderIntensity: number;       // 0-1 multiplier
  bloomIntensity: number;        // 0-1 multiplier
  parallaxStrength: number;      // 0-1 multiplier
  enablePostProcessing: boolean;
  enableShadows: boolean;
  enableReflections: boolean;
  maxTextureSize: number;
  pixelRatio: number;
}

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TypographyScale {
  emotion: string;
  baseSize: number;
  scaleMultiplier: number;
  lineHeight: number;
  letterSpacing: string;
}

/**
 * Breakpoint definitions
 */
const BREAKPOINTS = {
  xs: 0,      // 0-639px (small phones)
  sm: 640,    // 640-767px (large phones)
  md: 768,    // 768-1023px (tablets)
  lg: 1024,   // 1024-1279px (small desktops)
  xl: 1280,   // 1280px+ (large desktops)
};

/**
 * Responsive configurations per screen size + device tier
 */
const RESPONSIVE_CONFIGS: Record<ScreenSize, Record<DeviceTier, ResponsiveConfig>> = {
  xs: {
    low: {
      screenSize: 'xs',
      deviceTier: 'low',
      particleDensity: 0.2,
      shaderIntensity: 0.3,
      bloomIntensity: 0,
      parallaxStrength: 0,
      enablePostProcessing: false,
      enableShadows: false,
      enableReflections: false,
      maxTextureSize: 512,
      pixelRatio: 1,
    },
    mid: {
      screenSize: 'xs',
      deviceTier: 'mid',
      particleDensity: 0.35,
      shaderIntensity: 0.5,
      bloomIntensity: 0.3,
      parallaxStrength: 0.3,
      enablePostProcessing: true,
      enableShadows: false,
      enableReflections: false,
      maxTextureSize: 1024,
      pixelRatio: 1.5,
    },
    high: {
      screenSize: 'xs',
      deviceTier: 'high',
      particleDensity: 0.5,
      shaderIntensity: 0.7,
      bloomIntensity: 0.5,
      parallaxStrength: 0.5,
      enablePostProcessing: true,
      enableShadows: false,
      enableReflections: true,
      maxTextureSize: 2048,
      pixelRatio: 2,
    },
    ultra: {
      screenSize: 'xs',
      deviceTier: 'ultra',
      particleDensity: 0.6,
      shaderIntensity: 0.8,
      bloomIntensity: 0.7,
      parallaxStrength: 0.6,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 2048,
      pixelRatio: Math.min(window.devicePixelRatio, 3),
    },
  },
  sm: {
    low: {
      screenSize: 'sm',
      deviceTier: 'low',
      particleDensity: 0.3,
      shaderIntensity: 0.4,
      bloomIntensity: 0.2,
      parallaxStrength: 0.2,
      enablePostProcessing: false,
      enableShadows: false,
      enableReflections: false,
      maxTextureSize: 1024,
      pixelRatio: 1,
    },
    mid: {
      screenSize: 'sm',
      deviceTier: 'mid',
      particleDensity: 0.45,
      shaderIntensity: 0.6,
      bloomIntensity: 0.4,
      parallaxStrength: 0.4,
      enablePostProcessing: true,
      enableShadows: false,
      enableReflections: false,
      maxTextureSize: 1024,
      pixelRatio: 1.5,
    },
    high: {
      screenSize: 'sm',
      deviceTier: 'high',
      particleDensity: 0.6,
      shaderIntensity: 0.8,
      bloomIntensity: 0.6,
      parallaxStrength: 0.6,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 2048,
      pixelRatio: 2,
    },
    ultra: {
      screenSize: 'sm',
      deviceTier: 'ultra',
      particleDensity: 0.7,
      shaderIntensity: 0.9,
      bloomIntensity: 0.8,
      parallaxStrength: 0.7,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 2048,
      pixelRatio: Math.min(window.devicePixelRatio, 3),
    },
  },
  md: {
    low: {
      screenSize: 'md',
      deviceTier: 'low',
      particleDensity: 0.5,
      shaderIntensity: 0.6,
      bloomIntensity: 0.4,
      parallaxStrength: 0.5,
      enablePostProcessing: true,
      enableShadows: false,
      enableReflections: false,
      maxTextureSize: 2048,
      pixelRatio: 1.5,
    },
    mid: {
      screenSize: 'md',
      deviceTier: 'mid',
      particleDensity: 0.7,
      shaderIntensity: 0.8,
      bloomIntensity: 0.6,
      parallaxStrength: 0.7,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 2048,
      pixelRatio: 2,
    },
    high: {
      screenSize: 'md',
      deviceTier: 'high',
      particleDensity: 0.85,
      shaderIntensity: 0.9,
      bloomIntensity: 0.8,
      parallaxStrength: 0.85,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: 2,
    },
    ultra: {
      screenSize: 'md',
      deviceTier: 'ultra',
      particleDensity: 1.0,
      shaderIntensity: 1.0,
      bloomIntensity: 1.0,
      parallaxStrength: 1.0,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: Math.min(window.devicePixelRatio, 3),
    },
  },
  lg: {
    low: {
      screenSize: 'lg',
      deviceTier: 'low',
      particleDensity: 0.6,
      shaderIntensity: 0.7,
      bloomIntensity: 0.5,
      parallaxStrength: 0.6,
      enablePostProcessing: true,
      enableShadows: false,
      enableReflections: true,
      maxTextureSize: 2048,
      pixelRatio: 1.5,
    },
    mid: {
      screenSize: 'lg',
      deviceTier: 'mid',
      particleDensity: 0.8,
      shaderIntensity: 0.9,
      bloomIntensity: 0.7,
      parallaxStrength: 0.8,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: 2,
    },
    high: {
      screenSize: 'lg',
      deviceTier: 'high',
      particleDensity: 1.0,
      shaderIntensity: 1.0,
      bloomIntensity: 0.9,
      parallaxStrength: 1.0,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: 2,
    },
    ultra: {
      screenSize: 'lg',
      deviceTier: 'ultra',
      particleDensity: 1.0,
      shaderIntensity: 1.0,
      bloomIntensity: 1.0,
      parallaxStrength: 1.0,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: Math.min(window.devicePixelRatio, 3),
    },
  },
  xl: {
    low: {
      screenSize: 'xl',
      deviceTier: 'low',
      particleDensity: 0.7,
      shaderIntensity: 0.8,
      bloomIntensity: 0.6,
      parallaxStrength: 0.7,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: 1.5,
    },
    mid: {
      screenSize: 'xl',
      deviceTier: 'mid',
      particleDensity: 0.9,
      shaderIntensity: 1.0,
      bloomIntensity: 0.8,
      parallaxStrength: 0.9,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: 2,
    },
    high: {
      screenSize: 'xl',
      deviceTier: 'high',
      particleDensity: 1.0,
      shaderIntensity: 1.0,
      bloomIntensity: 1.0,
      parallaxStrength: 1.0,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: 2,
    },
    ultra: {
      screenSize: 'xl',
      deviceTier: 'ultra',
      particleDensity: 1.0,
      shaderIntensity: 1.0,
      bloomIntensity: 1.0,
      parallaxStrength: 1.0,
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      maxTextureSize: 4096,
      pixelRatio: Math.min(window.devicePixelRatio, 3),
    },
  },
};

/**
 * Typography scaling based on emotion weight
 */
const EMOTION_TYPOGRAPHY: Record<string, TypographyScale> = {
  joy: {
    emotion: 'joy',
    baseSize: 18,
    scaleMultiplier: 1.1,
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  tenderness: {
    emotion: 'tenderness',
    baseSize: 16,
    scaleMultiplier: 1.0,
    lineHeight: 1.7,
    letterSpacing: '0.03em',
  },
  awe: {
    emotion: 'awe',
    baseSize: 20,
    scaleMultiplier: 1.3,
    lineHeight: 1.4,
    letterSpacing: '0.05em',
  },
  serenity: {
    emotion: 'serenity',
    baseSize: 17,
    scaleMultiplier: 1.0,
    lineHeight: 1.8,
    letterSpacing: '0.04em',
  },
  elation: {
    emotion: 'elation',
    baseSize: 19,
    scaleMultiplier: 1.2,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  completion: {
    emotion: 'completion',
    baseSize: 22,
    scaleMultiplier: 1.4,
    lineHeight: 1.3,
    letterSpacing: '0.06em',
  },
  wonder: {
    emotion: 'wonder',
    baseSize: 18,
    scaleMultiplier: 1.1,
    lineHeight: 1.6,
    letterSpacing: '0.03em',
  },
  nostalgia: {
    emotion: 'nostalgia',
    baseSize: 16,
    scaleMultiplier: 0.95,
    lineHeight: 1.9,
    letterSpacing: '0.02em',
  },
};

/**
 * Detect screen size
 */
function detectScreenSize(): ScreenSize {
  const width = window.innerWidth;

  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  return 'xl';
}

/**
 * Detect device tier (already in SettingsManager, but refined here)
 */
function detectDeviceTier(): DeviceTier {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (cores < 4 || memory < 3) return 'low';
  if (isMobile && cores < 6) return 'mid';
  if (cores >= 8 && memory >= 8) return 'ultra';
  return 'high';
}

/**
 * Detect safe area insets (for notched devices)
 */
function detectSafeAreaInsets(): SafeAreaInsets {
  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
}

/**
 * Get responsive configuration
 */
export function getResponsiveConfig(
  screenSize?: ScreenSize,
  deviceTier?: DeviceTier
): ResponsiveConfig {
  const detectedScreenSize = screenSize || detectScreenSize();
  const detectedDeviceTier = deviceTier || detectDeviceTier();

  return RESPONSIVE_CONFIGS[detectedScreenSize][detectedDeviceTier];
}

/**
 * Get typography config for emotion
 */
export function getEmotionTypography(emotion: string, screenSize?: ScreenSize): TypographyScale {
  const baseTypo = EMOTION_TYPOGRAPHY[emotion.toLowerCase()] || EMOTION_TYPOGRAPHY.wonder;
  const detectedScreenSize = screenSize || detectScreenSize();

  // Scale down for mobile
  const mobileScale = detectedScreenSize === 'xs' ? 0.85 : detectedScreenSize === 'sm' ? 0.9 : 1.0;

  return {
    ...baseTypo,
    baseSize: baseTypo.baseSize * mobileScale,
  };
}

/**
 * React hook for responsive configuration
 */
export function useResponsiveConfig() {
  const [config, setConfig] = useState<ResponsiveConfig>(getResponsiveConfig());
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>(detectSafeAreaInsets());
  const [screenSize, setScreenSize] = useState<ScreenSize>(detectScreenSize());

  useEffect(() => {
    const handleResize = () => {
      const newScreenSize = detectScreenSize();
      const newConfig = getResponsiveConfig(newScreenSize);

      setScreenSize(newScreenSize);
      setConfig(newConfig);
      setSafeArea(detectSafeAreaInsets());

      console.log('[ResponsiveCalibration] Resize detected:', {
        screenSize: newScreenSize,
        deviceTier: newConfig.deviceTier,
        particleDensity: newConfig.particleDensity,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial detection
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const isDesktop = screenSize === 'lg' || screenSize === 'xl';

  return {
    config,
    safeArea,
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Helper: Calculate particle count with responsive density
 */
export function getResponsiveParticleCount(baseCount: number, config?: ResponsiveConfig): number {
  const currentConfig = config || getResponsiveConfig();
  return Math.floor(baseCount * currentConfig.particleDensity);
}

/**
 * Helper: Get shader quality string
 */
export function getShaderQuality(config?: ResponsiveConfig): 'lowp' | 'mediump' | 'highp' {
  const currentConfig = config || getResponsiveConfig();

  if (currentConfig.shaderIntensity < 0.4) return 'lowp';
  if (currentConfig.shaderIntensity < 0.7) return 'mediump';
  return 'highp';
}

export default {
  getResponsiveConfig,
  getEmotionTypography,
  useResponsiveConfig,
  getResponsiveParticleCount,
  getShaderQuality,
  detectScreenSize,
  detectDeviceTier,
  detectSafeAreaInsets,
};
