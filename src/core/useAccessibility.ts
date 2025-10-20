/**
 * useAccessibility.ts — CINEMATIC REBUILD PHASE 2
 *
 * Comprehensive accessibility hooks for reduced motion, contrast, and user control
 * Ensures the Loveverse is emotionally comfortable, not overwhelming
 *
 * Philosophy: Beauty must be accessible to everyone.
 * The experience should adapt to the viewer, not force them to adapt.
 */

import { useEffect, useState, useCallback } from 'react';
import useSettingsStore from './SettingsManager';

/**
 * Hook to detect and respond to prefers-reduced-motion
 */
export function useReducedMotion(): boolean {
  const { accessibility } = useSettingsStore();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Return true if either system preference OR manual setting is enabled
  return prefersReducedMotion || accessibility.reducedMotion;
}

/**
 * Hook for managing scene pause/play state
 */
export function useScenePause() {
  const [isPaused, setIsPaused] = useState(false);

  const pause = useCallback(() => {
    setIsPaused(true);
    console.log('[Accessibility] Scene paused by user');
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    console.log('[Accessibility] Scene resumed');
  }, []);

  const toggle = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Keyboard shortcut: Space to pause/resume
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggle]);

  return { isPaused, pause, resume, toggle };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(options: {
  onNext?: () => void;
  onPrevious?: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
}) {
  const { accessibility } = useSettingsStore();

  useEffect(() => {
    if (!accessibility.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'n':
        case 'N':
          e.preventDefault();
          options.onNext?.();
          break;

        case 'ArrowLeft':
        case 'p':
        case 'P':
          e.preventDefault();
          options.onPrevious?.();
          break;

        case 'Escape':
          e.preventDefault();
          options.onEscape?.();
          break;

        case 'Enter':
          if (e.target === document.body) {
            e.preventDefault();
            options.onEnter?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [accessibility.keyboardNavigation, options]);
}

/**
 * Hook for managing focus trap (e.g., in modals or focused scenes)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element on mount
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, isActive]);
}

/**
 * Hook for announcing screen reader messages
 */
export function useAnnouncer() {
  const [announcer, setAnnouncer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a visually hidden live region for screen readers
    const div = document.createElement('div');
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    div.setAttribute('aria-atomic', 'true');
    div.className = 'sr-only';
    div.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(div);
    setAnnouncer(div);

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcer) return;

    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    console.log(`[Accessibility] Screen reader announcement (${priority}):`, message);
  }, [announcer]);

  return announce;
}

/**
 * Hook for high contrast mode detection
 */
export function useHighContrast(): boolean {
  const { accessibility } = useSettingsStore();
  const [systemHighContrast, setSystemHighContrast] = useState(false);

  useEffect(() => {
    // Check Windows high contrast mode
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setSystemHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return systemHighContrast || accessibility.highContrast;
}

/**
 * Hook for managing animation preferences with smooth degradation
 */
export function useMotionPreference() {
  const reducedMotion = useReducedMotion();

  return {
    reducedMotion,
    // Animation duration: 0 if reduced motion, normal otherwise
    duration: (normalDuration: number) => reducedMotion ? 0 : normalDuration,
    // Particle count: reduced if reduced motion
    particleCount: (normalCount: number) => reducedMotion ? Math.floor(normalCount * 0.3) : normalCount,
    // Parallax: disabled if reduced motion
    parallaxEnabled: !reducedMotion,
    // Rotation: disabled if reduced motion
    rotationEnabled: !reducedMotion,
  };
}

/**
 * Hook for accessible Three.js canvas
 * Adds ARIA labels and keyboard navigation
 */
export function useAccessibleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  description: string
) {
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Add ARIA labels
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', description);
    canvas.setAttribute('tabindex', '0');

    // Add keyboard hint
    canvas.title = `${description}. Press Space to pause, Arrow keys to navigate`;
  }, [canvasRef, description]);
}

/**
 * Hook for managing user-controlled volume
 */
export function useVolumeControl() {
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const changeVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    console.log('[Accessibility] Volume changed:', clampedVolume);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    console.log('[Accessibility] Mute toggled:', !isMuted);
  }, [isMuted]);

  const increaseVolume = useCallback(() => {
    changeVolume(volume + 0.1);
  }, [volume, changeVolume]);

  const decreaseVolume = useCallback(() => {
    changeVolume(volume - 0.1);
  }, [volume, changeVolume]);

  // Keyboard shortcuts: + / - for volume, M for mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          increaseVolume();
          break;

        case '-':
        case '_':
          e.preventDefault();
          decreaseVolume();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [increaseVolume, decreaseVolume, toggleMute]);

  return {
    volume: isMuted ? 0 : volume,
    rawVolume: volume,
    isMuted,
    changeVolume,
    toggleMute,
    increaseVolume,
    decreaseVolume,
  };
}

/**
 * Composite hook that combines all accessibility features
 */
export function useAccessibleScene(options: {
  sceneName: string;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const highContrast = useHighContrast();
  const motionPreference = useMotionPreference();
  const { isPaused, pause, resume, toggle } = useScenePause();
  const announce = useAnnouncer();
  const volumeControl = useVolumeControl();

  // Announce scene name on mount
  useEffect(() => {
    announce(`Entering ${options.sceneName}`);
  }, [announce, options.sceneName]);

  // Set up keyboard navigation
  useKeyboardNavigation({
    onNext: options.onNext,
    onPrevious: options.onPrevious,
    onEscape: pause,
    onEnter: resume,
  });

  // Set up accessible canvas
  if (options.canvasRef) {
    useAccessibleCanvas(options.canvasRef, options.sceneName);
  }

  return {
    reducedMotion,
    highContrast,
    motionPreference,
    isPaused,
    pause,
    resume,
    togglePause: toggle,
    announce,
    ...volumeControl,
  };
}

export default {
  useReducedMotion,
  useScenePause,
  useKeyboardNavigation,
  useFocusTrap,
  useAnnouncer,
  useHighContrast,
  useMotionPreference,
  useAccessibleCanvas,
  useVolumeControl,
  useAccessibleScene,
};
