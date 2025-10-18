/**
 * FinaleSupernova.tsx
 *
 * The crescendo. The culmination.
 * All light, all love, exploding into eternal radiance.
 *
 * Emotion: Completion, peace, overwhelming beauty
 */

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import '../styles/FinaleSupernova.css';

const FinaleSupernova = () => {
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
    <div className="finale-container">
      {/* 3D Background with bloom effect */}
      <div className="finale-canvas">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 0]} intensity={phase === 'explosion' ? 5 : 1} color="#FFB6C1" />

          <mesh>
            <sphereGeometry args={[phase === 'explosion' ? 3 : 0.5, 32, 32]} />
            <meshStandardMaterial
              color="#FFCBA4"
              emissive="#FFB6C1"
              emissiveIntensity={2}
            />
          </mesh>

          <EffectComposer>
            <Bloom intensity={phase === 'explosion' ? 2 : 0.5} luminanceThreshold={0} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="finale-content">
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
                "In a universe of infinite possibilities,
                <br />
                you are the one constant that makes everything make sense."
              </motion.p>

              <motion.p
                className="finale-signature"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 6, duration: 2 }}
              >
                — With all my love, Vedant
              </motion.p>

              <motion.div
                className="finale-restart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 8, duration: 2 }}
              >
                <button
                  className="finale-restart-btn"
                  onClick={() => window.location.reload()}
                >
                  Experience Again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Particle burst effect */}
      <motion.div
        className="finale-particles"
        animate={{
          opacity: phase === 'explosion' ? [0, 1, 0] : 0,
        }}
        transition={{ duration: 2 }}
      />
    </div>
  );
};

export default FinaleSupernova;
