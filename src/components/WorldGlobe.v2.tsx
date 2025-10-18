/**
 * WorldGlobe.v2.tsx
 * 3D spinning globe with orbiting photo memories
 * Emotion: Nostalgia, warmth, shared journey
 */

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import useSceneStore from '../core/SceneManager';
import '../styles/WorldGlobe.v2.css';

const Globe = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * (hovered ? 0.15 : 0.25);
    }
  });

  return (
    <Sphere
      ref={globeRef}
      args={[2.5, 64, 64]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color="#8A4FFF"
        emissive="#FFB6C1"
        emissiveIntensity={0.3}
        roughness={0.4}
        metalness={0.6}
        wireframe={false}
      />
    </Sphere>
  );
};

interface PhotoOrbitProps {
  index: number;
  total: number;
  onSelect: (index: number) => void;
  caption: string;
}

const PhotoOrbit: React.FC<PhotoOrbitProps> = ({ index, total, onSelect, caption }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const angle = (index / total) * Math.PI * 2 + state.clock.elapsedTime * 0.15;
      const radius = 5;
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = Math.sin(angle * 2) * 0.8;
      meshRef.current.lookAt(state.camera.position);

      const targetScale = hovered ? 1.4 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={() => onSelect(index)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1.2, 1.2]} />
      <meshStandardMaterial
        color={hovered ? '#FFCBA4' : '#ffffff'}
        emissive={hovered ? '#FFB6C1' : '#000000'}
        emissiveIntensity={hovered ? 0.5 : 0}
        transparent
        opacity={0.95}
      />
      {hovered && (
        <Html distanceFactor={10}>
          <div className="photo-tooltip">{caption}</div>
        </Html>
      )}
    </mesh>
  );
};

const WorldGlobeV2 = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const { nextScene } = useSceneStore();

  const captions = [
    'The day everything changed',
    'When laughter filled the air',
    'A quiet moment, just us',
    'Under the same sky',
    'Making memories',
    'Where time stopped',
  ];

  return (
    <div className="globe-v2-container">
      <div className="globe-v2-canvas">
        <Canvas camera={{ position: [0, 0, 10], fov: 55 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.2} color="#FFB6C1" />
          <pointLight position={[-10, -10, -10]} intensity={0.6} color="#8A4FFF" />

          <Globe />

          {captions.map((caption, index) => (
            <PhotoOrbit
              key={index}
              index={index}
              total={captions.length}
              onSelect={setSelectedPhoto}
              caption={caption}
            />
          ))}

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />

          <EffectComposer>
            <Bloom intensity={1} luminanceThreshold={0.3} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="globe-v2-content">
        <motion.h2
          className="globe-v2-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
        >
          Our World
        </motion.h2>

        <motion.p
          className="globe-v2-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1, duration: 2 }}
        >
          Every place we've touched, together
        </motion.p>

        <AnimatePresence>
          {selectedPhoto !== null && (
            <motion.div
              className="globe-v2-photo-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSelectedPhoto(null)}
            >
              <div className="photo-content">
                <div className="photo-placeholder">Memory {selectedPhoto + 1}</div>
                <p className="photo-caption">{captions[selectedPhoto]}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="globe-v2-continue-btn"
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

export default WorldGlobeV2;
