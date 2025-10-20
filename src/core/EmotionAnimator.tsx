/**
 * EmotionAnimator.tsx — PHASE 3: EMOTIONAL INTEGRATION
 *
 * React component that applies emotion-based animations to children
 * Translates emotional metadata into visual micro-interactions
 *
 * Philosophy: Emotions are not static labels.
 * They are living motions that breathe and pulse.
 */

import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { getAnimationForEmotion, AnimationEffect } from './ContentTypes';

interface EmotionAnimatorProps {
  emotion: string;
  effect?: string;
  children: ReactNode;
  trigger?: 'mount' | 'hover' | 'tap' | 'always';
  delay?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

/**
 * Convert animation effect config to Framer Motion variants
 */
function createVariants(animConfig: AnimationEffect, trigger: string): Variants {
  const { properties, duration, easing } = animConfig;

  const baseTransition = {
    duration: duration / 1000, // Convert ms to seconds
    ease: easing,
  };

  switch (trigger) {
    case 'mount':
      return {
        hidden: {
          opacity: 0,
          scale: 0.8,
        },
        visible: {
          ...properties,
          transition: baseTransition,
        },
      };

    case 'hover':
      return {
        rest: {
          scale: 1,
          opacity: 1,
        },
        hover: {
          ...properties,
          transition: baseTransition,
        },
      };

    case 'tap':
      return {
        rest: {
          scale: 1,
        },
        tap: {
          ...properties,
          transition: { ...baseTransition, duration: duration / 2000 },
        },
      };

    case 'always':
      return {
        animate: {
          ...properties,
          transition: {
            ...baseTransition,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      };

    default:
      return {
        visible: properties,
      };
  }
}

/**
 * EmotionAnimator Component
 * Wraps children with emotion-driven animations
 */
const EmotionAnimator: React.FC<EmotionAnimatorProps> = ({
  emotion,
  effect,
  children,
  trigger = 'mount',
  delay = 0,
  className,
  onAnimationComplete,
}) => {
  const animConfig = getAnimationForEmotion(emotion);
  const variants = createVariants(animConfig, trigger);

  // Determine initial and animate states based on trigger
  const getAnimationProps = () => {
    switch (trigger) {
      case 'mount':
        return {
          initial: 'hidden',
          animate: 'visible',
          transition: { delay },
        };

      case 'hover':
        return {
          initial: 'rest',
          whileHover: 'hover',
        };

      case 'tap':
        return {
          initial: 'rest',
          whileTap: 'tap',
        };

      case 'always':
        return {
          animate: 'animate',
        };

      default:
        return {
          animate: 'visible',
        };
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      onAnimationComplete={onAnimationComplete}
      {...getAnimationProps()}
    >
      {children}
    </motion.div>
  );
};

export default EmotionAnimator;

/**
 * Specialized emotion animators for common use cases
 */

/**
 * Text that fades in with emotion-based timing
 */
export const EmotionalText: React.FC<{
  text: string;
  emotion: string;
  delay?: number;
  className?: string;
}> = ({ text, emotion, delay, className }) => {
  return (
    <EmotionAnimator emotion={emotion} trigger="mount" delay={delay} className={className}>
      <span>{text}</span>
    </EmotionAnimator>
  );
};

/**
 * Interactive element with hover emotion
 */
export const EmotionalButton: React.FC<{
  children: ReactNode;
  emotion: string;
  onClick?: () => void;
  className?: string;
}> = ({ children, emotion, onClick, className }) => {
  return (
    <EmotionAnimator emotion={emotion} trigger="hover">
      <button onClick={onClick} className={className}>
        {children}
      </button>
    </EmotionAnimator>
  );
};

/**
 * Pulsing glow element (always animating)
 */
export const EmotionalGlow: React.FC<{
  children: ReactNode;
  emotion: string;
  className?: string;
}> = ({ children, emotion, className }) => {
  return (
    <EmotionAnimator emotion={emotion} trigger="always" className={className}>
      {children}
    </EmotionAnimator>
  );
};

/**
 * Staggered list of emotional items
 */
export const EmotionalList: React.FC<{
  items: Array<{ id: string | number; text: string; emotion: string }>;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}> = ({ items, staggerDelay = 0.1, className, itemClassName }) => {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <EmotionalText
          key={item.id}
          text={item.text}
          emotion={item.emotion}
          delay={index * staggerDelay}
          className={itemClassName}
        />
      ))}
    </div>
  );
};
