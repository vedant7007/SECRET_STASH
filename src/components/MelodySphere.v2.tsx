/**
 * MelodySphere.v2.tsx
 * Real-time audio visualization with beat-reactive particles
 */

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import useSceneStore from '../core/SceneManager';
import '../styles/MelodySphere.v2.css';

const BeatParticles = ({ isPlaying }: { isPlaying: boolean }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 3000;

  useFrame((state, delta) => {
    if (particlesRef.current && isPlaying) {
      const beat = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
      particlesRef.current.scale.setScalar(1 + beat * 0.3);
      particlesRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <points ref={particlesRef}>
      <sphereGeometry args={[5, 64, 64]} />
      <pointsMaterial
        size={0.05}
        color="#FFB6C1"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

const MelodySphereV2 = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyric, setCurrentLyric] = useState('');
  const { nextScene } = useSceneStore();

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
      let lyricIndex = 0;
      const interval = setInterval(() => {
        if (lyricIndex < song.lyrics.length) {
          setCurrentLyric(song.lyrics[lyricIndex].line);
          lyricIndex++;
        } else {
          clearInterval(interval);
        }
      }, 4000);
    }
  };

  return (
    <div className="melody-v2-container">
      <div className="melody-v2-canvas">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} color="#FFB6C1" intensity={isPlaying ? 1.5 : 0.5} />

          <BeatParticles isPlaying={isPlaying} />

          <EffectComposer>
            <Bloom intensity={isPlaying ? 2 : 1} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="melody-v2-content">
        <motion.h2
          className="melody-v2-title"
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
          className="melody-v2-continue-btn"
          onClick={nextScene}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          Continue to Finale
        </motion.button>
      </div>
    </div>
  );
};

export default MelodySphereV2;
