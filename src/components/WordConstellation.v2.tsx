/**
 * WordConstellation.v2.tsx
 * Floating 3D typography with dynamic formations
 */

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import useSceneStore from '../core/SceneManager';
import wordsData from '../data/words.json';
import '../styles/WordConstellation.v2.css';

const FloatingWord = ({ text, position, index }: { text: string; position: [number, number, number]; index: number }) => {
  const textRef = useRef<any>(null);

  useFrame((state) => {
    if (textRef.current) {
      const time = state.clock.elapsedTime;
      textRef.current.position.x = position[0] + Math.sin(time * 0.3 + index) * 0.5;
      textRef.current.position.y = position[1] + Math.cos(time * 0.2 + index) * 0.5;
      textRef.current.rotation.y = time * 0.1;
    }
  });

  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={0.4}
      color="#FFB6C1"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#8A4FFF"
    >
      {text}
    </Text>
  );
};

const WordConstellationV2 = () => {
  const { nextScene } = useSceneStore();
  const words: string[] = wordsData as string[];

  const wordPositions: [number, number, number][] = words.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / words.length);
    const theta = Math.sqrt(words.length * Math.PI) * phi;
    const radius = 6;

    return [
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi),
    ];
  });

  return (
    <div className="constellation-v2-container">
      <div className="constellation-v2-canvas">
        <Canvas camera={{ position: [0, 0, 12], fov: 75 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#8A4FFF" intensity={1} />

          {words.map((word, index) => (
            <FloatingWord
              key={index}
              text={word}
              position={wordPositions[index]}
              index={index}
            />
          ))}

          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="constellation-v2-content">
        <motion.h2
          className="constellation-v2-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          Constellation of Words
        </motion.h2>

        <motion.p
          className="constellation-v2-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1, duration: 2 }}
        >
          The language that defines us
        </motion.p>

        <motion.button
          className="constellation-v2-continue-btn"
          onClick={nextScene}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          Continue Journey
        </motion.button>
      </div>
    </div>
  );
};

export default WordConstellationV2;
