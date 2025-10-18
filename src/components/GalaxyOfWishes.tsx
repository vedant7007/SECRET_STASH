/**
 * GalaxyOfWishes.tsx
 *
 * A constellation of desires made tangible.
 * Each shooting star carries a wish written just for her.
 *
 * Emotion: Joy, playfulness, wonder
 */

import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { createParticleSystem } from '../core/ParticleEngine';
import useSceneStore from '../core/SceneManager';
import audioManager from '../core/AudioManager';
import wishesData from '../data/wishes.json';
import '../styles/GalaxyOfWishes.css';

interface Wish {
  id: number;
  text: string;
  animation: 'shooting-star' | 'twinkle' | 'bloom';
}

// Shooting star component
const ShootingStar = ({ onComplete }: { onComplete: () => void }) => {
  const starRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useFrame((state, delta) => {
    if (starRef.current) {
      starRef.current.position.x -= delta * 5;
      starRef.current.position.y -= delta * 2;
    }
  });

  return (
    <group position={[8, 6, -5]}>
      <mesh ref={starRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#FFB6C1" />
      </mesh>
    </group>
  );
};

// 3D Galaxy background
const GalaxyBackground = () => {
  const particleSystemRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const particleSystem = createParticleSystem('stars', {
      count: 5000,
      size: 0.03,
      color: ['#FFB6C1', '#8A4FFF', '#80F5FF', '#FFCBA4'],
      spread: 25,
      opacity: 0.7,
      speed: 0.003,
      randomness: 0.4,
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

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0001;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return <group ref={groupRef} />;
};

const GalaxyOfWishes = () => {
  const [currentWishIndex, setCurrentWishIndex] = useState<number | null>(null);
  const [showStar, setShowStar] = useState(false);
  const { nextScene } = useSceneStore();

  const wishes: Wish[] = wishesData as Wish[];
  const currentWish = currentWishIndex !== null ? wishes[currentWishIndex] : null;

  const handleStarClick = () => {
    // Play sound effect
    audioManager.fx('star_click', 0.3);

    // Trigger shooting star
    setShowStar(true);

    // Show next wish
    if (currentWishIndex === null) {
      setCurrentWishIndex(0);
    } else if (currentWishIndex < wishes.length - 1) {
      setCurrentWishIndex(currentWishIndex + 1);
    } else {
      // All wishes revealed
      setCurrentWishIndex(null);
    }

    setTimeout(() => setShowStar(false), 3000);
  };

  const handleContinue = () => {
    nextScene();
  };

  return (
    <div className="galaxy-container">
      {/* 3D Background */}
      <div className="galaxy-canvas">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <GalaxyBackground />
          {showStar && <ShootingStar onComplete={() => setShowStar(false)} />}
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="galaxy-content">
        <motion.h2
          className="galaxy-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
        >
          Galaxy of Wishes
        </motion.h2>

        <motion.p
          className="galaxy-instruction"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1, duration: 2 }}
        >
          Click the stars to reveal wishes made for you
        </motion.p>

        {/* Interactive star field */}
        <div className="galaxy-star-field">
          {wishes.map((wish, index) => (
            <motion.div
              key={wish.id}
              className={`galaxy-star ${currentWishIndex !== null && index <= currentWishIndex ? 'revealed' : ''}`}
              style={{
                left: `${15 + (index % 5) * 15}%`,
                top: `${20 + Math.floor(index / 5) * 15}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 1 }}
              whileHover={{ scale: 1.5, filter: 'brightness(1.5)' }}
              onClick={handleStarClick}
            >
              <div className="star-glow"></div>
            </motion.div>
          ))}
        </div>

        {/* Wish display */}
        <AnimatePresence mode="wait">
          {currentWish && (
            <motion.div
              key={currentWish.id}
              className="galaxy-wish-display"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <p className="wish-text">{currentWish.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <motion.div
          className="galaxy-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="progress-text">
            {currentWishIndex !== null ? currentWishIndex + 1 : 0} / {wishes.length} wishes revealed
          </p>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: '0%' }}
              animate={{
                width: `${((currentWishIndex !== null ? currentWishIndex + 1 : 0) / wishes.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </motion.div>

        {/* Continue button (appears after all wishes) */}
        {currentWishIndex !== null && currentWishIndex >= wishes.length - 1 && (
          <motion.button
            className="galaxy-continue-btn"
            onClick={handleContinue}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 1 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 182, 193, 0.8)' }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to Our World
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default GalaxyOfWishes;
