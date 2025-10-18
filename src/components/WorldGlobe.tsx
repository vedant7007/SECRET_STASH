/**
 * WorldGlobe.tsx
 *
 * A spinning memory of everywhere we've been together.
 * Photos orbit like moons around our shared world.
 *
 * Emotion: Nostalgia, warmth, connection
 */

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import useSceneStore from '../core/SceneManager';
import '../styles/WorldGlobe.css';

// Rotating globe with photo textures
const Globe = ({ photos }: { photos: string[] }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * (hovered ? 0.1 : 0.2);
    }
  });

  return (
    <Sphere
      ref={globeRef}
      args={[2, 64, 64]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color="#8A4FFF"
        emissive="#FFB6C1"
        emissiveIntensity={0.2}
        roughness={0.3}
        metalness={0.5}
      />
    </Sphere>
  );
};

// Photo frame orbiting the globe
interface PhotoOrbitProps {
  photo: string;
  index: number;
  total: number;
  onSelect: (index: number) => void;
}

const PhotoOrbit: React.FC<PhotoOrbitProps> = ({ photo, index, total, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const angle = (index / total) * Math.PI * 2 + state.clock.elapsedTime * 0.2;
      const radius = 4;
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = Math.sin(angle * 2) * 0.5;

      // Always face camera
      meshRef.current.lookAt(state.camera.position);

      // Scale on hover
      const targetScale = hovered ? 1.3 : 1;
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
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={hovered ? '#FFCBA4' : '#ffffff'}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

const WorldGlobe = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const { nextScene } = useSceneStore();

  // Placeholder photos - will be replaced with actual images
  const photos = [
    '/assets/images/thanishka_photos/memory_001.jpg',
    '/assets/images/thanishka_photos/memory_002.jpg',
    '/assets/images/thanishka_photos/memory_003.jpg',
    '/assets/images/thanishka_photos/memory_004.jpg',
    '/assets/images/thanishka_photos/memory_005.jpg',
    '/assets/images/thanishka_photos/memory_006.jpg',
  ];

  const captions = [
    'The day everything changed',
    'When laughter filled the air',
    'A quiet moment, just us',
    'Under the same sky',
    'Making memories',
    'Where time stopped',
  ];

  const handlePhotoSelect = (index: number) => {
    setSelectedPhoto(index);
  };

  const handleClose = () => {
    setSelectedPhoto(null);
  };

  const handleContinue = () => {
    nextScene();
  };

  return (
    <div className="globe-container">
      {/* 3D Scene */}
      <div className="globe-canvas">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#FFB6C1" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8A4FFF" />

          <Globe photos={photos} />

          {photos.map((photo, index) => (
            <PhotoOrbit
              key={index}
              photo={photo}
              index={index}
              total={photos.length}
              onSelect={handlePhotoSelect}
            />
          ))}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="globe-content">
        <motion.h2
          className="globe-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
        >
          Our World
        </motion.h2>

        <motion.p
          className="globe-instruction"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1, duration: 2 }}
        >
          Click on the memories orbiting our world
        </motion.p>

        {/* Selected photo modal */}
        {selectedPhoto !== null && (
          <motion.div
            className="globe-photo-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            onClick={handleClose}
          >
            <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="photo-frame">
                {/* Placeholder gradient until photo loads */}
                <div className="photo-placeholder">
                  <p>Memory {selectedPhoto + 1}</p>
                </div>
              </div>

              <p className="photo-caption">{captions[selectedPhoto]}</p>

              <button className="photo-close" onClick={handleClose}>
                Close
              </button>
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.button
          className="globe-continue-btn"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 182, 193, 0.8)' }}
          whileTap={{ scale: 0.95 }}
        >
          Continue Journey
        </motion.button>
      </div>
    </div>
  );
};

export default WorldGlobe;
