/**
 * GalaxyOfWishes.CINEMATIC.tsx — PHASE 7.5: CINEMATIC OVERHAUL
 *
 * A cosmos with depth, meaning, and emotion.
 * Not random particles—a universe being built, wish by wish.
 *
 * Philosophy: The sky should feel like COSMOS, not a wallpaper.
 * Each interaction is a moment of pause, not a game to win.
 */

import { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useHapticFeedback } from '../core/useHapticFeedback';
import wishesData from '../data/wishes.json';
import '../styles/GalaxyOfWishes.v2.css';

interface Wish {
  id: number;
  text: string;
  emotion: string;
  animation: 'shooting-star' | 'twinkle' | 'bloom' | 'spiral' | 'pulse';
  intensity: string;
  timing: number;
}

interface Star {
  position: THREE.Vector3;
  size: number;
  brightness: number;
  layer: number; // 0=foreground, 1=mid, 2=deep, 3=dust
  twinklePhase: number;
  driftVelocity: THREE.Vector3;
}

interface ConstellationPoint {
  position: THREE.Vector3;
  arrivalTime: number;
  wishId: number;
}

/**
 * LAYER 1-4: Parallax Starfield with Depth Hierarchy
 */
const ParallaxStarfield = () => {
  const starsRef = useRef<THREE.Points[]>([]);
  const { camera } = useThree();

  // Generate layered stars (drastically reduced density)
  const starLayers = useMemo(() => {
    const layers: Star[][] = [[], [], [], []];

    // Layer 0: Foreground — 80 bright stars (fast drift)
    for (let i = 0; i < 80; i++) {
      layers[0].push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 40,
          Math.random() * 5 + 10 // Close to camera
        ),
        size: Math.random() * 0.4 + 0.3,
        brightness: Math.random() * 0.5 + 0.7,
        layer: 0,
        twinklePhase: Math.random() * Math.PI * 2,
        driftVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          0
        )
      });
    }

    // Layer 1: Mid — 200 medium stars (slower drift)
    for (let i = 0; i < 200; i++) {
      layers[1].push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 50,
          Math.random() * 10 - 5 // Mid depth
        ),
        size: Math.random() * 0.25 + 0.15,
        brightness: Math.random() * 0.4 + 0.5,
        layer: 1,
        twinklePhase: Math.random() * Math.PI * 2,
        driftVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          0
        )
      });
    }

    // Layer 2: Deep — 400 small stars (very slow drift)
    for (let i = 0; i < 400; i++) {
      layers[2].push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 60,
          Math.random() * 20 - 30 // Far from camera
        ),
        size: Math.random() * 0.15 + 0.08,
        brightness: Math.random() * 0.3 + 0.3,
        layer: 2,
        twinklePhase: Math.random() * Math.PI * 2,
        driftVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          0
        )
      });
    }

    // Layer 3: Dust — 600 tiny particles (almost static)
    for (let i = 0; i < 600; i++) {
      layers[3].push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 70,
          Math.random() * 30 - 50 // Deep background
        ),
        size: Math.random() * 0.08 + 0.03,
        brightness: Math.random() * 0.2 + 0.2,
        layer: 3,
        twinklePhase: Math.random() * Math.PI * 2,
        driftVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          0
        )
      });
    }

    return layers;
  }, []);

  useFrame((state, delta) => {
    starLayers.forEach((layer, layerIndex) => {
      if (!starsRef.current[layerIndex]) return;

      const positions = starsRef.current[layerIndex].geometry.attributes.position.array as Float32Array;
      const opacities = starsRef.current[layerIndex].geometry.attributes.opacity?.array as Float32Array;

      layer.forEach((star, i) => {
        // Micro-gravity drift
        star.position.add(star.driftVelocity.clone().multiplyScalar(delta));

        // Wrap-around edges
        if (Math.abs(star.position.x) > 60) star.position.x *= -0.95;
        if (Math.abs(star.position.y) > 40) star.position.y *= -0.95;

        // Update position
        positions[i * 3] = star.position.x;
        positions[i * 3 + 1] = star.position.y;
        positions[i * 3 + 2] = star.position.z;

        // Twinkle effect (slow shimmer)
        if (opacities) {
          star.twinklePhase += delta * (0.5 + star.layer * 0.2);
          const twinkle = Math.sin(star.twinklePhase) * 0.2 + 0.8;
          opacities[i] = star.brightness * twinkle;
        }
      });

      starsRef.current[layerIndex].geometry.attributes.position.needsUpdate = true;
      if (opacities) {
        starsRef.current[layerIndex].geometry.attributes.opacity.needsUpdate = true;
      }
    });
  });

  return (
    <group>
      {starLayers.map((layer, layerIndex) => {
        const positions = new Float32Array(layer.length * 3);
        const sizes = new Float32Array(layer.length);
        const colors = new Float32Array(layer.length * 3);
        const opacities = new Float32Array(layer.length);

        layer.forEach((star, i) => {
          positions[i * 3] = star.position.x;
          positions[i * 3 + 1] = star.position.y;
          positions[i * 3 + 2] = star.position.z;
          sizes[i] = star.size;
          opacities[i] = star.brightness;

          // Color based on layer (deep = cooler, foreground = warmer)
          const color = layerIndex === 0
            ? new THREE.Color('#FFFACD') // Warm yellow
            : layerIndex === 1
            ? new THREE.Color('#E0F7FF') // Cool white
            : layerIndex === 2
            ? new THREE.Color('#B0E0FF') // Pale blue
            : new THREE.Color('#8899AA'); // Dusty gray

          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        });

        return (
          <points
            key={layerIndex}
            ref={(ref) => {
              if (ref) starsRef.current[layerIndex] = ref;
            }}
          >
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={layer.length}
                array={positions}
                itemSize={3}
              />
              <bufferAttribute
                attach="attributes-size"
                count={layer.length}
                array={sizes}
                itemSize={1}
              />
              <bufferAttribute
                attach="attributes-color"
                count={layer.length}
                array={colors}
                itemSize={3}
              />
              <bufferAttribute
                attach="attributes-opacity"
                count={layer.length}
                array={opacities}
                itemSize={1}
              />
            </bufferGeometry>
            <shaderMaterial
              vertexShader={`
                attribute float size;
                attribute float opacity;
                varying float vOpacity;
                varying vec3 vColor;

                void main() {
                  vOpacity = opacity;
                  vColor = color;
                  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                  gl_PointSize = size * (300.0 / -mvPosition.z);
                  gl_Position = projectionMatrix * mvPosition;
                }
              `}
              fragmentShader={`
                varying float vOpacity;
                varying vec3 vColor;

                void main() {
                  float dist = length(gl_PointCoord - vec2(0.5));
                  if (dist > 0.5) discard;

                  float alpha = (1.0 - dist * 2.0) * vOpacity;
                  gl_FragColor = vec4(vColor, alpha);
                }
              `}
              transparent
              vertexColors
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </points>
        );
      })}
    </group>
  );
};

/**
 * Nebula Haze (Volumetric Cloud Layer)
 */
const NebulaHaze = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -40]}>
      <planeGeometry args={[150, 100]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec2 vUv;

          // Simplex noise function (placeholder - use proper noise in production)
          float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv * 3.0;
            float n = noise(uv + time * 0.01);
            n += noise(uv * 2.0) * 0.5;
            n += noise(uv * 4.0) * 0.25;
            n /= 1.75;

            vec3 color1 = vec3(0.4, 0.2, 0.6); // Purple
            vec3 color2 = vec3(0.2, 0.4, 0.7); // Blue
            vec3 nebula = mix(color1, color2, n);

            float alpha = n * 0.15; // Very subtle
            gl_FragColor = vec4(nebula, alpha);
          }
        `}
        uniforms={{
          time: { value: 0 }
        }}
      />
    </mesh>
  );
};

/**
 * Hybrid Shooting Star System
 * 50% outward (released wish), 50% inward (joins constellation)
 */
const ShootingStar = ({
  startPos,
  direction,
  onComplete,
  wishId
}: {
  startPos: THREE.Vector3;
  direction: 'outward' | 'inward';
  onComplete: (wishId: number, finalPos?: THREE.Vector3) => void;
  wishId: number;
}) => {
  const starRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  const lifetime = useRef(0);
  const trailPoints = useRef<THREE.Vector3[]>([]);

  // Determine velocity based on direction
  const velocity = useRef(
    direction === 'outward'
      ? new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          Math.random() * 8 + 5,
          (Math.random() - 0.5) * 3
        )
      : new THREE.Vector3(
          -startPos.x * 0.3,
          -startPos.y * 0.3,
          -startPos.z * 0.5
        )
  );

  useFrame((state, delta) => {
    if (!starRef.current) return;

    lifetime.current += delta;

    if (direction === 'outward') {
      // Outward: arc with gravity
      velocity.current.y -= delta * 5;
      starRef.current.position.add(velocity.current.clone().multiplyScalar(delta));
    } else {
      // Inward: gentle curve toward center (0, 0, 0)
      const target = new THREE.Vector3(0, 0, 0);
      const direction = target.sub(starRef.current.position).normalize();
      velocity.current.lerp(direction.multiplyScalar(8), delta * 2);
      starRef.current.position.add(velocity.current.clone().multiplyScalar(delta));
    }

    // Trail update
    trailPoints.current.unshift(starRef.current.position.clone());
    if (trailPoints.current.length > 30) trailPoints.current.pop();

    if (trailRef.current && trailPoints.current.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints.current);
      trailRef.current.geometry.dispose();
      trailRef.current.geometry = geometry;
    }

    // Complete after 2-3 seconds
    const maxLifetime = direction === 'outward' ? 3 : 2;
    if (lifetime.current > maxLifetime) {
      onComplete(wishId, direction === 'inward' ? starRef.current.position.clone() : undefined);
    }
  });

  return (
    <group>
      <mesh ref={starRef} position={startPos}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={direction === 'outward' ? '#FFD700' : '#80F5FF'} />
        <pointLight
          intensity={direction === 'outward' ? 3 : 2}
          distance={8}
          color={direction === 'outward' ? '#FFD700' : '#80F5FF'}
        />
      </mesh>

      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color={direction === 'outward' ? '#FFCBA4' : '#B0E0FF'}
          transparent
          opacity={0.6}
          linewidth={2}
        />
      </line>
    </group>
  );
};

/**
 * Constellation Cluster (builds from inward stars)
 * SHAPELESS — No outlines, just scattered points forming abstract meaning
 */
const ConstellationCluster = ({ points }: { points: ConstellationPoint[] }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((point, i) => (
        <mesh key={point.wishId} position={point.position}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#FFFACD" />
          <pointLight intensity={1.5} distance={5} color="#FFFACD" />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Main Galaxy Scene
 */
const GalaxyOfWishes_Cinematic = () => {
  const [releasedWishes, setReleasedWishes] = useState<number[]>([]);
  const [activeShootingStars, setActiveShootingStars] = useState<Array<{
    id: number;
    startPos: THREE.Vector3;
    direction: 'outward' | 'inward';
    wishId: number;
  }>>([]);
  const [constellationPoints, setConstellationPoints] = useState<ConstellationPoint[]>([]);
  const [currentWishIndex, setCurrentWishIndex] = useState(0);
  const { trigger } = useHapticFeedback();

  const wishes = wishesData as Wish[];
  const currentWish = wishes[currentWishIndex];
  const progress = releasedWishes.length / wishes.length;

  // Ambient guidance text (changes as user progresses)
  const guidanceText = useMemo(() => {
    if (releasedWishes.length === 0) return 'A star waits for your touch';
    if (progress < 0.3) return 'The cosmos listens';
    if (progress < 0.6) return 'Your wishes are writing the sky';
    if (progress < 0.9) return 'A constellation takes shape';
    return 'The universe holds your heart';
  }, [releasedWishes.length, progress]);

  const handleStarClick = () => {
    if (releasedWishes.includes(currentWish.id)) return;

    // 50/50 chance: outward or inward
    const direction = Math.random() > 0.5 ? 'outward' : 'inward';

    // Random start position on screen edges
    const startPos = new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 25,
      Math.random() * 5
    );

    setActiveShootingStars((prev) => [
      ...prev,
      {
        id: Date.now(),
        startPos,
        direction,
        wishId: currentWish.id
      }
    ]);

    setReleasedWishes((prev) => [...prev, currentWish.id]);
    setCurrentWishIndex((prev) => (prev + 1) % wishes.length);

    // Haptic feedback
    trigger('light');
  };

  const handleShootingStarComplete = (wishId: number, finalPos?: THREE.Vector3) => {
    setActiveShootingStars((prev) => prev.filter((star) => star.wishId !== wishId));

    // If inward direction, add to constellation
    if (finalPos) {
      setConstellationPoints((prev) => [
        ...prev,
        {
          position: finalPos,
          arrivalTime: Date.now(),
          wishId
        }
      ]);
    }
  };

  return (
    <div className="galaxy-container">
      <div className="galaxy-canvas">
        <Canvas camera={{ position: [0, 0, 30], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={['#0a0a1a']} />

          {/* Nebula background */}
          <NebulaHaze />

          {/* Parallax starfield (4 layers) */}
          <ParallaxStarfield />

          {/* Constellation cluster */}
          <ConstellationCluster points={constellationPoints} />

          {/* Active shooting stars */}
          {activeShootingStars.map((star) => (
            <ShootingStar
              key={star.id}
              startPos={star.startPos}
              direction={star.direction}
              onComplete={handleShootingStarComplete}
              wishId={star.wishId}
            />
          ))}

          {/* Post-processing */}
          <EffectComposer>
            <Bloom intensity={0.8} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Overlay UI (minimal) */}
      <div className="galaxy-overlay">
        {/* Ambient guidance text */}
        <motion.p
          key={guidanceText}
          className="guidance-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {guidanceText}
        </motion.p>

        {/* Current wish display */}
        <AnimatePresence mode="wait">
          {!releasedWishes.includes(currentWish.id) && (
            <motion.div
              key={currentWish.id}
              className="wish-display"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1 }}
              onClick={handleStarClick}
            >
              <p className="wish-text">{currentWish.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalaxyOfWishes_Cinematic;
