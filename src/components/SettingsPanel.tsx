/**
 * SettingsPanel.tsx
 *
 * User-accessible settings for performance and accessibility
 *
 * Features:
 * - Quality presets (Low, Medium, High, Ultra)
 * - Accessibility toggles
 * - Keyboard accessible
 * - Persistent storage
 *
 * Philosophy: Let users shape their experience.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSettingsStore, { type QualityPreset } from '../core/SettingsManager';
import '../styles/SettingsPanel.css';

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { quality, accessibility, setQuality, setAccessibility } = useSettingsStore();

  const qualities: { value: QualityPreset; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Best for older devices' },
    { value: 'medium', label: 'Medium', description: 'Balanced experience' },
    { value: 'high', label: 'High', description: 'Rich visuals' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality' },
  ];

  return (
    <>
      {/* Settings button (floating) */}
      <button
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close settings' : 'Open settings'}
        aria-expanded={isOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m-5.196-3.804L1 10.196m6 6L1 21.804m12-12L18.804 1m-6 12L21.804 18.804" />
        </svg>
      </button>

      {/* Settings panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="settings-panel"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 25 }}
              role="dialog"
              aria-labelledby="settings-title"
            >
              <h2 id="settings-title" className="settings-title">Settings</h2>

              {/* Quality presets */}
              <section className="settings-section">
                <h3 className="settings-section-title">Visual Quality</h3>
                <div className="quality-grid">
                  {qualities.map((q) => (
                    <button
                      key={q.value}
                      className={`quality-button ${quality === q.value ? 'active' : ''}`}
                      onClick={() => setQuality(q.value)}
                      aria-pressed={quality === q.value}
                    >
                      <div className="quality-label">{q.label}</div>
                      <div className="quality-description">{q.description}</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Accessibility */}
              <section className="settings-section">
                <h3 className="settings-section-title">Accessibility</h3>

                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={accessibility.reducedMotion}
                    onChange={(e) => setAccessibility('reducedMotion', e.target.checked)}
                  />
                  <span className="checkbox-label">
                    <strong>Reduced Motion</strong>
                    <small>Minimize animations and parallax</small>
                  </span>
                </label>

                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={accessibility.enableCaptions}
                    onChange={(e) => setAccessibility('enableCaptions', e.target.checked)}
                  />
                  <span className="checkbox-label">
                    <strong>Show Captions</strong>
                    <small>Display subtitles for audio</small>
                  </span>
                </label>

                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={accessibility.highContrast}
                    onChange={(e) => setAccessibility('highContrast', e.target.checked)}
                  />
                  <span className="checkbox-label">
                    <strong>High Contrast</strong>
                    <small>Increase text and border visibility</small>
                  </span>
                </label>

                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={accessibility.keyboardNavigation}
                    onChange={(e) => setAccessibility('keyboardNavigation', e.target.checked)}
                  />
                  <span className="checkbox-label">
                    <strong>Keyboard Navigation</strong>
                    <small>Enable keyboard shortcuts</small>
                  </span>
                </label>
              </section>

              {/* Close button */}
              <button className="settings-close" onClick={() => setIsOpen(false)}>
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsPanel;
