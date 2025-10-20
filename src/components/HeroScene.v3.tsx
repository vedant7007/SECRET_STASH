/**
 * HeroScene.v3.tsx
 *
 * OPTIMIZED & ACCESSIBLE CINEMATIC ENTRANCE
 *
 * Changes from V2:
 * - Adaptive particle count based on device capabilities (500-3000)
 * - Respects prefers-reduced-motion
 * - WCAG AA contrast ratios (off-white text)
 * - Keyboard navigation support
 * - Caption support for voiceovers
 * - Performance monitoring and adaptive quality
 * - Accessible button with focus states
 *
 * Philosophy: Beauty accessible to all, on every device.
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { auroraShader, volumetricLightShader, nebulaShader } from '../core/ShaderLibrary';
import useSettingsStore from '../core/SettingsManager';
import useCaptionStore, { createCaption } from '../core/CaptionManager';
import audioManager from '../core/AudioManager';
import useSceneStore from '../core/SceneManager';
import '../styles/HeroScene.v3.css';

// Adaptive Interactive Particles (500-3000 based on settings)
const InteractiveParticles = () => {
  const { performance, accessibility } = useSettingsStore();
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const mouseInfluence = useRef(new THREE.Vector3(0, 0, 0));
  const mouse = useRef({ x: 0, y: 0 });

  const particleCount = performance.heroParticles;

  useEffect(() => {
    if (!particlesRef.current) return;

    // Initialize positions and velocities
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spherical distribution
      const radius = Math.random() * 20 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    velocitiesRef.current = velocities;

    console.log(`[HeroScene] Initialized ${particleCount} particles`);
  }, [particleCount]);

  // Mouse tracking (disabled if reduced motion)
  useEffect(() => {
    if (accessibility.reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [accessibility.reducedMotion]);

  useFrame(({ clock }) => {
    if (!particlesRef.current || !velocitiesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;

    // Update mouse influence (lerp for smoothness)
    if (!accessibility.reducedMotion) {
      mouseInfluence.current.x += (mouse.current.x * 10 - mouseInfluence.current.x) * 0.05;
      mouseInfluence.current.y += (mouse.current.y * 10 - mouseInfluence.current.y) * 0.05;
    }

    const time = clock.getElapsedTime();

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Apply velocities
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Mouse attraction (only if motion enabled)
      if (!accessibility.reducedMotion && mouseInfluence.current.lengthSq() > 0.1) {
        const dx = mouseInfluence.current.x - positions[i3];
        const dy = mouseInfluence.current.y - positions[i3 + 1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          const force = (1 - distance / 5) * 0.5;
          velocities[i3] += dx * force * 0.001;
          velocities[i3 + 1] += dy * force * 0.001;
        }
      }

      // Orbital rotation
      const rotationSpeed = accessibility.reducedMotion ? 0.001 : 0.005;
      const angle = Math.atan2(positions[i3 + 1], positions[i3]);
      const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2);
      const newAngle = angle + rotationSpeed;

      positions[i3] = radius * Math.cos(newAngle);
      positions[i3 + 1] = radius * Math.sin(newAngle);

      // Breathing motion
      if (!accessibility.reducedMotion) {
        positions[i3 + 2] += Math.sin(time + i) * 0.002;
      }

      // Damping
      velocities[i3] *= 0.98;
      velocities[i3 + 1] *= 0.98;
      velocities[i3 + 2] *= 0.98;

      // Boundary constraints
      const maxRadius = 25;
      const currentRadius = Math.sqrt(
        positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
      );

      if (currentRadius > maxRadius) {
        const scale = maxRadius / currentRadius;
        positions[i3] *= scale;
        positions[i3 + 1] *= scale;
        positions[i3 + 2] *= scale;

        velocities[i3] *= -0.5;
        velocities[i3 + 1] *= -0.5;
        velocities[i3 + 2] *= -0.5;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.15}
        color="#FFB6C1"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Aurora Background
const AuroraField = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { performance } = useSettingsStore();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      (meshRef.current.material as any).uniforms.time.value = clock.getElapsedTime() * 0.2;
    }
  });

  if (!performance.enableVolumetricLight) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <planeGeometry args={[50, 50, 1, 1]} />
      <shaderMaterial
        vertexShader={auroraShader.vertexShader}
        fragmentShader={auroraShader.fragmentShader}
        uniforms={auroraShader.uniforms}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// Main HeroScene Component
const HeroScene = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [linesVisible, setLinesVisible] = useState(false);
  const { setScene } = useSceneStore();
  const { performance, accessibility } = useSettingsStore();
  const { showCaption } = useCaptionStore();

  useEffect(() => {
    // Detect device capabilities on mount
    useSettingsStore.getState().detectDeviceCapabilities();

    // Show title after 1s
    setTimeout(() => setTitleVisible(true), 1000);

    // Show lines after 3s
    setTimeout(() => setLinesVisible(true), 3000);

    // Play voiceover with caption
    setTimeout(() => {
      // audioManager.fx('hero_entrance'); // When audio files exist
      showCaption(
        createCaption(
          'hero-welcome',
          'Welcome to a universe built with love, just for you.',
          4000,
          'Vedant'
        )
      );
    }, 2000);
  }, [showCaption]);

  const handleEnter = () => {
    showCaption(
      createCaption('hero-transition', 'Let the journey begin...', 2000, 'Vedant')
    );

    setTimeout(() => {
      setScene('galaxy');
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleEnter();
    }
  };

  return (
    <div className="hero-scene-v3" role="main" aria-label="Hero Scene">
      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={performance.pixelRatio}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <AuroraField />
        <InteractiveParticles />

        {/* Post-processing effects (adaptive) */}
        {(performance.enableBloom || performance.enableChromaticAberration) && (
          <EffectComposer>
            {performance.enableBloom && <Bloom intensity={0.5} luminanceThreshold={0.3} />}
            {performance.enableChromaticAberration && (
              <ChromaticAberration offset={[0.001, 0.001]} />
            )}
          </EffectComposer>
        )}
      </Canvas>

      {/* Foreground UI */}
      <div className="hero-content">
        {/* Title */}
        {titleVisible && (
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            For Thanishka
          </motion.h1>
        )}

        {/* Poetic lines */}
        {linesVisible && (
          <motion.div
            className="hero-lines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 2 }}
          >
            <p className="hero-line">Every particle carries your name.</p>
            <p className="hero-line">Every light is a memory we share.</p>
            <p className="hero-line">This universe exists because you do.</p>
          </motion.div>
        )}

        {/* Enter button (accessible) */}
        {linesVisible && (
          <motion.button
            className="hero-enter-button"
            onClick={handleEnter}
            onKeyDown={handleKeyPress}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 1 }}
            whileHover={{ scale: accessibility.reducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Enter the Loveverse"
            tabIndex={0}
          >
            Step Into Our Universe
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default HeroScene;
