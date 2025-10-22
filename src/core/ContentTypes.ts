/**
 * ContentTypes.ts — PHASE 3: EMOTIONAL INTEGRATION
 *
 * TypeScript interfaces for all emotional content structures
 * Defines the contract between JSON data and scene rendering
 *
 * Philosophy: Every word, wish, and promise is a data structure
 * carrying emotional weight and visual instructions.
 */

/**
 * Base interface for all emotional content
 */
export interface EmotionalContent {
  id: number | string;
  text: string;
  emotion: string;
  effect: string;
  theme?: string;
  timing?: string | number;
}

/**
 * Wish structure for Galaxy of Wishes scene
 */
export interface Wish extends EmotionalContent {
  animation: 'shooting-star' | 'twinkle' | 'bloom' | 'pulse' | 'spiral';
  intensity?: 'soft' | 'medium' | 'bright';
  color?: string; // Optional override for star color
  position?: { x: number; y: number; z: number }; // Optional fixed position
}

/**
 * Apology structure for Garden scene
 */
export interface Apology extends EmotionalContent {
  intensity: 'soft' | 'deep' | 'tender';
  petal_count?: number; // Number of petals to spawn
  rain_intensity?: number; // Rain effect strength (0-1)
  pause_duration?: number; // How long to linger (ms)
}

/**
 * Promise structure for Promises Chamber
 */
export interface Promise extends EmotionalContent {
  glow_color: string; // Orb glow color
  orb_size?: 'small' | 'medium' | 'large';
  reveal_delay?: number; // Delay before text reveals (ms)
  ambient_sound?: string; // Optional ambient sound ID
}

/**
 * Song structure for Melody Sphere
 */
export interface Song extends EmotionalContent {
  title: string;
  artist?: string;
  duration: number; // Duration in seconds
  lyrics: LyricLine[];
  mood: 'gentle' | 'uplifting' | 'romantic' | 'melancholic' | 'joyful';
  color_palette: string[]; // Colors for sphere visualization
  audio_file?: string; // Path to audio file
}

/**
 * Individual lyric line with timing
 */
export interface LyricLine {
  time: number; // Start time in seconds
  text: string;
  emphasis?: boolean; // Highlight this line
  effect?: 'fade' | 'bloom' | 'wave' | 'sparkle';
}

/**
 * Word structure for Word Constellation
 */
export interface Word extends EmotionalContent {
  category: 'beauty' | 'strength' | 'kindness' | 'light' | 'warmth' | 'grace' | 'wisdom' | 'courage' | 'other';
  phrase?: string; // Associated poetic phrase (reveals on click)
  glow_intensity: number; // 0-1
  size?: 'small' | 'medium' | 'large';
  orbit_speed?: number; // Rotation speed multiplier
}

/**
 * Content loader response
 */
export interface ContentLoadResult<T> {
  data: T[];
  count: number;
  loaded: boolean;
  error?: string;
}

/**
 * Animation effect configuration
 */
export interface AnimationEffect {
  name: string;
  duration: number;
  easing: string;
  properties: Record<string, any>;
}

/**
 * Theme styling configuration
 */
export interface ThemeStyle {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  effects: {
    blur?: number;
    brightness?: number;
    saturation?: number;
  };
}

/**
 * Emotion to animation mapping
 */
export const EMOTION_TO_ANIMATION: Record<string, AnimationEffect> = {
  joy: {
    name: 'sparkle-burst',
    duration: 800,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: { scale: 1.5, rotate: 360, opacity: [0.8, 1, 0.8] },
  },
  tenderness: {
    name: 'soft-glow',
    duration: 1200,
    easing: 'ease-in-out',
    properties: { scale: 1.1, blur: 8, opacity: [0.6, 1, 0.6] },
  },
  serenity: {
    name: 'gentle-float',
    duration: 2000,
    easing: 'ease-in-out',
    properties: { y: [-10, 10, -10], opacity: [0.7, 1, 0.7] },
  },
  awe: {
    name: 'radial-bloom',
    duration: 1500,
    easing: 'ease-out',
    properties: { scale: [0.8, 1.3, 1], brightness: [1, 1.5, 1], glow: 20 },
  },
  nostalgia: {
    name: 'fade-in-warm',
    duration: 1800,
    easing: 'ease-in',
    properties: { opacity: [0, 1], blur: [10, 0], sepia: [0.3, 0] },
  },
  wonder: {
    name: 'twinkle',
    duration: 1000,
    easing: 'ease-in-out',
    properties: { opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] },
  },
  elation: {
    name: 'bounce-glow',
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: { scale: [1, 1.2, 1], rotate: [0, 15, 0], brightness: [1, 1.3, 1] },
  },
  completion: {
    name: 'expand-fade',
    duration: 3000,
    easing: 'ease-out',
    properties: { scale: [1, 2], opacity: [1, 0], blur: [0, 20] },
  },
  courage: {
    name: 'bold-flash',
    duration: 1000,
    easing: 'ease-out',
    properties: { scale: [1, 1.3, 1], brightness: [1, 1.4, 1], rotate: [0, 5, 0] },
  },
  warmth: {
    name: 'ember-pulse',
    duration: 1400,
    easing: 'ease-in-out',
    properties: { scale: [1, 1.15, 1], blur: 6, hue: 30 },
  },
};

/**
 * Theme to style mapping
 */
export const THEME_TO_STYLE: Record<string, ThemeStyle> = {
  beauty: {
    name: 'beauty',
    colors: {
      primary: '#FFB6C1',
      secondary: '#FF69B4',
      accent: '#FFC0CB',
      glow: '#FFD4E5',
    },
    effects: { blur: 4, brightness: 1.2, saturation: 1.3 },
  },
  strength: {
    name: 'strength',
    colors: {
      primary: '#8A4FFF',
      secondary: '#6A0DAD',
      accent: '#9370DB',
      glow: '#B19CD9',
    },
    effects: { blur: 2, brightness: 1.1, saturation: 1.2 },
  },
  kindness: {
    name: 'kindness',
    colors: {
      primary: '#FFCBA4',
      secondary: '#FFD700',
      accent: '#FFA500',
      glow: '#FFEAA7',
    },
    effects: { blur: 6, brightness: 1.3, saturation: 1.1 },
  },
  light: {
    name: 'light',
    colors: {
      primary: '#FFFFFF',
      secondary: '#F0F0F0',
      accent: '#FFFACD',
      glow: '#FFFEF0',
    },
    effects: { blur: 8, brightness: 1.5, saturation: 1.0 },
  },
  warmth: {
    name: 'warmth',
    colors: {
      primary: '#FF8C42',
      secondary: '#FF6B35',
      accent: '#FFB347',
      glow: '#FFDAB9',
    },
    effects: { blur: 5, brightness: 1.2, saturation: 1.4 },
  },
  grace: {
    name: 'grace',
    colors: {
      primary: '#E8E0F5',
      secondary: '#D8BFD8',
      accent: '#DDA0DD',
      glow: '#F0E6FA',
    },
    effects: { blur: 3, brightness: 1.1, saturation: 1.0 },
  },
  wisdom: {
    name: 'wisdom',
    colors: {
      primary: '#4682B4',
      secondary: '#5F9EA0',
      accent: '#87CEEB',
      glow: '#B0E0E6',
    },
    effects: { blur: 4, brightness: 1.0, saturation: 1.1 },
  },
  courage: {
    name: 'courage',
    colors: {
      primary: '#DC143C',
      secondary: '#8B0000',
      accent: '#FF4500',
      glow: '#FF6B6B',
    },
    effects: { blur: 3, brightness: 1.2, saturation: 1.3 },
  },
};

/**
 * Helper to get animation config by emotion
 */
export function getAnimationForEmotion(emotion: string): AnimationEffect {
  return EMOTION_TO_ANIMATION[emotion.toLowerCase()] || EMOTION_TO_ANIMATION.wonder;
}

/**
 * Helper to get style config by theme
 */
export function getStyleForTheme(theme: string): ThemeStyle {
  return THEME_TO_STYLE[theme.toLowerCase()] || THEME_TO_STYLE.light;
}

export default {
  EMOTION_TO_ANIMATION,
  THEME_TO_STYLE,
  getAnimationForEmotion,
  getStyleForTheme,
};
