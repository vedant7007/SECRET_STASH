/**
 * FinaleSupernova.v2.tsx
 * The emotional climax - orchestrated finale with heart nebula
 */

import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import '../styles/FinaleSupernova.v2.css';

const HeartNebula = ({ phase }: { phase: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = phase === 'explosion' ? 3 : 0.5;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#FFCBA4"
        emissive="#FFB6C1"
        emissiveIntensity={phase === 'explosion' ? 3 : 1}
      />
    </mesh>
  );
};

const FinaleSupernova_V2 = () => {
  const [phase, setPhase] = useState<'convergence' | 'explosion' | 'message'>('convergence');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('explosion'), 3000);
    const timer2 = setTimeout(() => setPhase('message'), 6000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="finale-v2-container">
      <div className="finale-v2-canvas">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 0]} intensity={phase === 'explosion' ? 8 : 2} color="#FFB6C1" />

          <HeartNebula phase={phase} />

          <EffectComposer>
            <Bloom intensity={phase === 'explosion' ? 3 : 1} luminanceThreshold={0} luminanceSmoothing={0.9} />
            <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="finale-v2-content">
        <AnimatePresence mode="wait">
          {phase === 'convergence' && (
            <motion.div
              key="convergence"
              className="finale-phase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
            >
              <p className="finale-subtitle">All moments converge...</p>
            </motion.div>
          )}

          {phase === 'explosion' && (
            <motion.div
              key="explosion"
              className="finale-phase"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
            >
              <p className="finale-subtitle">Into infinite light...</p>
            </motion.div>
          )}

          {phase === 'message' && (
            <motion.div
              key="message"
              className="finale-message"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 3 }}
            >
              <motion.h1
                className="finale-title"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 2 }}
              >
                Happy Birthday, Thanishka
              </motion.h1>

              <motion.p
                className="finale-quote"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 3 }}
              >
                In a universe of infinite possibilities,
                <br />
                you are the one constant that makes everything make sense.
              </motion.p>

              <motion.p
                className="finale-signature"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 6, duration: 2 }}
              >
                — With all my love, Vedant
              </motion.p>

              <motion.button
                className="finale-restart-btn"
                onClick={() => window.location.reload()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 8, duration: 2 }}
                whileHover={{ scale: 1.05 }}
              >
                Experience Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FinaleSupernova_V2;
