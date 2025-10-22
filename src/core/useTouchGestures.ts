/**
 * useTouchGestures.ts — PHASE 4: TOUCH-BASED INTERACTION SYSTEM
 *
 * Gesture recognition for mobile-first narrative interaction
 * Tap → summon, Swipe → advance, Long-press → linger, Drag → parallax
 *
 * Philosophy: Touch should feel like sculpting light.
 * Every gesture births meaning into existence.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Gesture types
 */
export type GestureType = 'tap' | 'swipe' | 'long-press' | 'drag' | 'pinch';

/**
 * Swipe direction
 */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Gesture event data
 */
export interface GestureEvent {
  type: GestureType;
  position: { x: number; y: number };
  delta?: { x: number; y: number };
  direction?: SwipeDirection;
  duration?: number;
  velocity?: number;
  distance?: number;
  scale?: number; // For pinch
}

/**
 * Gesture handlers
 */
export interface GestureHandlers {
  onTap?: (event: GestureEvent) => void;
  onSwipe?: (event: GestureEvent) => void;
  onLongPress?: (event: GestureEvent) => void;
  onDrag?: (event: GestureEvent) => void;
  onDragEnd?: (event: GestureEvent) => void;
  onPinch?: (event: GestureEvent) => void;
}

/**
 * Gesture configuration
 */
export interface GestureConfig {
  tapThreshold?: number; // Max movement for tap (px)
  longPressDelay?: number; // Long-press duration (ms)
  swipeThreshold?: number; // Min distance for swipe (px)
  swipeVelocityThreshold?: number; // Min velocity for swipe (px/ms)
  dragThreshold?: number; // Min movement to start drag (px)
  enabled?: boolean;
  preventScroll?: boolean;
}

const DEFAULT_CONFIG: Required<GestureConfig> = {
  tapThreshold: 10,
  longPressDelay: 500,
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  dragThreshold: 5,
  enabled: true,
  preventScroll: false,
};

/**
 * Touch state tracking
 */
interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isLongPress: boolean;
  isDragging: boolean;
  longPressTimer: number | null;
  initialDistance?: number; // For pinch
}

/**
 * Main touch gesture hook
 */
export function useTouchGestures(
  handlers: GestureHandlers,
  config: GestureConfig = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const touchStateRef = useRef<TouchState | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  /**
   * Calculate distance between two points
   */
  const getDistance = useCallback(
    (x1: number, y1: number, x2: number, y2: number): number => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    },
    []
  );

  /**
   * Get swipe direction
   */
  const getSwipeDirection = useCallback(
    (deltaX: number, deltaY: number): SwipeDirection => {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        return deltaX > 0 ? 'right' : 'left';
      } else {
        return deltaY > 0 ? 'down' : 'up';
      }
    },
    []
  );

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!mergedConfig.enabled) return;

      const touch = e.touches[0];
      const now = Date.now();

      // Initialize touch state
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: now,
        isLongPress: false,
        isDragging: false,
        longPressTimer: null,
      };

      // Handle pinch (2 fingers)
      if (e.touches.length === 2) {
        const touch2 = e.touches[1];
        const distance = getDistance(
          touch.clientX,
          touch.clientY,
          touch2.clientX,
          touch2.clientY
        );
        touchStateRef.current.initialDistance = distance;
      }

      // Start long-press timer
      if (handlers.onLongPress) {
        const timer = window.setTimeout(() => {
          if (touchStateRef.current) {
            touchStateRef.current.isLongPress = true;

            const event: GestureEvent = {
              type: 'long-press',
              position: {
                x: touchStateRef.current.currentX,
                y: touchStateRef.current.currentY,
              },
              duration: Date.now() - touchStateRef.current.startTime,
            };

            handlers.onLongPress!(event);
          }
        }, mergedConfig.longPressDelay);

        touchStateRef.current.longPressTimer = timer;
      }

      // Prevent scroll if configured
      if (mergedConfig.preventScroll) {
        e.preventDefault();
      }
    },
    [mergedConfig, handlers, getDistance]
  );

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!mergedConfig.enabled || !touchStateRef.current) return;

      const touch = e.touches[0];
      const state = touchStateRef.current;

      state.currentX = touch.clientX;
      state.currentY = touch.clientY;

      const deltaX = state.currentX - state.startX;
      const deltaY = state.currentY - state.startY;
      const distance = getDistance(state.startX, state.startY, state.currentX, state.currentY);

      // Handle pinch
      if (e.touches.length === 2 && state.initialDistance && handlers.onPinch) {
        const touch2 = e.touches[1];
        const currentDistance = getDistance(
          touch.clientX,
          touch.clientY,
          touch2.clientX,
          touch2.clientY
        );
        const scale = currentDistance / state.initialDistance;

        const event: GestureEvent = {
          type: 'pinch',
          position: { x: state.currentX, y: state.currentY },
          scale,
        };

        handlers.onPinch(event);
        e.preventDefault();
        return;
      }

      // Cancel long-press if moved too far
      if (state.longPressTimer && distance > mergedConfig.tapThreshold) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
      }

      // Start dragging if threshold exceeded
      if (!state.isDragging && distance > mergedConfig.dragThreshold) {
        state.isDragging = true;
      }

      // Emit drag event
      if (state.isDragging && handlers.onDrag) {
        const event: GestureEvent = {
          type: 'drag',
          position: { x: state.currentX, y: state.currentY },
          delta: { x: deltaX, y: deltaY },
          distance,
        };

        handlers.onDrag(event);
      }

      // Prevent scroll during drag
      if (state.isDragging && mergedConfig.preventScroll) {
        e.preventDefault();
      }
    },
    [mergedConfig, handlers, getDistance]
  );

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!mergedConfig.enabled || !touchStateRef.current) return;

      const state = touchStateRef.current;
      const now = Date.now();

      // Clear long-press timer
      if (state.longPressTimer) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
      }

      const deltaX = state.currentX - state.startX;
      const deltaY = state.currentY - state.startY;
      const distance = getDistance(state.startX, state.startY, state.currentX, state.currentY);
      const duration = now - state.startTime;
      const velocity = duration > 0 ? distance / duration : 0;

      // Detect gesture type
      if (state.isLongPress) {
        // Already handled in timer
      } else if (state.isDragging && handlers.onDragEnd) {
        // Drag end
        const event: GestureEvent = {
          type: 'drag',
          position: { x: state.currentX, y: state.currentY },
          delta: { x: deltaX, y: deltaY },
          distance,
          velocity,
          duration,
        };

        handlers.onDragEnd(event);
      } else if (
        distance > mergedConfig.swipeThreshold &&
        velocity > mergedConfig.swipeVelocityThreshold &&
        handlers.onSwipe
      ) {
        // Swipe
        const direction = getSwipeDirection(deltaX, deltaY);

        const event: GestureEvent = {
          type: 'swipe',
          position: { x: state.currentX, y: state.currentY },
          delta: { x: deltaX, y: deltaY },
          direction,
          distance,
          velocity,
          duration,
        };

        handlers.onSwipe(event);
      } else if (distance < mergedConfig.tapThreshold && handlers.onTap) {
        // Tap
        const event: GestureEvent = {
          type: 'tap',
          position: { x: state.currentX, y: state.currentY },
          duration,
        };

        handlers.onTap(event);
      }

      // Reset state
      touchStateRef.current = null;
    },
    [mergedConfig, handlers, getDistance, getSwipeDirection]
  );

  /**
   * Attach event listeners
   */
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !mergedConfig.enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !mergedConfig.preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !mergedConfig.preventScroll });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [mergedConfig.enabled, handleTouchStart, handleTouchMove, handleTouchEnd, mergedConfig.preventScroll]);

  return elementRef;
}

/**
 * Scene-specific gesture hook for Galaxy of Wishes
 * Tap → summon shooting star at touch point
 */
export function useGalaxyGestures(options: {
  onSummonStar?: (position: { x: number; y: number }) => void;
  onAdvance?: () => void;
  onLinger?: () => void;
  onParallaxShift?: (delta: { x: number; y: number }) => void;
}) {
  const handlers: GestureHandlers = {
    onTap: (event) => {
      options.onSummonStar?.(event.position);
    },
    onSwipe: (event) => {
      if (event.direction === 'left' || event.direction === 'up') {
        options.onAdvance?.();
      }
    },
    onLongPress: () => {
      options.onLinger?.();
    },
    onDrag: (event) => {
      if (event.delta) {
        options.onParallaxShift?.(event.delta);
      }
    },
  };

  return useTouchGestures(handlers, { preventScroll: true });
}

/**
 * Scene-specific gesture hook for Apology Garden
 * Tap → summon petal at touch point
 */
export function useGardenGestures(options: {
  onSummonPetal?: (position: { x: number; y: number }) => void;
  onAdvance?: () => void;
  onLinger?: () => void;
  onParallaxShift?: (delta: { x: number; y: number }) => void;
}) {
  const handlers: GestureHandlers = {
    onTap: (event) => {
      options.onSummonPetal?.(event.position);
    },
    onSwipe: (event) => {
      if (event.direction === 'left' || event.direction === 'up') {
        options.onAdvance?.();
      }
    },
    onLongPress: () => {
      options.onLinger?.();
    },
    onDrag: (event) => {
      if (event.delta) {
        options.onParallaxShift?.(event.delta);
      }
    },
  };

  return useTouchGestures(handlers, { preventScroll: true });
}

/**
 * Scene-specific gesture hook for Promises Chamber
 * Tap → reveal promise orb
 */
export function usePromisesGestures(options: {
  onRevealOrb?: (position: { x: number; y: number }) => void;
  onAdvance?: () => void;
  onLinger?: () => void;
  onParallaxShift?: (delta: { x: number; y: number }) => void;
}) {
  const handlers: GestureHandlers = {
    onTap: (event) => {
      options.onRevealOrb?.(event.position);
    },
    onSwipe: (event) => {
      if (event.direction === 'left' || event.direction === 'up') {
        options.onAdvance?.();
      }
    },
    onLongPress: () => {
      options.onLinger?.();
    },
    onDrag: (event) => {
      if (event.delta) {
        options.onParallaxShift?.(event.delta);
      }
    },
  };

  return useTouchGestures(handlers, { preventScroll: true });
}

/**
 * Scene-specific gesture hook for Melody Sphere
 * Tap → trigger audio pulse
 */
export function useMelodyGestures(options: {
  onAudioPulse?: (position: { x: number; y: number }) => void;
  onAdvance?: () => void;
  onLinger?: () => void;
  onParallaxShift?: (delta: { x: number; y: number }) => void;
}) {
  const handlers: GestureHandlers = {
    onTap: (event) => {
      options.onAudioPulse?.(event.position);
    },
    onSwipe: (event) => {
      if (event.direction === 'left' || event.direction === 'up') {
        options.onAdvance?.();
      }
    },
    onLongPress: () => {
      options.onLinger?.();
    },
    onDrag: (event) => {
      if (event.delta) {
        options.onParallaxShift?.(event.delta);
      }
    },
  };

  return useTouchGestures(handlers, { preventScroll: true });
}

/**
 * Scene-specific gesture hook for Word Constellation
 * Tap → emphasize word
 */
export function useConstellationGestures(options: {
  onEmphasizeWord?: (position: { x: number; y: number }) => void;
  onAdvanceWave?: () => void;
  onLinger?: () => void;
  onParallaxShift?: (delta: { x: number; y: number }) => void;
}) {
  const handlers: GestureHandlers = {
    onTap: (event) => {
      options.onEmphasizeWord?.(event.position);
    },
    onSwipe: (event) => {
      if (event.direction === 'left' || event.direction === 'up') {
        options.onAdvanceWave?.();
      }
    },
    onLongPress: () => {
      options.onLinger?.();
    },
    onDrag: (event) => {
      if (event.delta) {
        options.onParallaxShift?.(event.delta);
      }
    },
  };

  return useTouchGestures(handlers, { preventScroll: true });
}

/**
 * Helper: Detect if device supports touch
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Helper: Get normalized touch position (0-1 range)
 */
export function getNormalizedPosition(
  x: number,
  y: number,
  element?: HTMLElement
): { x: number; y: number } {
  const bounds = element?.getBoundingClientRect() || {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  return {
    x: (x - bounds.left) / bounds.width,
    y: (y - bounds.top) / bounds.height,
  };
}

export default useTouchGestures;
