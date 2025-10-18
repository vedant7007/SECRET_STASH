/**
 * HeroScene.v2.tsx
 *
 * Complete cinematic rebuild.
 * Multi-layer parallax depth, volumetric lighting, aurora fields,
 * cursor-reactive particles, and orchestrated entrance choreography.
 *
 * Emotion: Overwhelming awe, cosmic belonging, intimate grandeur.
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import { useParallax } from '../core/ParallaxController';
import { auroraShader, volumetricLightShader, nebulaShader } from '../core/ShaderLibrary';
import useSceneStore from '../core/SceneManager';
import audioManager from '../core/AudioManager';
import '../styles/HeroScene.v2.css';

/**
 * Aurora Background Layer
 */
const AuroraField = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }

    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]} scale={[40, 20, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={auroraShader.vertexShader}
        fragmentShader={auroraShader.fragmentShader}
        uniforms={auroraShader.uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

/**
 * Nebula Cloud Layer
 */
const NebulaCloud = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime() * 0.5;
    }

    if (meshRef.current) {
      meshRef.current.rotation.z += 0.0001;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={[15, 15, 1]}>
      <planeGeometry args={[1, 1, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={nebulaShader.vertexShader}
        fragmentShader={nebulaShader.fragmentShader}
        uniforms={nebulaShader.uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

/**
 * Advanced Particle System with cursor interaction
 */
const InteractiveParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const { mouse } = useThree();
  const mouseInfluence = useRef(new THREE.Vector3());

  const particleCount = 5000;

  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color('#FFB6C1');
    const color2 = new THREE.Color('#8A4FFF');
    const color3 = new THREE.Color('#80F5FF');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spherical distribution
      const radius = 15 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 10;

      // Random color from palette
      const colorChoice = Math.random();
      const color = colorChoice < 0.33 ? color1 : colorChoice < 0.66 ? color2 : color3;

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Size variation
      sizes[i] = Math.random() * 2 + 0.5;

      // Initial velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    const geometry = particlesRef.current.geometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    velocitiesRef.current = velocities;
  }, []);

  useFrame(({ clock }) => {
    if (!particlesRef.current || !velocitiesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;

    // Mouse influence (convert to 3D space)
    mouseInfluence.current.set(mouse.x * 10, mouse.y * 10, 0);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Apply velocity
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Mouse attraction
      const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      const distance = particlePos.distanceTo(mouseInfluence.current);

      if (distance < 5) {
        const force = (5 - distance) / 5;
        const direction = new THREE.Vector3().subVectors(mouseInfluence.current, particlePos).normalize();

        velocities[i3] += direction.x * force * 0.001;
        velocities[i3 + 1] += direction.y * force * 0.001;
      }

      // Orbital rotation
      const angle = Math.atan2(positions[i3 + 1], positions[i3]);
      const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2);

      positions[i3] = radius * Math.cos(angle + 0.0003);
      positions[i3 + 1] = radius * Math.sin(angle + 0.0003);

      // Breathing motion
      positions[i3 + 2] += Math.sin(clock.getElapsedTime() + i) * 0.001;

      // Boundary wrapping
      if (Math.abs(positions[i3]) > 30) positions[i3] *= -0.8;
      if (Math.abs(positions[i3 + 1]) > 30) positions[i3 + 1] *= -0.8;
      if (Math.abs(positions[i3 + 2]) > 30) positions[i3 + 2] *= -0.8;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

/**
 * Volumetric Light Center
 */
const VolumetricLight = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }

    if (meshRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 0.5) * 0.2 + 1;
      meshRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={volumetricLightShader.vertexShader}
        fragmentShader={volumetricLightShader.fragmentShader}
        uniforms={volumetricLightShader.uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

/**
 * Main Hero Scene Component
 */
const HeroSceneV2 = () => {
  const { nextScene } = useSceneStore();
  const { registerLayer } = useParallax({ intensity: 0.5, ease: 0.08 });

  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);

  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Register parallax layers (depth: 0=far, 1=near)
    if (layer1Ref.current) registerLayer(layer1Ref.current, 0.2);
    if (layer2Ref.current) registerLayer(layer2Ref.current, 0.5);
    if (layer3Ref.current) registerLayer(layer3Ref.current, 0.8);

    // Delayed text entrance
    const timer = setTimeout(() => setTextVisible(true), 1500);

    // Trigger ambient audio pulse
    audioManager.fx('hero_entrance', 0.4);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    audioManager.fx('transition_whoosh', 0.3);
    nextScene();
  };

  return (
    <div className="hero-v2-container">
      {/* 3D Canvas Layer */}
      <div className="hero-v2-canvas">
        <Canvas camera={{ position: [0, 0, 25], fov: 60 }} dpr={[1, 2]}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 0, 10]} intensity={2} color="#FFB6C1" distance={30} decay={2} />
          <pointLight position={[-10, -10, 5]} intensity={1} color="#8A4FFF" distance={25} decay={2} />

          {/* Background layers (far to near) */}
          <AuroraField />
          <NebulaCloud position={[-5, 3, -8]} />
          <NebulaCloud position={[6, -4, -7]} />

          {/* Particles */}
          <InteractiveParticles />

          {/* Center volumetric light */}
          <VolumetricLight />

          {/* Post-processing */}
          <EffectComposer>
            <Bloom
              intensity={1.5}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new THREE.Vector2(0.001, 0.001)}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* UI Content with Parallax Layers */}
      <div className="hero-v2-content">
        {/* Background layer */}
        <motion.div
          ref={layer1Ref}
          className="hero-v2-layer layer-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: textVisible ? 0.3 : 0 }}
          transition={{ duration: 3 }}
        >
          <div className="decorative-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
        </motion.div>

        {/* Mid layer - Main text */}
        <div ref={layer2Ref} className="hero-v2-layer layer-2">
          {textVisible && (
            <>
              <motion.h1
                className="hero-v2-title"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 2, ease: [0.43, 0.13, 0.23, 0.96] }}
              >
                For Thanishka
              </motion.h1>

              <motion.div
                className="hero-v2-subtitle-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 2.5 }}
              >
                <p className="hero-v2-subtitle">
                  In a universe of infinite stars,
                </p>
                <p className="hero-v2-subtitle-accent">
                  you are the one that made me believe in light.
                </p>
              </motion.div>

              <motion.p
                className="hero-v2-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5, duration: 3 }}
              >
                Every particle carries your name.
                <br />
                Every photon remembers your smile.
                <br />
                This dimension exists because you do.
              </motion.p>
            </>
          )}
        </div>

        {/* Front layer - Navigation */}
        <div ref={layer3Ref} className="hero-v2-layer layer-3">
          {textVisible && (
            <motion.div
              className="hero-v2-nav"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5, duration: 1.5 }}
            >
              <motion.button
                className="hero-v2-button"
                onClick={handleContinue}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 60px rgba(255, 182, 193, 0.9)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="button-text">Enter the Universe</span>
                <span className="button-glow"></span>
              </motion.button>

              <p className="hero-v2-hint">
                Press Space or click to continue
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Ambient glow overlay */}
      <motion.div
        className="hero-v2-ambient-glow"
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Keyboard navigation */}
      <KeyboardNav onNext={handleContinue} />
    </div>
  );
};

// Keyboard shortcuts
const KeyboardNav = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onNext]);

  return null;
};

export default HeroSceneV2;
