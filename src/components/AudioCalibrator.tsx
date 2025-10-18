/**
 * AudioCalibrator.tsx
 *
 * The threshold between silence and symphony.
 * Here, she grants permission for the universe to speak.
 *
 * Emotion: Anticipation, curiosity, intimacy
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import audioManager from '../core/AudioManager';
import useSceneStore from '../core/SceneManager';
import '../styles/AudioCalibrator.css';

const AudioCalibrator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const { setScene } = useSceneStore();

  useEffect(() => {
    // Preload critical audio files
    const preloadAudio = async () => {
      // TEMP: Skip audio loading for now to show V2 visuals
      // Simulate loading for UI purposes
      const simulateProgress = () => {
        return new Promise<void>((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 25;
            setLoadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      };

      await simulateProgress();
      setIsReady(true);
    };

    if (isLoading) {
      preloadAudio();
    }
  }, [isLoading]);

  const handleEnter = () => {
    setIsLoading(true);
  };

  const handleBegin = () => {
    // Start the journey
    setScene('hero');
  };

  return (
    <div className="calibrator-container">
      {/* Animated background particles */}
      <div className="calibrator-stars"></div>

      <div className="calibrator-content">
        {!isLoading ? (
          <motion.div
            className="calibrator-welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <h1 className="calibrator-title">
              Welcome to the Loveverse
            </h1>

            <p className="calibrator-subtitle">
              A universe built for you, Thanishka
            </p>

            <motion.p
              className="calibrator-whisper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 3 }}
            >
              This experience is best with sound...
            </motion.p>

            <motion.button
              className="calibrator-button"
              onClick={handleEnter}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3, duration: 1, ease: 'backOut' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 182, 193, 0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              Enable Audio & Enter
            </motion.button>

            <motion.p
              className="calibrator-note"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 4, duration: 2 }}
            >
              Use headphones for the full experience
            </motion.p>
          </motion.div>
        ) : !isReady ? (
          <motion.div
            className="calibrator-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="loading-ring"></div>

            <p className="loading-text">
              Tuning into your frequency...
            </p>

            <div className="loading-progress">
              <div
                className="loading-progress-bar"
                style={{ width: `${loadProgress}%` }}
              ></div>
            </div>

            <p className="loading-percentage">{Math.round(loadProgress)}%</p>
          </motion.div>
        ) : (
          <motion.div
            className="calibrator-ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <h2 className="ready-title">Everything is ready</h2>

            <p className="ready-subtitle">
              Take a breath. Then step through.
            </p>

            <motion.button
              className="calibrator-button primary"
              onClick={handleBegin}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              whileHover={{
                scale: 1.08,
                boxShadow: '0 0 40px rgba(255, 182, 193, 0.8)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              Begin the Journey
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Heartbeat pulse effect */}
      <motion.div
        className="calibrator-pulse"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      ></motion.div>
    </div>
  );
};

export default AudioCalibrator;
