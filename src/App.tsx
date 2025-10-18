/**
 * App.tsx
 *
 * The emotional conductor.
 * Where all scenes harmonize into a singular journey.
 *
 * This is not just an app — it's a dimension.
 */

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import useSceneStore from './core/SceneManager';

// Scene components - V2 Cinematic versions
import AudioCalibrator from './components/AudioCalibrator';
import HeroScene from './components/HeroScene.v2';
import GalaxyOfWishes from './components/GalaxyOfWishes.v2';
import WorldGlobe from './components/WorldGlobe.v2';
import WordConstellation from './components/WordConstellation.v2';
import ApologyGarden from './components/ApologyGarden.v2';
import PromisesChamber from './components/PromisesChamber.v2';
import MelodySphere from './components/MelodySphere.v2';
import FinaleSupernova from './components/FinaleSupernova.v2';

// Styles
import './styles/globals.css';

function App() {
  const { currentScene, initializeScenes, isTransitioning } = useSceneStore();

  useEffect(() => {
    // Initialize scene registry on mount
    initializeScenes();

    // Log the journey beginning
    console.log('%c✨ Welcome to the Loveverse ✨', 'font-size: 20px; color: #FFB6C1; font-weight: bold;');
    console.log('%cA universe built with love for Thanishka', 'font-size: 14px; color: #8A4FFF; font-style: italic;');
    console.log('%cBy Vedant 💖', 'font-size: 12px; color: #FFCBA4;');
  }, [initializeScenes]);

  // Render current scene based on state
  const renderScene = () => {
    switch (currentScene) {
      case 'calibration':
        return <AudioCalibrator key="calibration" />;
      case 'hero':
        return <HeroScene key="hero" />;
      case 'galaxy':
        return <GalaxyOfWishes key="galaxy" />;
      case 'globe':
        return <WorldGlobe key="globe" />;
      case 'constellation':
        return <WordConstellation key="constellation" />;
      case 'garden':
        return <ApologyGarden key="garden" />;
      case 'sanctuary':
        return <PromisesChamber key="sanctuary" />;
      case 'melody':
        return <MelodySphere key="melody" />;
      case 'finale':
        return <FinaleSupernova key="finale" />;
      default:
        return <AudioCalibrator key="calibration" />;
    }
  };

  return (
    <div className="loveverse-app">
      <AnimatePresence mode="wait">
        {renderScene()}
      </AnimatePresence>

      {/* Global transition overlay */}
      {isTransitioning && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(14, 0, 26, 0.8)',
            zIndex: 9999,
            pointerEvents: 'none',
            transition: 'opacity 1.5s ease',
          }}
        />
      )}
    </div>
  );
}

export default App;
