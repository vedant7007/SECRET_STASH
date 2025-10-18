/**
 * ApologyGarden.tsx
 *
 * Where petals fall like tears softly spoken.
 * Each one carries an apology, each one asks for grace.
 *
 * Emotion: Tenderness, vulnerability, gentle sorrow
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import useSceneStore from '../core/SceneManager';
import apologies from '../data/apologies.json';
import '../styles/ApologyGarden.css';

interface Apology {
  id: number;
  text: string;
  intensity: 'soft' | 'deep';
}

// Falling petal component
interface PetalProps {
  initialPosition: [number, number, number];
  onCollect: () => void;
}

const Petal: React.FC<PetalProps> = ({ initialPosition, onCollect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && !collected) {
      // Falling motion with gentle sway
      meshRef.current.position.y -= delta * 0.5;
      meshRef.current.position.x += Math.sin(state.clock.elapsedTime + initialPosition[0]) * 0.01;
      meshRef.current.rotation.z += delta * 0.5;

      // Reset if fallen too far
      if (meshRef.current.position.y < -5) {
        meshRef.current.position.y = initialPosition[1];
      }
    }
  });

  const handleClick = () => {
    if (!collected) {
      setCollected(true);
      onCollect();
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
      onClick={handleClick}
      visible={!collected}
    >
      <planeGeometry args={[0.3, 0.4]} />
      <meshStandardMaterial
        color="#FFB6C1"
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Rain effect background
const RainEffect = () => {
  const rainRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!rainRef.current) return;

    const positions = new Float32Array(500 * 3);

    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    rainRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }, []);

  useFrame((state, delta) => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < 500; i++) {
        positions[i * 3 + 1] -= delta * 2;

        if (positions[i * 3 + 1] < -10) {
          positions[i * 3 + 1] = 10;
        }
      }

      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.05}
        color="#80F5FF"
        transparent
        opacity={0.3}
      />
    </points>
  );
};

const ApologyGarden = () => {
  const [collectedApologies, setCollectedApologies] = useState<number[]>([]);
  const [currentApology, setCurrentApology] = useState<Apology | null>(null);
  const { nextScene } = useSceneStore();

  const apologyList: Apology[] = apologies as Apology[];

  // Generate petal positions
  const petalPositions: [number, number, number][] = apologyList.map((_, index) => [
    (Math.random() - 0.5) * 8,
    3 + Math.random() * 5,
    (Math.random() - 0.5) * 5,
  ]);

  const handlePetalCollect = (index: number) => {
    if (!collectedApologies.includes(index)) {
      setCollectedApologies([...collectedApologies, index]);
      setCurrentApology(apologyList[index]);

      // Auto-hide after reading
      setTimeout(() => {
        setCurrentApology(null);
      }, 8000);
    }
  };

  const handleContinue = () => {
    nextScene();
  };

  const completionPercentage = (collectedApologies.length / apologyList.length) * 100;

  return (
    <div className="garden-container">
      {/* 3D Scene */}
      <div className="garden-canvas">
        <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFB6C1" />

          <RainEffect />

          {petalPositions.map((position, index) => (
            <Petal
              key={index}
              initialPosition={position}
              onCollect={() => handlePetalCollect(index)}
            />
          ))}

          {/* Ground reflection plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial
              color="#0E001A"
              opacity={0.5}
              transparent
            />
          </mesh>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="garden-content">
        <motion.h2
          className="garden-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          The Apology Garden
        </motion.h2>

        <motion.p
          className="garden-instruction"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 2 }}
        >
          Catch the falling petals to read each apology
        </motion.p>

        {/* Current apology display */}
        <AnimatePresence mode="wait">
          {currentApology && (
            <motion.div
              key={currentApology.id}
              className={`garden-apology-card ${currentApology.intensity}`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 1 }}
            >
              <p className="apology-text">{currentApology.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <motion.div
          className="garden-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="progress-label">
            {collectedApologies.length} / {apologyList.length} apologies read
          </p>

          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Continue button (appears after reading all) */}
        {collectedApologies.length >= apologyList.length && (
          <motion.button
            className="garden-continue-btn"
            onClick={handleContinue}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(128, 245, 255, 0.6)' }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to Promises
          </motion.button>
        )}
      </div>

      {/* Rain sound indicator */}
      <motion.div
        className="garden-rain-overlay"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
};

export default ApologyGarden;
