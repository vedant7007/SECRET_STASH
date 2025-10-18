/**
 * WordConstellation.tsx
 *
 * Words orbit in space, forming patterns of meaning.
 * The language of us, written in starlight.
 *
 * Emotion: Wonder, connection, poetic beauty
 */

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import useSceneStore from '../core/SceneManager';
import wordsData from '../data/words.json';
import '../styles/WordConstellation.css';

interface FloatingWordProps {
  text: string;
  position: [number, number, number];
  index: number;
}

const FloatingWord: React.FC<FloatingWordProps> = ({ text, position, index }) => {
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
      fontSize={0.3}
      color="#FFB6C1"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
};

const WordConstellation = () => {
  const { nextScene } = useSceneStore();
  const words: string[] = wordsData as string[];

  // Generate spherical positions for words
  const wordPositions: [number, number, number][] = words.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / words.length);
    const theta = Math.sqrt(words.length * Math.PI) * phi;
    const radius = 5;

    return [
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi),
    ];
  });

  return (
    <div className="constellation-container">
      <div className="constellation-canvas">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#8A4FFF" />

          {words.map((word, index) => (
            <FloatingWord
              key={index}
              text={word}
              position={wordPositions[index]}
              index={index}
            />
          ))}
        </Canvas>
      </div>

      <div className="constellation-content">
        <motion.h2
          className="constellation-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          Constellation of Words
        </motion.h2>

        <motion.p
          className="constellation-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1, duration: 2 }}
        >
          These are the words that define us
        </motion.p>

        <motion.button
          className="constellation-continue-btn"
          onClick={nextScene}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue Journey
        </motion.button>
      </div>
    </div>
  );
};

export default WordConstellation;
