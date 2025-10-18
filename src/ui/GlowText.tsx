/**
 * GlowText.tsx
 *
 * Text that radiates emotion.
 * Words become light.
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import '../styles/GlowText.css';

interface GlowTextProps extends Omit<HTMLMotionProps<'p'>, 'children'> {
  children: React.ReactNode;
  glowColor?: string;
  intensity?: 'soft' | 'medium' | 'strong';
  animated?: boolean;
}

const GlowText: React.FC<GlowTextProps> = ({
  children,
  glowColor = '#FFB6C1',
  intensity = 'medium',
  animated = false,
  ...props
}) => {
  const getGlowIntensity = () => {
    switch (intensity) {
      case 'soft':
        return '0 0 10px';
      case 'medium':
        return '0 0 20px';
      case 'strong':
        return '0 0 40px';
      default:
        return '0 0 20px';
    }
  };

  const glowStyle = {
    textShadow: `${getGlowIntensity()} ${glowColor}`,
    color: glowColor,
  };

  return (
    <motion.p
      className="glow-text"
      style={glowStyle}
      animate={
        animated
          ? {
              textShadow: [
                `${getGlowIntensity()} ${glowColor}`,
                `0 0 ${parseInt(getGlowIntensity()) * 1.5}px ${glowColor}`,
                `${getGlowIntensity()} ${glowColor}`,
              ],
            }
          : undefined
      }
      transition={
        animated
          ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.p>
  );
};

export default GlowText;
