/**
 * MelodySphere.tsx
 *
 * Music becomes visible. Rhythm becomes light.
 * Particles dance to the beat of songs that remind us of each other.
 *
 * Emotion: Elation, movement, celebration
 */

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { createParticleSystem } from '../core/ParticleEngine';
import useSceneStore from '../core/SceneManager';
import '../styles/MelodySphere.css';

const BeatParticles = ({ isPlaying }: { isPlaying: boolean }) => {
  const particleSystemRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (particleSystemRef.current && isPlaying) {
      particleSystemRef.current.update(delta);

      // Pulse effect synced to "beat"
      const beat = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
      if (groupRef.current) {
        groupRef.current.scale.setScalar(1 + beat * 0.2);
      }
    }
  });

  return <group ref={groupRef} />;
};

const MelodySphere = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyric, setCurrentLyric] = useState('');
  const { nextScene } = useSceneStore();

  // Placeholder song data
  const song = {
    title: 'Our Song',
    artist: 'The Universe',
    lyrics: [
      { time: 0, line: 'Every moment with you feels like home' },
      { time: 4, line: 'In your eyes I see galaxies unfold' },
      { time: 8, line: 'We dance through time, hand in hand' },
      { time: 12, line: 'Building forever in grains of sand' },
    ],
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);

    if (!isPlaying) {
      // Simulate lyric progression
      let lyricIndex = 0;
      const lyricInterval = setInterval(() => {
        if (lyricIndex < song.lyrics.length) {
          setCurrentLyric(song.lyrics[lyricIndex].line);
          lyricIndex++;
        } else {
          clearInterval(lyricInterval);
        }
      }, 4000);
    }
  };

  return (
    <div className="melody-container">
      <div className="melody-canvas">
        <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} color="#FFB6C1" intensity={isPlaying ? 1 : 0.3} />
          <pointLight position={[-5, -5, -5]} color="#8A4FFF" intensity={isPlaying ? 1 : 0.3} />

          <BeatParticles isPlaying={isPlaying} />
        </Canvas>
      </div>

      <div className="melody-content">
        <motion.h2
          className="melody-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          Melody Sphere
        </motion.h2>

        <motion.div
          className="melody-player"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <p className="song-title">{song.title}</p>
          <p className="song-artist">{song.artist}</p>

          <button
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlay}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {currentLyric && (
            <motion.p
              className="current-lyric"
              key={currentLyric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
            >
              {currentLyric}
            </motion.p>
          )}
        </motion.div>

        <motion.button
          className="melody-continue-btn"
          onClick={nextScene}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue to Finale
        </motion.button>
      </div>
    </div>
  );
};

export default MelodySphere;
