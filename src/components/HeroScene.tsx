/**
 * HeroScene.tsx
 *
 * The convergence point.
 * Where all particles of affection collapse into a singular truth:
 * "This was made for you."
 *
 * Emotion: Awe, belonging, grandeur with intimacy
 */

import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { createParticleSystem } from '../core/ParticleEngine';
import useSceneStore from '../core/SceneManager';
import '../styles/HeroScene.css';

// 3D Particle Background
const ParticleField = () => {
  const particleSystemRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const particleSystem = createParticleSystem('stars', {
      count: 3000,
      size: 0.05,
      color: ['#FFB6C1', '#8A4FFF', '#80F5FF'],
      spread: 20,
      opacity: 0.8,
      speed: 0.005,
      randomness: 0.3,
    });

    particleSystemRef.current = particleSystem;

    if (groupRef.current) {
      groupRef.current.add(particleSystem.points);
    }

    return () => {
      particleSystem.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    if (particleSystemRef.current) {
      particleSystemRef.current.update(delta);
    }

    // Gentle rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0002;
    }
  });

  return <group ref={groupRef} />;
};

const HeroScene = () => {
  const { nextScene } = useSceneStore();

  const handleContinue = () => {
    nextScene();
  };

  return (
    <div className="hero-container">
      {/* 3D Background */}
      <div className="hero-canvas">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ParticleField />
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="hero-content">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, ease: 'easeOut' }}
        >
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 2 }}
          >
            For Thanishka
          </motion.h1>

          <motion.div
            className="hero-subtitle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 2 }}
          >
            <p className="hero-subtitle">
              Some build code. Some build galaxies.
            </p>
            <p className="hero-subtitle-accent">
              This one builds a feeling.
            </p>
          </motion.div>

          <motion.p
            className="hero-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 3 }}
          >
            Every star in this universe carries a piece of my heart.
            <br />
            Every photon of light whispers your name.
            <br />
            This is where everything begins.
          </motion.p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="hero-nav"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 6, duration: 1.5 }}
        >
          <motion.button
            className="hero-button"
            onClick={handleContinue}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 40px rgba(255, 182, 193, 0.8)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Journey
          </motion.button>

          <p className="hero-hint">
            Click or press Space to continue
          </p>
        </motion.div>
      </div>

      {/* Ambient glow effect */}
      <motion.div
        className="hero-glow"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      ></motion.div>

      {/* Keyboard navigation */}
      <KeyboardNav onNext={handleContinue} />
    </div>
  );
};

// Helper component for keyboard shortcuts
const KeyboardNav = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onNext]);

  return null;
};

export default HeroScene;
