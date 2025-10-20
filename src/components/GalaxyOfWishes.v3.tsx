/**
 * GalaxyOfWishes.v3.tsx
 *
 * OPTIMIZED & ACCESSIBLE GALAXY OF WISHES
 *
 * Changes from V2:
 * - Reduced particles from 8000 to 800-3000 (adaptive)
 * - InstancedMesh for better performance
 * - Keyboard navigation for wish stars
 * - Screen-reader labels
 * - Segmented progress bar
 * - WCAG-compliant contrast
 * - Reduced motion support
 *
 * Philosophy: Each wish is a star, each star is a promise kept.
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import useSettingsStore from '../core/SettingsManager';
import useCaptionStore, { createCaption } from '../core/CaptionManager';
import audioManager from '../core/AudioManager';
import useSceneStore from '../core/SceneManager';
import wishesData from '../data/wishes.json';
import '../styles/GalaxyOfWishes.v3.css';

// Optimized galaxy background particles using InstancedMesh
const GalaxyParticles = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { performance, accessibility } = useSettingsStore();
  const particleCount = performance.galaxyParticles;

  useEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < particleCount; i++) {
      // Spiral galaxy distribution
      const angle = i * 0.1;
      const radius = i * 0.02;

      dummy.position.x = Math.cos(angle) * radius;
      dummy.position.y = (Math.random() - 0.5) * 10;
      dummy.position.z = Math.sin(angle) * radius;

      dummy.scale.setScalar(Math.random() * 0.3 + 0.1);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particleCount]);

  useFrame(({ clock }) => {
    if (!meshRef.current || accessibility.reducedMotion) return;

    const rotationSpeed = 0.05;
    meshRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#8A4FFF" transparent opacity={0.6} />
    </instancedMesh>
  );
};

// Interactive wish star
const WishStar = ({ position, index, onClick, isRevealed, focused }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { accessibility } = useSettingsStore();

  useFrame(({ clock }) => {
    if (!meshRef.current || accessibility.reducedMotion) return;

    const pulseSpeed = 1 + index * 0.1;
    const scale = 0.3 + Math.sin(clock.getElapsedTime() * pulseSpeed) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} position={position} onClick={onClick}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial
        color={isRevealed ? '#4CAF50' : focused ? '#FFEB3B' : '#FFB6C1'}
        emissive={isRevealed ? '#4CAF50' : focused ? '#FFEB3B' : '#FFB6C1'}
        emissiveIntensity={focused ? 1.5 : isRevealed ? 0.8 : 0.5}
      />
    </mesh>
  );
};

// Main component
const GalaxyOfWishes = () => {
  const [revealedWishes, setRevealedWishes] = useState<Set<number>>(new Set());
  const [selectedWish, setSelectedWish] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { setScene } = useSceneStore();
  const { showCaption } = useCaptionStore();
  const { accessibility } = useSettingsStore();

  const wishes = wishesData.slice(0, 10); // Limit to 10 wishes
  const totalWishes = wishes.length;
  const progress = (revealedWishes.size / totalWishes) * 100;

  useEffect(() => {
    showCaption(
      createCaption(
        'galaxy-intro',
        'Each star holds a wish I made for you. Click to reveal them.',
        5000,
        'Vedant'
      )
    );
  }, [showCaption]);

  // Keyboard navigation
  useEffect(() => {
    if (!accessibility.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setFocusedIndex((prev) => (prev + 1) % totalWishes);
      } else if (e.key === 'ArrowLeft') {
        setFocusedIndex((prev) => (prev - 1 + totalWishes) % totalWishes);
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleWishClick(focusedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, accessibility.keyboardNavigation]);

  const handleWishClick = (index: number) => {
    if (revealedWishes.has(index)) return;

    setRevealedWishes((prev) => new Set(prev).add(index));
    setSelectedWish(index);

    // audioManager.fx('wish_reveal'); // When audio exists

    showCaption(
      createCaption('wish-' + index, wishes[index].text, 4000, 'Vedant')
    );

    // Auto-close after 4s
    setTimeout(() => setSelectedWish(null), 4000);

    // If all wishes revealed, proceed
    if (revealedWishes.size + 1 === totalWishes) {
      setTimeout(() => {
        showCaption(
          createCaption('galaxy-complete', 'All wishes revealed. Your turn to make one.', 3000)
        );

        setTimeout(() => setScene('globe'), 4000);
      }, 5000);
    }
  };

  // Generate star positions in a circle
  const starPositions = wishes.map((_, i) => {
    const angle = (i / totalWishes) * Math.PI * 2;
    const radius = 8;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    );
  });

  return (
    <div className="galaxy-scene-v3" role="main" aria-label="Galaxy of Wishes">
      {/* Three.js Canvas */}
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />

        <GalaxyParticles />

        {/* Wish stars */}
        {starPositions.map((pos, i) => (
          <WishStar
            key={i}
            position={pos}
            index={i}
            isRevealed={revealedWishes.has(i)}
            focused={focusedIndex === i}
            onClick={() => handleWishClick(i)}
          />
        ))}
      </Canvas>

      {/* UI Overlay */}
      <div className="galaxy-ui">
        {/* Progress bar (segmented) */}
        <div className="progress-container" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-segments">
            {wishes.map((_, i) => (
              <div
                key={i}
                className={`progress-segment ${revealedWishes.has(i) ? 'revealed' : ''}`}
                aria-label={`Wish ${i + 1} ${revealedWishes.has(i) ? 'revealed' : 'hidden'}`}
              />
            ))}
          </div>
          <div className="progress-text">{revealedWishes.size} / {totalWishes} wishes revealed</div>
        </div>

        {/* Keyboard hint */}
        {accessibility.keyboardNavigation && (
          <div className="keyboard-hint" aria-live="polite">
            Use arrow keys to navigate, Enter/Space to reveal
          </div>
        )}

        {/* Wish card */}
        <AnimatePresence>
          {selectedWish !== null && (
            <motion.div
              className="wish-card"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.4 }}
              role="dialog"
              aria-labelledby="wish-text"
            >
              <div className="wish-number">Wish #{selectedWish + 1}</div>
              <div className="wish-text" id="wish-text">{wishes[selectedWish].text}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalaxyOfWishes;
