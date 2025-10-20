/**
 * SettingsButton.tsx — CINEMATIC REBUILD
 *
 * Floating settings trigger button
 * Always accessible, never intrusive
 */

import { motion } from 'framer-motion';
import './SettingsButton.css';

interface SettingsButtonProps {
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      className="settings-trigger"
      onClick={onClick}
      aria-label="Open settings"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m5.656-15.656l-4.242 4.242m0 6.364l4.242 4.242M1 12h6m6 0h6M4.344 4.344l4.242 4.242m6.364 0l4.242-4.242m-4.242 10.606l4.242 4.242m-10.606 0l-4.242 4.242" />
      </svg>
      <span className="sr-only">Settings</span>
    </motion.button>
  );
};

export default SettingsButton;
