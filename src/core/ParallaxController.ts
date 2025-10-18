/**
 * ParallaxController.ts
 *
 * Advanced cursor-reactive parallax system with physics damping.
 * Creates spatial depth through multi-layer movement at different speeds.
 *
 * Philosophy: Depth creates emotion. Motion creates life.
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ParallaxLayer {
  element: HTMLElement | null;
  depth: number; // 0-1, where 1 is closest (moves most)
  speed?: number; // Custom speed multiplier
}

interface ParallaxOptions {
  intensity?: number; // Global intensity multiplier (0-1)
  ease?: number; // Smoothing factor (0-1)
  tiltEffect?: boolean; // 3D tilt based on position
  mobileSensitivity?: number; // Reduce on mobile (0-1)
}

/**
 * Custom hook for parallax effect
 */
export function useParallax(options: ParallaxOptions = {}) {
  const {
    intensity = 1.0,
    ease = 0.1,
    tiltEffect = false,
    mobileSensitivity = 0.5
  } = options;

  const [layers, setLayers] = useState<ParallaxLayer[]>([]);
  const mousePosition = useRef({ x: 0.5, y: 0.5 });
  const currentPosition = useRef({ x: 0.5, y: 0.5 });
  const animationFrame = useRef<number | undefined>(undefined);

  // Detect if mobile
  const isMobile = useRef(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );

  const sensitivity = isMobile.current ? mobileSensitivity : 1.0;

  /**
   * Register a parallax layer
   */
  const registerLayer = (element: HTMLElement, depth: number, speed?: number) => {
    setLayers(prev => [...prev, { element, depth, speed }]);

    return () => {
      setLayers(prev => prev.filter(layer => layer.element !== element));
    };
  };

  /**
   * Update parallax positions with smooth easing
   */
  const updateParallax = () => {
    // Smooth lerp towards target position
    currentPosition.current.x += (mousePosition.current.x - currentPosition.current.x) * ease;
    currentPosition.current.y += (mousePosition.current.y - currentPosition.current.y) * ease;

    const centerX = currentPosition.current.x - 0.5;
    const centerY = currentPosition.current.y - 0.5;

    layers.forEach(({ element, depth, speed = 1.0 }) => {
      if (!element) return;

      // Calculate movement based on depth (deeper = less movement)
      const moveX = centerX * depth * 100 * intensity * speed * sensitivity;
      const moveY = centerY * depth * 100 * intensity * speed * sensitivity;

      // Apply transform
      let transform = `translate3d(${moveX}px, ${moveY}px, 0)`;

      // Add tilt effect if enabled
      if (tiltEffect) {
        const rotateX = centerY * depth * -10 * intensity;
        const rotateY = centerX * depth * 10 * intensity;
        transform += ` rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      element.style.transform = transform;
    });

    animationFrame.current = requestAnimationFrame(updateParallax);
  };

  /**
   * Handle mouse movement
   */
  const handleMouseMove = (e: MouseEvent) => {
    mousePosition.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    };
  };

  /**
   * Handle device orientation (mobile)
   */
  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;

    // Map device orientation to 0-1 range
    const x = (e.gamma + 45) / 90; // gamma: left-right tilt (-90 to 90)
    const y = (e.beta + 45) / 90;  // beta: front-back tilt (-180 to 180)

    mousePosition.current = {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    };
  };

  useEffect(() => {
    // Start animation loop
    updateParallax();

    // Add event listeners
    if (isMobile.current) {
      window.addEventListener('deviceorientation', handleOrientation as EventListener);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    };
  }, [layers, intensity, ease, tiltEffect]);

  return { registerLayer };
}

/**
 * Scroll-based parallax
 */
export function useScrollParallax(speed: number = 0.5) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const offset = scrolled * speed;

      element.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return elementRef;
}

/**
 * Create entrance parallax stagger effect
 */
export function createParallaxEntrance(
  elements: HTMLElement[],
  options: {
    stagger?: number;
    duration?: number;
    distance?: number;
    ease?: string;
  } = {}
) {
  const {
    stagger = 0.1,
    duration = 1.5,
    distance = 100,
    ease = 'power3.out'
  } = options;

  const timeline = gsap.timeline();

  elements.forEach((element, index) => {
    // Calculate depth based on index (farther back = enters earlier)
    const depth = 1 - (index / elements.length);

    timeline.fromTo(
      element,
      {
        y: distance * (1 - depth),
        opacity: 0,
        scale: 0.95
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration,
        ease
      },
      index * stagger
    );
  });

  return timeline;
}

/**
 * Floating animation with subtle parallax feel
 */
export function createFloatingMotion(
  element: HTMLElement,
  options: {
    amplitude?: number;
    frequency?: number;
    rotation?: boolean;
  } = {}
) {
  const {
    amplitude = 20,
    frequency = 3,
    rotation = false
  } = options;

  const timeline = gsap.timeline({ repeat: -1, yoyo: true });

  const animationProps: any = {
    y: `+=${amplitude}`,
    duration: frequency,
    ease: 'sine.inOut'
  };

  if (rotation) {
    animationProps.rotation = '+=5';
  }

  timeline.to(element, animationProps);

  return timeline;
}

/**
 * Depth-based scaling (objects closer are bigger)
 */
export function applyDepthScale(element: HTMLElement, depth: number) {
  const scale = 0.8 + (depth * 0.4); // Range: 0.8 to 1.2
  gsap.set(element, { scale });
}

export default {
  useParallax,
  useScrollParallax,
  createParallaxEntrance,
  createFloatingMotion,
  applyDepthScale
};
