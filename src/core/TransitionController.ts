/**
 * TransitionController.ts
 *
 * The choreographer of visual metamorphosis.
 * Scenes don't cut — they dissolve, like one dream becoming another.
 *
 * Philosophy: Transitions are sacred.
 * They are the moment between heartbeats.
 */

import gsap from 'gsap';

export type EaseType = 'power' | 'sine' | 'expo' | 'circ' | 'back' | 'elastic';
export type EaseDirection = 'in' | 'out' | 'inOut';

interface TransitionConfig {
  duration?: number; // seconds
  ease?: string;
  delay?: number;
}

/**
 * Fade element in from transparency
 */
export function fadeIn(
  element: HTMLElement | string,
  config: TransitionConfig = {}
): gsap.core.Tween {
  const { duration = 1.5, ease = 'power2.out', delay = 0 } = config;

  return gsap.fromTo(
    element,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      ease,
      delay,
    }
  );
}

/**
 * Fade element out to transparency
 */
export function fadeOut(
  element: HTMLElement | string,
  config: TransitionConfig = {}
): gsap.core.Tween {
  const { duration = 1.5, ease = 'power2.in', delay = 0 } = config;

  return gsap.to(element, {
    opacity: 0,
    duration,
    ease,
    delay,
  });
}

/**
 * Crossfade between two elements
 * Like one memory dissolving into another
 */
export function crossfade(
  elementOut: HTMLElement | string,
  elementIn: HTMLElement | string,
  duration: number = 2
): gsap.core.Timeline {
  const timeline = gsap.timeline();

  timeline
    .to(elementOut, {
      opacity: 0,
      duration,
      ease: 'power2.inOut',
    })
    .fromTo(
      elementIn,
      { opacity: 0 },
      {
        opacity: 1,
        duration,
        ease: 'power2.inOut',
      },
      `-=${duration * 0.5}` // Overlap by 50%
    );

  return timeline;
}

/**
 * Scale in with fade (for blooming elements)
 */
export function bloom(
  element: HTMLElement | string,
  config: TransitionConfig = {}
): gsap.core.Timeline {
  const { duration = 2, ease = 'back.out(1.2)', delay = 0 } = config;

  const timeline = gsap.timeline({ delay });

  timeline.fromTo(
    element,
    {
      scale: 0,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration,
      ease,
    }
  );

  return timeline;
}

/**
 * Ripple effect outward (for impact moments)
 */
export function ripple(
  element: HTMLElement | string,
  config: TransitionConfig = {}
): gsap.core.Timeline {
  const { duration = 1.5, ease = 'power2.out', delay = 0 } = config;

  const timeline = gsap.timeline({ delay });

  timeline
    .fromTo(
      element,
      {
        scale: 0.8,
        opacity: 1,
      },
      {
        scale: 1.2,
        opacity: 0,
        duration,
        ease,
      }
    )
    .set(element, { scale: 1 }); // Reset after

  return timeline;
}

/**
 * Float animation (gentle up and down)
 * For elements that should feel weightless
 */
export function float(
  element: HTMLElement | string,
  amplitude: number = 20,
  duration: number = 3
): gsap.core.Tween {
  return gsap.to(element, {
    y: `+=${amplitude}`,
    duration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });
}

/**
 * Glow pulse animation (for emphasis)
 */
export function glowPulse(
  element: HTMLElement | string,
  color: string = 'rgba(255, 182, 193, 0.8)',
  duration: number = 2
): gsap.core.Tween {
  return gsap.to(element, {
    boxShadow: `0 0 40px ${color}`,
    duration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });
}

/**
 * Stagger animation for multiple elements
 * Like stars appearing one by one
 */
export function staggerIn(
  elements: HTMLElement[] | NodeListOf<Element> | string,
  config: TransitionConfig & { stagger?: number } = {}
): gsap.core.Timeline {
  const { duration = 1, ease = 'power2.out', delay = 0, stagger = 0.1 } = config;

  const timeline = gsap.timeline({ delay });

  timeline.fromTo(
    elements,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration,
      ease,
      stagger,
    }
  );

  return timeline;
}

/**
 * Particle burst animation
 * For celebration moments
 */
export function particleBurst(
  container: HTMLElement,
  count: number = 20,
  color: string = '#FFB6C1'
): void {
  const particles: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = color;
    particle.style.top = '50%';
    particle.style.left = '50%';
    particle.style.pointerEvents = 'none';

    container.appendChild(particle);
    particles.push(particle);

    const angle = (i / count) * Math.PI * 2;
    const distance = 100 + Math.random() * 100;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    gsap.to(particle, {
      x,
      y,
      opacity: 0,
      duration: 1 + Math.random(),
      ease: 'power2.out',
      onComplete: () => {
        particle.remove();
      },
    });
  }
}

/**
 * Camera-like zoom and fade
 * For cinematic moments
 */
export function cinematicZoom(
  element: HTMLElement | string,
  zoomIn: boolean = true,
  config: TransitionConfig = {}
): gsap.core.Timeline {
  const { duration = 3, ease = 'power2.inOut', delay = 0 } = config;

  const timeline = gsap.timeline({ delay });

  if (zoomIn) {
    timeline.fromTo(
      element,
      {
        scale: 1.2,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration,
        ease,
      }
    );
  } else {
    timeline.to(element, {
      scale: 1.1,
      opacity: 0,
      duration,
      ease,
    });
  }

  return timeline;
}

/**
 * Create a master timeline for scene transitions
 * This ensures everything moves in perfect harmony
 */
export function createSceneTransition(): gsap.core.Timeline {
  return gsap.timeline({
    defaults: {
      ease: 'power2.inOut',
    },
  });
}

/**
 * Ease presets that match emotional intent
 */
export const emotionalEases = {
  gentle: 'sine.inOut', // For soft, intimate moments
  powerful: 'power3.out', // For dramatic reveals
  playful: 'back.out(1.4)', // For joyful bounces
  dreamy: 'expo.out', // For ethereal floating
  urgent: 'circ.out', // For quick attention
  eternal: 'power1.inOut', // For timeless, slow movements
};

export default {
  fadeIn,
  fadeOut,
  crossfade,
  bloom,
  ripple,
  float,
  glowPulse,
  staggerIn,
  particleBurst,
  cinematicZoom,
  createSceneTransition,
  emotionalEases,
};
