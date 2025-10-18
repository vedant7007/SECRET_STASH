/**
 * Button.tsx
 *
 * A button that glows with intention.
 * Every click is a choice to continue the journey.
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import '../styles/Button.css';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  glowColor?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  glowColor,
  children,
  ...props
}) => {
  const getGlowColor = () => {
    if (glowColor) return glowColor;

    switch (variant) {
      case 'primary':
        return 'rgba(255, 182, 193, 0.6)';
      case 'secondary':
        return 'rgba(138, 79, 255, 0.6)';
      case 'ghost':
        return 'rgba(128, 245, 255, 0.4)';
      default:
        return 'rgba(255, 182, 193, 0.6)';
    }
  };

  return (
    <motion.button
      className={`loveverse-button ${variant}`}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 30px ${getGlowColor()}`,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <span className="button-text">{children}</span>
      <span className="button-glow" style={{ background: getGlowColor() }}></span>
    </motion.button>
  );
};

export default Button;
