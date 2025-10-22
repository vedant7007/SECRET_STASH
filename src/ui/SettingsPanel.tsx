/**
 * SettingsPanel.tsx — CINEMATIC REBUILD PHASE 2
 *
 * User-facing accessibility and performance controls
 * Lets users customize their experience: motion, audio, contrast, quality
 *
 * Philosophy: Every viewer should control how they experience beauty.
 * Comfort before spectacle. Always.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSettingsStore, { QualityPreset } from '../core/SettingsManager';
import audioManager from '../core/AudioManager';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    quality,
    setQuality,
    accessibility,
    setAccessibility,
    haptics,
    setHaptics,
    isMobile,
    isLowEnd,
    deviceTier,
  } = useSettingsStore();

  const [localVolume, setLocalVolume] = useState(1.0);

  const handleVolumeChange = (value: number) => {
    setLocalVolume(value);
    audioManager.setVolume(value);
  };

  const qualityPresets: { value: QualityPreset; label: string; description: string }[] = [
    {
      value: 'low',
      label: 'Low',
      description: 'Prioritize performance (300-600 particles)',
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Balanced (800-1200 particles)',
    },
    {
      value: 'high',
      label: 'High',
      description: 'Beautiful (1500-2000 particles)',
    },
    {
      value: 'ultra',
      label: 'Ultra',
      description: 'Maximum beauty (2500-3500 particles)',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className="settings-panel"
            role="dialog"
            aria-labelledby="settings-title"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <header className="settings-header">
              <h2 id="settings-title" className="settings-title">
                Settings
              </h2>
              <button
                className="settings-close"
                onClick={onClose}
                aria-label="Close settings"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            {/* Content */}
            <div className="settings-content">
              {/* Device Info */}
              <div className="settings-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p>
                  Device Tier: {deviceTier.toUpperCase()}
                  {isMobile && ' (Mobile)'}
                  {isLowEnd && ' — Performance mode recommended'}
                </p>
              </div>

              {/* Performance Section */}
              <section className="settings-section">
                <h3 className="settings-section-title">Performance</h3>

                <div className="settings-group">
                  <label htmlFor="quality-select" className="settings-label">
                    Quality Preset
                  </label>
                  <select
                    id="quality-select"
                    className="settings-select"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as QualityPreset)}
                  >
                    {qualityPresets.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label} — {preset.description}
                      </option>
                    ))}
                  </select>
                  <p className="settings-help">
                    Higher quality = more particles & effects. Lower quality = smoother on older devices.
                  </p>
                </div>
              </section>

              {/* Accessibility Section */}
              <section className="settings-section">
                <h3 className="settings-section-title">Accessibility</h3>

                <div className="settings-group">
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={accessibility.reducedMotion}
                      onChange={(e) => setAccessibility('reducedMotion', e.target.checked)}
                    />
                    <span className="settings-toggle-slider" />
                    <span className="settings-toggle-label">
                      Reduce Motion
                      <small>Disables parallax, spinning, and heavy animations</small>
                    </span>
                  </label>
                </div>

                <div className="settings-group">
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={accessibility.enableCaptions}
                      onChange={(e) => setAccessibility('enableCaptions', e.target.checked)}
                    />
                    <span className="settings-toggle-slider" />
                    <span className="settings-toggle-label">
                      Show Captions
                      <small>Display subtitles for audio narration</small>
                    </span>
                  </label>
                </div>

                <div className="settings-group">
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={accessibility.highContrast}
                      onChange={(e) => setAccessibility('highContrast', e.target.checked)}
                    />
                    <span className="settings-toggle-slider" />
                    <span className="settings-toggle-label">
                      High Contrast
                      <small>Increase text contrast for better readability</small>
                    </span>
                  </label>
                </div>

                <div className="settings-group">
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={accessibility.keyboardNavigation}
                      onChange={(e) => setAccessibility('keyboardNavigation', e.target.checked)}
                    />
                    <span className="settings-toggle-slider" />
                    <span className="settings-toggle-label">
                      Keyboard Navigation
                      <small>Use arrow keys to navigate, Space to pause</small>
                    </span>
                  </label>
                </div>
              </section>

              {/* Audio Section */}
              <section className="settings-section">
                <h3 className="settings-section-title">Audio</h3>

                <div className="settings-group">
                  <label htmlFor="volume-slider" className="settings-label">
                    Master Volume: {Math.round(localVolume * 100)}%
                  </label>
                  <input
                    id="volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={localVolume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="settings-slider"
                    aria-label="Master volume"
                  />
                </div>

                <div className="settings-group">
                  <button
                    className="settings-button settings-button-secondary"
                    onClick={() => audioManager.toggleMute()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Toggle Mute
                  </button>
                </div>
              </section>

              {/* Haptic Feedback Section (Phase 4) */}
              {isMobile && (
                <section className="settings-section">
                  <h3 className="settings-section-title">Haptic Feedback</h3>

                  <div className="settings-group">
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={haptics.enabled}
                        onChange={(e) => setHaptics({ enabled: e.target.checked })}
                      />
                      <span className="settings-toggle-slider" />
                      <span className="settings-toggle-label">
                        Enable Haptics
                        <small>Feel emotional moments through vibration</small>
                      </span>
                    </label>
                  </div>

                  {haptics.enabled && (
                    <div className="settings-group">
                      <label htmlFor="haptic-intensity-slider" className="settings-label">
                        Haptic Intensity: {Math.round(haptics.intensity * 100)}%
                      </label>
                      <input
                        id="haptic-intensity-slider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={haptics.intensity}
                        onChange={(e) => setHaptics({ intensity: parseFloat(e.target.value) })}
                        className="settings-slider"
                        aria-label="Haptic feedback intensity"
                      />
                    </div>
                  )}
                </section>
              )}

              {/* Keyboard Shortcuts */}
              <section className="settings-section">
                <h3 className="settings-section-title">Keyboard Shortcuts</h3>
                <div className="settings-shortcuts">
                  <div className="shortcut-item">
                    <kbd>Space</kbd>
                    <span>Pause / Resume</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>→</kbd> or <kbd>N</kbd>
                    <span>Next Scene</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>←</kbd> or <kbd>P</kbd>
                    <span>Previous Scene</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>+</kbd> / <kbd>-</kbd>
                    <span>Volume Up / Down</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>M</kbd>
                    <span>Mute / Unmute</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Pause or Close</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="settings-footer">
              <p className="settings-footer-text">
                Made with love for Thanishka
              </p>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
