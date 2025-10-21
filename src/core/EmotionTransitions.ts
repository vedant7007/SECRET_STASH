/**
 * EmotionTransitions.ts — PHASE 3.5: EMOTION-DRIVEN TRANSITIONS
 *
 * Emotion metadata influences transitions, not just styling
 * Each emotion has a unique entrance and exit choreography
 *
 * Philosophy: Emotions don't just sit — they move.
 * Each feeling has its own way of arriving and departing.
 */

import { Variants } from 'framer-motion';

export type EmotionTransitionType =
  | 'drift-fade'      // Slow horizontal drift with fade (longing, nostalgia)
  | 'bounce-spark'    // Bouncy entrance with sparkle (joy, elation)
  | 'star-trail'      // Shooting star motion (wonder, awe)
  | 'bloom-expand'    // Radial expansion from center (awe, completion)
  | 'gentle-float'    // Vertical floating motion (serenity, tenderness)
  | 'ripple-wave'     // Ripple effect expanding outward (surprise, realization)
  | 'spiral-in'       // Spiral inward motion (mystery, depth)
  | 'soft-glow'       // Fade in with glow pulse (tenderness, warmth)
  | 'cascade'         // Waterfall-like descent (grace, elegance)
  | 'heartbeat'       // Pulse from center (love, passion);

/**
 * Transition configuration
 */
export interface TransitionConfig {
  type: EmotionTransitionType;
  duration: number;
  easing: string | number[];
  variants: Variants;
}

/**
 * Emotion to transition mapping
 */
export const EMOTION_TRANSITIONS: Record<string, TransitionConfig> = {
  longing: {
    type: 'drift-fade',
    duration: 2.5,
    easing: [0.25, 0.46, 0.45, 0.94],
    variants: {
      hidden: {
        opacity: 0,
        x: -100,
        filter: 'blur(10px)',
      },
      enter: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] },
      },
      exit: {
        opacity: 0,
        x: 100,
        filter: 'blur(10px)',
        transition: { duration: 2.0, ease: [0.55, 0.055, 0.675, 0.19] },
      },
    },
  },

  joy: {
    type: 'bounce-spark',
    duration: 0.8,
    easing: [0.68, -0.55, 0.265, 1.55],
    variants: {
      hidden: {
        opacity: 0,
        scale: 0,
        rotate: -180,
      },
      enter: {
        opacity: 1,
        scale: [0, 1.2, 1],
        rotate: [0, 15, 0],
        transition: {
          duration: 0.8,
          ease: [0.68, -0.55, 0.265, 1.55],
          times: [0, 0.6, 1],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        y: -20,
        transition: { duration: 0.4 },
      },
    },
  },

  wonder: {
    type: 'star-trail',
    duration: 1.5,
    easing: [0.33, 1, 0.68, 1],
    variants: {
      hidden: {
        opacity: 0,
        x: -200,
        y: -200,
        scale: 0.5,
      },
      enter: {
        opacity: [0, 1, 1],
        x: [- 200, 0],
        y: [-200, 0],
        scale: [0.5, 1.1, 1],
        transition: {
          duration: 1.5,
          ease: [0.33, 1, 0.68, 1],
        },
      },
      exit: {
        opacity: 0,
        x: 200,
        y: 200,
        scale: 0.5,
        transition: { duration: 1.0 },
      },
    },
  },

  awe: {
    type: 'bloom-expand',
    duration: 1.8,
    easing: [0.19, 1, 0.22, 1],
    variants: {
      hidden: {
        opacity: 0,
        scale: 0,
        filter: 'brightness(0.5) blur(20px)',
      },
      enter: {
        opacity: [0, 1, 1],
        scale: [0, 1.3, 1],
        filter: ['brightness(0.5) blur(20px)', 'brightness(1.5) blur(0px)', 'brightness(1) blur(0px)'],
        transition: {
          duration: 1.8,
          ease: [0.19, 1, 0.22, 1],
          times: [0, 0.5, 1],
        },
      },
      exit: {
        opacity: 0,
        scale: 1.5,
        filter: 'brightness(2) blur(20px)',
        transition: { duration: 1.2 },
      },
    },
  },

  serenity: {
    type: 'gentle-float',
    duration: 2.0,
    easing: [0.4, 0, 0.2, 1],
    variants: {
      hidden: {
        opacity: 0,
        y: 50,
      },
      enter: {
        opacity: [0, 0.7, 1],
        y: [50, -5, 0],
        transition: {
          duration: 2.0,
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.7, 1],
        },
      },
      exit: {
        opacity: 0,
        y: -50,
        transition: { duration: 1.5, ease: [0.4, 0, 0.6, 1] },
      },
    },
  },

  tenderness: {
    type: 'soft-glow',
    duration: 1.6,
    easing: [0.45, 0, 0.55, 1],
    variants: {
      hidden: {
        opacity: 0,
        scale: 0.9,
        filter: 'blur(8px) brightness(0.7)',
      },
      enter: {
        opacity: [0, 0.8, 1],
        scale: [0.9, 1.05, 1],
        filter: ['blur(8px) brightness(0.7)', 'blur(2px) brightness(1.2)', 'blur(0px) brightness(1)'],
        transition: {
          duration: 1.6,
          ease: [0.45, 0, 0.55, 1],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(8px) brightness(0.7)',
        transition: { duration: 1.2 },
      },
    },
  },

  elation: {
    type: 'bounce-spark',
    duration: 0.6,
    easing: [0.68, -0.55, 0.265, 1.55],
    variants: {
      hidden: {
        opacity: 0,
        scale: 0,
        y: 100,
      },
      enter: {
        opacity: 1,
        scale: [0, 1.3, 1],
        y: [100, -10, 0],
        rotate: [0, 10, 0],
        transition: {
          duration: 0.6,
          ease: [0.68, -0.55, 0.265, 1.55],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        y: -50,
        transition: { duration: 0.3 },
      },
    },
  },

  nostalgia: {
    type: 'drift-fade',
    duration: 2.2,
    easing: [0.25, 0.46, 0.45, 0.94],
    variants: {
      hidden: {
        opacity: 0,
        x: -80,
        filter: 'sepia(0.5) blur(10px)',
      },
      enter: {
        opacity: [0, 0.8, 1],
        x: [-80, 0],
        filter: ['sepia(0.5) blur(10px)', 'sepia(0.2) blur(2px)', 'sepia(0) blur(0px)'],
        transition: {
          duration: 2.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
      exit: {
        opacity: 0,
        x: 80,
        filter: 'sepia(0.5) blur(10px)',
        transition: { duration: 1.8 },
      },
    },
  },

  completion: {
    type: 'bloom-expand',
    duration: 3.0,
    easing: [0.19, 1, 0.22, 1],
    variants: {
      hidden: {
        opacity: 0,
        scale: 0.5,
        filter: 'brightness(0.5)',
      },
      enter: {
        opacity: [0, 1, 1],
        scale: [0.5, 1.2, 1],
        filter: ['brightness(0.5)', 'brightness(1.5)', 'brightness(1)'],
        transition: {
          duration: 3.0,
          ease: [0.19, 1, 0.22, 1],
        },
      },
      exit: {
        opacity: [1, 1, 0],
        scale: [1, 1.5, 2],
        filter: ['brightness(1)', 'brightness(2)', 'brightness(3)'],
        transition: {
          duration: 2.5,
          ease: [0.55, 0.055, 0.675, 0.19],
        },
      },
    },
  },

  grace: {
    type: 'cascade',
    duration: 1.8,
    easing: [0.16, 1, 0.3, 1],
    variants: {
      hidden: {
        opacity: 0,
        y: -100,
        scale: 0.8,
      },
      enter: {
        opacity: [0, 0.5, 1],
        y: [-100, 10, 0],
        scale: [0.8, 1.05, 1],
        transition: {
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1],
        },
      },
      exit: {
        opacity: 0,
        y: 100,
        scale: 0.8,
        transition: { duration: 1.2 },
      },
    },
  },

  courage: {
    type: 'heartbeat',
    duration: 1.0,
    easing: [0.87, 0, 0.13, 1],
    variants: {
      hidden: {
        opacity: 0,
        scale: 0,
      },
      enter: {
        opacity: [0, 1, 1],
        scale: [0, 1.2, 1, 1.1, 1],
        transition: {
          duration: 1.0,
          ease: [0.87, 0, 0.13, 1],
          times: [0, 0.3, 0.5, 0.7, 1],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.5 },
      },
    },
  },
};

/**
 * Get transition config by emotion
 */
export function getEmotionTransition(emotion: string): TransitionConfig {
  const normalized = emotion.toLowerCase();
  return EMOTION_TRANSITIONS[normalized] || EMOTION_TRANSITIONS.serenity;
}

/**
 * Create custom transition variants
 */
export function createCustomTransition(
  type: EmotionTransitionType,
  duration?: number,
  customEasing?: string | number[]
): Variants {
  // Find base transition
  const baseConfig = Object.values(EMOTION_TRANSITIONS).find(t => t.type === type);

  if (!baseConfig) {
    return EMOTION_TRANSITIONS.serenity.variants;
  }

  // Clone and customize
  const variants = JSON.parse(JSON.stringify(baseConfig.variants));

  if (duration && variants.enter.transition) {
    variants.enter.transition.duration = duration;
  }

  if (customEasing && variants.enter.transition) {
    variants.enter.transition.ease = customEasing;
  }

  return variants;
}

/**
 * Stagger children with emotion-specific timing
 */
export function createStaggerVariants(emotion: string, childCount: number): Variants {
  const config = getEmotionTransition(emotion);
  const staggerDelay = config.duration / childCount / 2;

  return {
    hidden: { opacity: 0 },
    enter: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
  };
}

export default {
  EMOTION_TRANSITIONS,
  getEmotionTransition,
  createCustomTransition,
  createStaggerVariants,
};
