/**
 * useHapticFeedback.ts — PHASE 4: HAPTIC + MICROFEEDBACK SYSTEM
 *
 * Emotional haptic feedback for touch interactions
 * Light tap, medium pulse, heavy thud — mapped to emotional moments
 *
 * Philosophy: Touch should echo in the body.
 * Every interaction ripples beyond the screen.
 */

import { useCallback, useEffect } from 'react';

/**
 * Haptic feedback patterns
 */
export type HapticPattern =
  | 'light'        // Soft tap (10ms) - gentle moments
  | 'medium'       // Pulse (20ms) - emphasis
  | 'heavy'        // Thud (30ms) - important actions
  | 'double-tap'   // Two quick taps (10ms, 50ms gap, 10ms)
  | 'heartbeat'    // Heartbeat rhythm (20ms, 200ms, 30ms)
  | 'success'      // Success pattern (10ms, 100ms, 20ms, 100ms, 30ms)
  | 'error'        // Error pattern (50ms)
  | 'custom';      // Custom duration

/**
 * Haptic configuration
 */
export interface HapticConfig {
  enabled: boolean;
  intensity: number; // 0-1 (maps to vibration duration multiplier)
  respectSystemSettings: boolean;
}

/**
 * Emotion to haptic pattern mapping
 */
export const EMOTION_TO_HAPTIC: Record<string, HapticPattern> = {
  joy: 'double-tap',
  elation: 'success',
  tenderness: 'light',
  serenity: 'light',
  longing: 'medium',
  nostalgia: 'medium',
  awe: 'heavy',
  wonder: 'double-tap',
  completion: 'heartbeat',
  grace: 'light',
  courage: 'heavy',
};

/**
 * Pattern definitions (vibration durations in ms)
 */
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  'light': 10,
  'medium': 20,
  'heavy': 30,
  'double-tap': [10, 50, 10],
  'heartbeat': [20, 200, 30],
  'success': [10, 100, 20, 100, 30],
  'error': 50,
  'custom': 20,
};

/**
 * Check if vibration API is supported
 */
function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Main haptic feedback hook
 */
export function useHapticFeedback(config?: Partial<HapticConfig>) {
  const mergedConfig: HapticConfig = {
    enabled: true,
    intensity: 1.0,
    respectSystemSettings: true,
    ...config,
  };

  /**
   * Trigger haptic feedback by pattern
   */
  const trigger = useCallback(
    (pattern: HapticPattern, customDuration?: number) => {
      if (!mergedConfig.enabled || !isVibrationSupported()) return;

      // Get pattern duration(s)
      let duration: number | number[] = pattern === 'custom' && customDuration
        ? customDuration
        : HAPTIC_PATTERNS[pattern];

      // Apply intensity multiplier
      if (typeof duration === 'number') {
        duration = Math.round(duration * mergedConfig.intensity);
      } else {
        duration = duration.map(d => Math.round(d * mergedConfig.intensity));
      }

      // Trigger vibration
      try {
        navigator.vibrate(duration);
      } catch (error) {
        console.warn('[Haptic] Vibration failed:', error);
      }
    },
    [mergedConfig.enabled, mergedConfig.intensity]
  );

  /**
   * Trigger haptic by emotion
   */
  const triggerEmotion = useCallback(
    (emotion: string) => {
      const pattern = EMOTION_TO_HAPTIC[emotion.toLowerCase()] || 'medium';
      trigger(pattern);
    },
    [trigger]
  );

  /**
   * Cancel all vibrations
   */
  const cancel = useCallback(() => {
    if (isVibrationSupported()) {
      navigator.vibrate(0);
    }
  }, []);

  return {
    trigger,
    triggerEmotion,
    cancel,
    isSupported: isVibrationSupported(),
  };
}

/**
 * Interaction-specific haptic hooks
 */

/**
 * Tap feedback
 */
export function useTapHaptic() {
  const { trigger } = useHapticFeedback();

  const onTap = useCallback(() => {
    trigger('light');
  }, [trigger]);

  return onTap;
}

/**
 * Swipe feedback
 */
export function useSwipeHaptic() {
  const { trigger } = useHapticFeedback();

  const onSwipe = useCallback(() => {
    trigger('medium');
  }, [trigger]);

  return onSwipe;
}

/**
 * Long-press feedback
 */
export function useLongPressHaptic() {
  const { trigger } = useHapticFeedback();

  const onLongPress = useCallback(() => {
    trigger('heavy');
  }, [trigger]);

  return onLongPress;
}

/**
 * Drag feedback
 */
export function useDragHaptic() {
  const { trigger } = useHapticFeedback();

  const onDragStart = useCallback(() => {
    trigger('medium');
  }, [trigger]);

  const onDragEnd = useCallback(() => {
    trigger('light');
  }, [trigger]);

  return { onDragStart, onDragEnd };
}

/**
 * Narrative moment haptic (emotion-based)
 */
export function useNarrativeHaptic() {
  const { triggerEmotion } = useHapticFeedback();

  const onEnter = useCallback((emotion: string) => {
    triggerEmotion(emotion);
  }, [triggerEmotion]);

  const onExit = useCallback(() => {
    // Soft exit haptic
    const { trigger } = useHapticFeedback();
    trigger('light');
  }, []);

  return { onEnter, onExit };
}

/**
 * Scene-specific haptic feedback
 */

/**
 * Galaxy of Wishes haptic
 */
export function useGalaxyHaptic() {
  const { trigger } = useHapticFeedback();

  const onStarSummon = useCallback(() => {
    trigger('double-tap');
  }, [trigger]);

  const onWishReveal = useCallback((emotion: string) => {
    const { triggerEmotion } = useHapticFeedback();
    triggerEmotion(emotion);
  }, []);

  return { onStarSummon, onWishReveal };
}

/**
 * Apology Garden haptic
 */
export function useGardenHaptic() {
  const { trigger } = useHapticFeedback();

  const onPetalSummon = useCallback(() => {
    trigger('light');
  }, [trigger]);

  const onApologyReveal = useCallback(() => {
    trigger('medium');
  }, [trigger]);

  return { onPetalSummon, onApologyReveal };
}

/**
 * Promises Chamber haptic
 */
export function usePromisesHaptic() {
  const { trigger } = useHapticFeedback();

  const onOrbReveal = useCallback(() => {
    trigger('heavy');
  }, [trigger]);

  const onPromiseRead = useCallback((emotion: string) => {
    const { triggerEmotion } = useHapticFeedback();
    triggerEmotion(emotion);
  }, []);

  return { onOrbReveal, onPromiseRead };
}

/**
 * Melody Sphere haptic
 */
export function useMelodyHaptic() {
  const { trigger } = useHapticFeedback();

  const onBeat = useCallback(() => {
    trigger('light');
  }, [trigger]);

  const onLyricReveal = useCallback(() => {
    trigger('medium');
  }, [trigger]);

  const onEmotionalClimax = useCallback(() => {
    trigger('heartbeat');
  }, [trigger]);

  return { onBeat, onLyricReveal, onEmotionalClimax };
}

/**
 * Word Constellation haptic
 */
export function useConstellationHaptic() {
  const { trigger } = useHapticFeedback();

  const onWordReveal = useCallback(() => {
    trigger('light');
  }, [trigger]);

  const onWaveStart = useCallback(() => {
    trigger('medium');
  }, [trigger]);

  const onCategoryComplete = useCallback(() => {
    trigger('success');
  }, [trigger]);

  return { onWordReveal, onWaveStart, onCategoryComplete };
}

/**
 * Helper: Create haptic pulse sequence (for continuous feedback)
 */
export function useHapticPulse(
  pattern: HapticPattern,
  intervalMs: number,
  enabled: boolean = false
) {
  const { trigger, cancel } = useHapticFeedback();

  useEffect(() => {
    if (!enabled) {
      cancel();
      return;
    }

    const interval = setInterval(() => {
      trigger(pattern);
    }, intervalMs);

    return () => {
      clearInterval(interval);
      cancel();
    };
  }, [pattern, intervalMs, enabled, trigger, cancel]);
}

/**
 * Helper: Create haptic sequence (multiple patterns in order)
 */
export function useHapticSequence() {
  const { trigger } = useHapticFeedback();

  const playSequence = useCallback(
    (patterns: HapticPattern[], delays: number[]) => {
      let totalDelay = 0;

      patterns.forEach((pattern, index) => {
        totalDelay += delays[index] || 0;
        setTimeout(() => {
          trigger(pattern);
        }, totalDelay);
      });
    },
    [trigger]
  );

  return playSequence;
}

/**
 * Helper: Emotion-reactive haptic (triggers on emotion change)
 */
export function useEmotionReactiveHaptic(currentEmotion: string | null) {
  const { triggerEmotion } = useHapticFeedback();

  useEffect(() => {
    if (currentEmotion) {
      triggerEmotion(currentEmotion);
    }
  }, [currentEmotion, triggerEmotion]);
}

/**
 * Settings integration
 */
export function getHapticConfigFromSettings(): HapticConfig {
  // Import from SettingsManager if available
  try {
    const settings = localStorage.getItem('loveverse-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return {
        enabled: parsed.haptics?.enabled ?? true,
        intensity: parsed.haptics?.intensity ?? 1.0,
        respectSystemSettings: true,
      };
    }
  } catch (error) {
    console.warn('[Haptic] Could not load settings:', error);
  }

  return {
    enabled: true,
    intensity: 1.0,
    respectSystemSettings: true,
  };
}

export default useHapticFeedback;
