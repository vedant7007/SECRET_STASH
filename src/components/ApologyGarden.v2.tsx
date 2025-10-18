/**
 * ApologyGarden.v2.tsx
 *
 * Gentle rainfall, physics-based petals, water reflections.
 * A space where vulnerability becomes beauty.
 *
 * Emotion: Tenderness, soft sorrow, gentle healing, intimate vulnerability.
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import useSceneStore from '../core/SceneManager';
import audioManager from '../core/AudioManager';
import { rainShader, waterRippleShader } from '../shaders/RainShader';
import apologies from '../data/apologies.json';
import '../styles/ApologyGarden.v2.css';

interface Apology {
  id: number;
  text: string;
  intensity: 'soft' | 'deep';
}

/**
 * Volumetric Rain System
 */
const VolumetricRain = () => {
  const rainRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (!rainRef.current) return;

    const rainCount = 2000;
    const positions = new Float32Array(rainCount * 3);
    const sizes = new Float32Array(rainCount);
    const phases = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      sizes[i] = Math.random() * 4 + 2;
      phases[i] = Math.random() * 100;
    }

    rainRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    rainRef.current.geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry />
      <shaderMaterial
        ref={materialRef}
        vertexShader={rainShader.vertexShader}
        fragmentShader={rainShader.fragmentShader}
        uniforms={rainShader.uniforms}
        transparent
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </points>
  );
};

/**
 * Water Reflection Ground Plane
 */
const WaterReflection = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[50, 50, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={waterRippleShader.vertexShader}
        fragmentShader={waterRippleShader.fragmentShader}
        uniforms={waterRippleShader.uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Physics-based Petal with realistic motion
 */
interface PetalProps {
  initialPosition: THREE.Vector3;
  apologyIndex: number;
  onCollect: () => void;
  collected: boolean;
}

const Petal = ({ initialPosition, apologyIndex, onCollect, collected }: PetalProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const rotation = useRef(new THREE.Euler(0, 0, 0));
  const rotationVelocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02
  ));

  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current || collected) return;

    // Physics
    velocity.current.y -= delta * 0.5; // Gravity
    velocity.current.x += Math.sin(state.clock.elapsedTime + apologyIndex) * 0.002; // Drift
    velocity.current.z += Math.cos(state.clock.elapsedTime + apologyIndex) * 0.002;

    // Air resistance
    velocity.current.multiplyScalar(0.98);

    // Apply velocity
    meshRef.current.position.add(velocity.current);

    // Rotation
    rotation.current.x += rotationVelocity.current.x;
    rotation.current.y += rotationVelocity.current.y;
    rotation.current.z += rotationVelocity.current.z;
    meshRef.current.rotation.set(rotation.current.x, rotation.current.y, rotation.current.z);

    // Reset if fallen too far
    if (meshRef.current.position.y < -5) {
      meshRef.current.position.copy(initialPosition);
      velocity.current.set(0, 0, 0);
    }

    // Hover effect
    if (hovered) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
      onClick={(e) => {
        e.stopPropagation();
        if (!collected) onCollect();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      visible={!collected}
    >
      <planeGeometry args={[0.4, 0.5]} />
      <meshStandardMaterial
        color="#FFB6C1"
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
        emissive="#FFB6C1"
        emissiveIntensity={hovered ? 0.5 : 0.2}
      />
    </mesh>
  );
};

/**
 * Main Apology Garden Component
 */
const ApologyGardenV2 = () => {
  const [collectedApologies, setCollectedApologies] = useState<Set<number>>(new Set());
  const [currentApology, setCurrentApology] = useState<Apology | null>(null);
  const { nextScene } = useSceneStore();

  const apologyList: Apology[] = apologies as Apology[];

  // Generate initial petal positions (floating in air)
  const petalPositions = apologyList.map((_, index) => {
    const angle = (index / apologyList.length) * Math.PI * 2;
    const radius = 3 + Math.random() * 2;

    return new THREE.Vector3(
      Math.cos(angle) * radius,
      5 + Math.random() * 5,
      Math.sin(angle) * radius
    );
  });

  useEffect(() => {
    // Play rain ambient sound
    audioManager.play('rain_garden', 2);

    return () => {
      audioManager.stop('rain_garden', 2);
    };
  }, []);

  const handlePetalCollect = (index: number) => {
    if (collectedApologies.has(index)) return;

    // Play soft chime
    audioManager.fx('petal_collect', 0.3);

    // Show apology
    setCollectedApologies(prev => new Set([...prev, index]));
    setCurrentApology(apologyList[index]);

    // Auto-hide after reading
    setTimeout(() => {
      setCurrentApology(null);
    }, 8000);
  };

  const handleContinue = () => {
    audioManager.fx('transition_whoosh', 0.3);
    nextScene();
  };

  const progress = (collectedApologies.size / apologyList.length) * 100;
  const allCollected = collectedApologies.size >= apologyList.length;

  return (
    <div className="garden-v2-container">
      {/* 3D Scene */}
      <div className="garden-v2-canvas">
        <Canvas camera={{ position: [0, 2, 12], fov: 55 }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 10, 0]} intensity={0.4} color="#80F5FF" />
          <pointLight position={[5, 5, 5]} intensity={0.3} color="#FFB6C1" />

          {/* Rain */}
          <VolumetricRain />

          {/* Water reflection */}
          <WaterReflection />

          {/* Falling petals */}
          {petalPositions.map((pos, index) => (
            <Petal
              key={index}
              initialPosition={pos}
              apologyIndex={index}
              onCollect={() => handlePetalCollect(index)}
              collected={collectedApologies.has(index)}
            />
          ))}

          {/* Fog */}
          <fog attach="fog" args={['#0a0520', 10, 30]} />

          {/* Post-processing */}
          <EffectComposer>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="garden-v2-content">
        {/* Title */}
        <motion.div
          className="garden-v2-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
        >
          <h2 className="garden-v2-title">The Apology Garden</h2>
          <p className="garden-v2-subtitle">
            Where sorrow becomes softness,
            <br />
            and every petal carries a tender truth.
          </p>
        </motion.div>

        {/* Current apology display */}
        <AnimatePresence mode="wait">
          {currentApology && (
            <motion.div
              key={currentApology.id}
              className={`garden-v2-apology-card intensity-${currentApology.intensity}`}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <div className="apology-rain-overlay" />
              <p className="apology-text">{currentApology.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <motion.div
          className="garden-v2-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="progress-label">
            {collectedApologies.size} / {apologyList.length} apologies read
          </p>
          <div className="progress-bar-container">
            <motion.div
              className="progress-bar-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Continue button */}
        {allCollected && (
          <motion.button
            className="garden-v2-continue-btn"
            onClick={handleContinue}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
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
        className="garden-v2-rain-ambiance"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  );
};

export default ApologyGardenV2;
