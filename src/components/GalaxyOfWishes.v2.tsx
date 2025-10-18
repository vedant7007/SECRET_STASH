/**
 * GalaxyOfWishes.v2.tsx
 *
 * Physics-based shooting stars, beat-reactive particles,
 * interactive wish revelation with particle trails.
 *
 * Emotion: Joy, wonder, playful discovery, childlike amazement.
 */

import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import useSceneStore from '../core/SceneManager';
import audioManager from '../core/AudioManager';
import { useParallax } from '../core/ParallaxController';
import wishesData from '../data/wishes.json';
import '../styles/GalaxyOfWishes.v2.css';

interface Wish {
  id: number;
  text: string;
  animation: 'shooting-star' | 'twinkle' | 'bloom';
}

/**
 * Physics-based Shooting Star with trail
 */
const ShootingStar = ({
  startPos,
  onComplete
}: {
  startPos: THREE.Vector3;
  onComplete: () => void;
}) => {
  const starRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const velocity = useRef(new THREE.Vector3(-8, -3, -1));
  const trailPositions = useRef<THREE.Vector3[]>([]);
  const lifetime = useRef(0);

  useEffect(() => {
    // Initialize trail
    for (let i = 0; i < 20; i++) {
      trailPositions.current.push(startPos.clone());
    }
  }, []);

  useFrame((state, delta) => {
    if (!starRef.current) return;

    lifetime.current += delta;

    // Physics simulation
    velocity.current.y -= delta * 2; // Gravity
    starRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

    // Update trail
    trailPositions.current.unshift(starRef.current.position.clone());
    trailPositions.current.pop();

    if (trailRef.current) {
      const positions = new Float32Array(trailPositions.current.length * 3);
      const sizes = new Float32Array(trailPositions.current.length);

      trailPositions.current.forEach((pos, i) => {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
        sizes[i] = (1 - i / trailPositions.current.length) * 0.3;
      });

      trailRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      trailRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    }

    // Fade out and destroy
    if (lifetime.current > 3) {
      onComplete();
    }
  });

  return (
    <group>
      {/* Star core */}
      <mesh ref={starRef} position={startPos}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#FFB6C1" />
        <pointLight intensity={2} distance={5} color="#FFB6C1" />
      </mesh>

      {/* Trail */}
      <points ref={trailRef}>
        <bufferGeometry />
        <pointsMaterial
          color="#FFCBA4"
          size={0.2}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

/**
 * Beat-reactive background particles
 */
const GalaxyParticles = ({ beat }: { beat: number }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 8000;

  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const palette = [
      new THREE.Color('#FFB6C1'),
      new THREE.Color('#8A4FFF'),
      new THREE.Color('#80F5FF'),
      new THREE.Color('#FFCBA4')
    ];

    for (let i = 0; i < particleCount; i++) {
      // Spiral galaxy distribution
      const radius = 5 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      const spiral = Math.random() * Math.PI * 4;

      positions[i * 3] = Math.cos(angle + spiral) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = Math.sin(angle + spiral) * radius;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 1.5 + 0.2;
    }

    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  }, []);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;

    // Rotation
    particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;

    // Beat reaction
    const scale = 1 + beat * 0.2;
    particlesRef.current.scale.set(scale, scale, scale);

    // Pulsing opacity
    const material = particlesRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.2 + beat * 0.2;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        vertexColors
        size={0.08}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

/**
 * Interactive floating star nodes
 */
interface StarNodeProps {
  position: THREE.Vector3;
  index: number;
  onClick: () => void;
  revealed: boolean;
}

const StarNode = ({ position, index, onClick, revealed }: StarNodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    // Floating animation
    const offset = index * 0.5;
    meshRef.current.position.y = position.y + Math.sin(clock.getElapsedTime() + offset) * 0.3;

    // Rotation
    meshRef.current.rotation.z = clock.getElapsedTime() * 0.5 + offset;

    // Scale on hover
    const targetScale = hovered ? 1.8 : revealed ? 1.2 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial
        color={revealed ? '#FFCBA4' : '#FFB6C1'}
        transparent
        opacity={revealed ? 1 : 0.8}
      />
      {hovered && <pointLight intensity={3} distance={5} color="#FFB6C1" />}
    </mesh>
  );
};

/**
 * Main Galaxy Scene Component
 */
const GalaxyOfWishesV2 = () => {
  const [currentWishIndex, setCurrentWishIndex] = useState<number | null>(null);
  const [revealedWishes, setRevealedWishes] = useState<Set<number>>(new Set());
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; pos: THREE.Vector3 }>>([]);
  const [beat, setBeat] = useState(0);

  const { nextScene } = useSceneStore();
  const { registerLayer } = useParallax({ intensity: 0.3 });

  const wishes: Wish[] = wishesData as Wish[];

  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);

  // Star positions in 3D space (spiral formation)
  const starPositions = wishes.map((_, index) => {
    const angle = (index / wishes.length) * Math.PI * 2;
    const radius = 8 + (index % 3) * 2;
    const height = Math.sin(angle * 2) * 3;

    return new THREE.Vector3(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius - 5
    );
  });

  useEffect(() => {
    if (layer1Ref.current) registerLayer(layer1Ref.current, 0.3);
    if (layer2Ref.current) registerLayer(layer2Ref.current, 0.7);

    // Simulate beat (in real version, sync with audio)
    const beatInterval = setInterval(() => {
      setBeat(1);
      setTimeout(() => setBeat(0), 200);
    }, 1500);

    return () => clearInterval(beatInterval);
  }, []);

  const handleStarClick = (index: number) => {
    if (revealedWishes.has(index)) return;

    // Play click sound
    audioManager.fx('star_click', 0.4);

    // Trigger shooting star
    const starId = Date.now();
    setShootingStars(prev => [...prev, { id: starId, pos: starPositions[index].clone() }]);

    // Reveal wish
    setCurrentWishIndex(index);
    setRevealedWishes(prev => new Set([...prev, index]));

    // Auto-hide wish after reading
    setTimeout(() => {
      setCurrentWishIndex(null);
    }, 6000);

    // Remove shooting star
    setTimeout(() => {
      setShootingStars(prev => prev.filter(s => s.id !== starId));
    }, 3000);
  };

  const handleContinue = () => {
    audioManager.fx('transition_whoosh', 0.3);
    nextScene();
  };

  const currentWish = currentWishIndex !== null ? wishes[currentWishIndex] : null;
  const progress = (revealedWishes.size / wishes.length) * 100;

  return (
    <div className="galaxy-v2-container">
      {/* 3D Scene */}
      <div className="galaxy-v2-canvas">
        <Canvas camera={{ position: [0, 3, 15], fov: 60 }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 10, 0]} intensity={0.5} color="#80F5FF" />

          {/* Background particles */}
          <GalaxyParticles beat={beat} />

          {/* Interactive star nodes */}
          {starPositions.map((pos, index) => (
            <StarNode
              key={index}
              position={pos}
              index={index}
              onClick={() => handleStarClick(index)}
              revealed={revealedWishes.has(index)}
            />
          ))}

          {/* Shooting stars */}
          {shootingStars.map(star => (
            <ShootingStar
              key={star.id}
              startPos={star.pos}
              onComplete={() => {}}
            />
          ))}

          {/* Post-processing */}
          <EffectComposer>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="galaxy-v2-content">
        {/* Background layer */}
        <div ref={layer1Ref} className="galaxy-v2-layer layer-1">
          <motion.h2
            className="galaxy-v2-title"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
          >
            Galaxy of Wishes
          </motion.h2>

          <motion.p
            className="galaxy-v2-instruction"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1, duration: 2 }}
          >
            Click the stars to release each wish into the cosmos
          </motion.p>
        </div>

        {/* Foreground layer */}
        <div ref={layer2Ref} className="galaxy-v2-layer layer-2">
          {/* Active wish display */}
          <AnimatePresence mode="wait">
            {currentWish && (
              <motion.div
                key={currentWish.id}
                className="galaxy-v2-wish-card"
                initial={{ opacity: 0, scale: 0.8, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -100 }}
                transition={{
                  duration: 0.8,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              >
                <motion.div
                  className="wish-card-glow"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="wish-text">{currentWish.text}</p>
                <div className="wish-sparkles">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="sparkle"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        x: [0, (Math.random() - 0.5) * 100],
                        y: [0, (Math.random() - 0.5) * 100],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress indicator */}
          <motion.div
            className="galaxy-v2-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <p className="progress-label">
              {revealedWishes.size} / {wishes.length} wishes released
            </p>
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              <div className="progress-bar-glow" style={{ width: `${progress}%` }} />
            </div>
          </motion.div>

          {/* Continue button */}
          {revealedWishes.size >= wishes.length && (
            <motion.button
              className="galaxy-v2-continue-btn"
              onClick={handleContinue}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 50px rgba(255, 203, 164, 0.8)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              Continue to Our World
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalaxyOfWishesV2;
