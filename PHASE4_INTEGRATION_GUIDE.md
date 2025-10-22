# PHASE 4 — INTEGRATION GUIDE

**Complete Mobile-First Touch & Responsive System**

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    USER DEVICE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Touch Input  │  │ Device Tier  │  │ Screen Size  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
└─────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│               PHASE 4 CORE SYSTEMS                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  useTouchGestures.ts                             │  │
│  │  - Tap, Swipe, Long-press, Drag, Pinch          │  │
│  │  - Scene-specific gesture hooks                  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ResponsiveCalibration.ts                        │  │
│  │  - Screen size detection (xs/sm/md/lg/xl)       │  │
│  │  - Device tier detection (low/mid/high/ultra)   │  │
│  │  - Responsive config matrix                      │  │
│  │  - Safe-area insets                              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  useHapticFeedback.ts                            │  │
│  │  - Emotion-based haptic patterns                 │  │
│  │  - Scene-specific haptic hooks                   │  │
│  │  - Vibration API integration                     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SettingsManager.ts (Enhanced)                   │  │
│  │  - Device tier integration                       │  │
│  │  - Haptic settings                               │  │
│  │  - Quality presets per tier                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                  SCENE COMPONENTS                        │
│  GalaxyOfWishes  │  ApologyGarden  │  PromisesChamber  │
│  MelodySphere    │  WordConstellation                   │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              NARRATIVE STAGING LAYER                     │
│  NarrativeStager + EmotionTransitions + SceneStaging    │
└─────────────────────────────────────────────────────────┘
```

---

## STEP 1: SCENE COMPONENT INTEGRATION

### Example: GalaxyOfWishes.tsx

```tsx
import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useResponsiveConfig } from '../core/ResponsiveCalibration';
import { useGalaxyGestures } from '../core/useTouchGestures';
import { useGalaxyHaptic } from '../core/useHapticFeedback';
import { useWishStaging } from '../core/SceneStaging';
import { useWishes } from '../core/ContentLoader';
import { motion } from 'framer-motion';
import { getEmotionTransition } from '../core/EmotionTransitions';

const GalaxyOfWishes: React.FC = () => {
  // 1. Load content
  const { data: wishes, isLoading } = useWishes();

  // 2. Narrative staging
  const { currentWish, isRevealing, skipToNext } = useWishStaging(wishes);

  // 3. Responsive config
  const { config, safeArea, isMobile, screenSize } = useResponsiveConfig();

  // 4. Touch gestures
  const gestureRef = useGalaxyGestures({
    onSummonStar: (position) => {
      // Spawn shooting star at touch point
      spawnStarAtPosition(position);
      onStarSummon(); // Haptic feedback
    },
    onAdvance: () => {
      skipToNext();
      onWishReveal(currentWish?.emotion || 'joy');
    },
    onParallaxShift: (delta) => {
      // Camera parallax on drag (mobile only)
      if (cameraRef.current && isMobile) {
        cameraRef.current.position.x += delta.x * 0.01;
        cameraRef.current.position.y -= delta.y * 0.01;
      }
    },
  });

  // 5. Haptic feedback
  const { onStarSummon, onWishReveal } = useGalaxyHaptic();

  // 6. Apply safe-area insets
  const containerStyle = {
    paddingTop: `${safeArea.top}px`,
    paddingBottom: `${safeArea.bottom}px`,
    paddingLeft: `${safeArea.left}px`,
    paddingRight: `${safeArea.right}px`,
  };

  // 7. Responsive particle count
  const particleCount = Math.floor(config.particleDensity * 2000);

  // 8. Emotion transition for current wish
  const transition = currentWish
    ? getEmotionTransition(currentWish.emotion)
    : null;

  return (
    <div ref={gestureRef} className="galaxy-scene" style={containerStyle}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ fov: isMobile ? 60 : 75 }}
        gl={{ pixelRatio: config.pixelRatio }}
      >
        <StarField count={particleCount} />
        <ambientLight intensity={0.5} />
      </Canvas>

      {/* Wish Text Overlay */}
      {currentWish && (
        <motion.div
          className="wish-text"
          variants={transition?.variants}
          initial="hidden"
          animate="enter"
          exit="exit"
        >
          <h2 style={{ fontSize: getFontSize(screenSize) }}>
            {currentWish.text}
          </h2>
        </motion.div>
      )}

      {/* Mobile: Tap instruction */}
      {isMobile && !currentWish && (
        <div className="tap-instruction">
          Tap to summon a star
        </div>
      )}
    </div>
  );
};

// Helper: Get responsive font size
function getFontSize(screenSize: string): string {
  switch (screenSize) {
    case 'xs': return '1.8rem';
    case 'sm': return '2rem';
    case 'md': return '2.2rem';
    default: return '2.5rem';
  }
}

export default GalaxyOfWishes;
```

---

## STEP 2: PARTICLE SYSTEM INTEGRATION

### Using Responsive Particle Count

```tsx
// ParticleEngine.ts integration
import { useResponsiveConfig } from './ResponsiveCalibration';

function GalaxyScene() {
  const { config } = useResponsiveConfig();
  const particleEngineRef = useRef<ParticleEngine | null>(null);

  useEffect(() => {
    const baseCount = 2000; // Galaxy base count
    const actualCount = Math.floor(baseCount * config.particleDensity);

    particleEngineRef.current = new ParticleEngine({
      count: actualCount,
      useInstancing: config.enablePostProcessing,
      size: config.shaderIntensity,
      color: '#FFD4DC',
    });
  }, [config]);
}
```

### Using Mobile Shaders

```tsx
// ShaderLibrary.ts integration
import { getOptimizedShader } from '../core/ShaderLibrary';
import { useResponsiveConfig } from '../core/ResponsiveCalibration';

function AuroraBackground() {
  const { isMobile } = useResponsiveConfig();
  const shader = getOptimizedShader('aurora', isMobile);

  return (
    <mesh>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        vertexShader={shader.vertexShader}
        fragmentShader={shader.fragmentShader}
        uniforms={shader.uniforms}
      />
    </mesh>
  );
}
```

---

## STEP 3: NARRATIVE INTEGRATION WITH GESTURES

### Swipe-Based Narrative Advancement

```tsx
import { useWishStaging } from '../core/SceneStaging';
import { useGalaxyGestures } from '../core/useTouchGestures';

function GalaxyWithGestureNarrative() {
  const { currentWish, skipToNext, pause, resume } = useWishStaging(wishes);

  const gestureRef = useGalaxyGestures({
    onSwipe: (event) => {
      if (event.direction === 'left' || event.direction === 'up') {
        skipToNext(); // Advance narrative
      }
    },
    onLongPress: () => {
      pause(); // Pause narrative on long-press
    },
  });

  return <div ref={gestureRef}>...</div>;
}
```

### Tap-Gated Narrative (Content "Touched into Existence")

```tsx
function PromisesChamber() {
  const { promises, revealPromise, revealedPromises } = usePromiseStaging(promises);

  const gestureRef = usePromisesGestures({
    onRevealOrb: (position) => {
      // Find closest orb to touch position
      const orbIndex = findClosestOrb(position);
      if (orbIndex !== -1) {
        revealPromise(orbIndex); // Touch reveals promise
      }
    },
  });

  return (
    <div ref={gestureRef}>
      {promises.map((promise, index) => (
        <Orb
          key={promise.id}
          isRevealed={revealedPromises.has(index)}
          promise={promise}
        />
      ))}
    </div>
  );
}
```

---

## STEP 4: HAPTIC FEEDBACK INTEGRATION

### Emotion-Based Haptics

```tsx
import { useEmotionReactiveHaptic } from '../core/useHapticFeedback';

function WishDisplay({ currentWish }: { currentWish: Wish | null }) {
  // Automatically trigger haptic when emotion changes
  useEmotionReactiveHaptic(currentWish?.emotion || null);

  return <div>...</div>;
}
```

### Interaction Haptics

```tsx
import { useTapHaptic, useSwipeHaptic } from '../core/useHapticFeedback';

function InteractiveElement() {
  const onTap = useTapHaptic();
  const onSwipe = useSwipeHaptic();

  const gestureRef = useTouchGestures({
    onTap: (event) => {
      onTap(); // Light haptic on tap
      handleTap(event);
    },
    onSwipe: (event) => {
      onSwipe(); // Medium haptic on swipe
      handleSwipe(event);
    },
  });

  return <div ref={gestureRef}>...</div>;
}
```

---

## STEP 5: CSS SAFE-AREA INTEGRATION

### Global CSS Setup

```css
/* globals.css */
:root {
  --safe-area-top: env(safe-area-inset-top);
  --safe-area-bottom: env(safe-area-inset-bottom);
  --safe-area-left: env(safe-area-inset-left);
  --safe-area-right: env(safe-area-inset-right);
}

/* Scene containers */
.scene-container {
  padding-top: var(--safe-area-top);
  padding-bottom: var(--safe-area-bottom);
  padding-left: var(--safe-area-left);
  padding-right: var(--safe-area-right);
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
}

/* Fixed UI elements (bottom controls) */
.scene-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: calc(20px + var(--safe-area-bottom));
}

/* Text overlays (avoid notch) */
.scene-text {
  padding-top: calc(40px + var(--safe-area-top));
  padding-left: calc(20px + var(--safe-area-left));
  padding-right: calc(20px + var(--safe-area-right));
}
```

### React Component Safe-Area

```tsx
import { useResponsiveConfig } from '../core/ResponsiveCalibration';

function SafeAreaContainer({ children }: { children: React.ReactNode }) {
  const { safeArea } = useResponsiveConfig();

  return (
    <div
      style={{
        paddingTop: safeArea.top,
        paddingBottom: safeArea.bottom,
        paddingLeft: safeArea.left,
        paddingRight: safeArea.right,
      }}
    >
      {children}
    </div>
  );
}
```

---

## STEP 6: SETTINGS PANEL INTEGRATION

### User Controls

```tsx
// SettingsPanel.tsx already updated with:
// - Device tier display
// - Haptic enable/disable toggle
// - Haptic intensity slider (mobile only)

import useSettingsStore from '../core/SettingsManager';

function MyScene() {
  const { haptics, deviceTier, isMobile } = useSettingsStore();

  // Haptic settings available globally
  const hapticConfig = {
    enabled: haptics.enabled,
    intensity: haptics.intensity,
  };

  return <div>Device Tier: {deviceTier}</div>;
}
```

---

## STEP 7: INITIALIZATION

### App.tsx Initialization

```tsx
import { useEffect } from 'react';
import useSettingsStore from './core/SettingsManager';

function App() {
  const { detectDeviceCapabilities } = useSettingsStore();

  useEffect(() => {
    // Detect device on mount
    detectDeviceCapabilities();
  }, [detectDeviceCapabilities]);

  return <Router>...</Router>;
}
```

---

## TESTING CHECKLIST

### Desktop (≥1024px)
- [ ] Full particle counts (2000-3500)
- [ ] All post-processing effects enabled
- [ ] Orbital camera controls
- [ ] Mouse parallax effects
- [ ] High-quality shaders

### Tablet (640-1023px)
- [ ] Medium particle counts (1200-2000)
- [ ] Selective post-processing
- [ ] Simplified camera controls
- [ ] Touch gestures working
- [ ] Medium-quality shaders

### Mobile (<640px)
- [ ] Low particle counts (600-800)
- [ ] Mobile-optimized shaders
- [ ] Safe-area insets correct
- [ ] Touch gestures responsive
- [ ] Haptic feedback working
- [ ] Bottom controls accessible
- [ ] Typography scaled properly
- [ ] Narrative advances via swipe

### Device-Specific Testing
- [ ] iPhone 14 Pro (notch + Dynamic Island)
- [ ] iPhone SE (no notch)
- [ ] Samsung Galaxy S23 (hole-punch)
- [ ] iPad Pro (no notch, larger screen)
- [ ] OnePlus 9 (mid-tier Android)
- [ ] Low-end Android (2GB RAM)

---

## PERFORMANCE TARGETS

| Device Tier | Target FPS | Particle Count | Post-Processing |
|-------------|-----------|----------------|-----------------|
| Ultra       | 60 FPS    | 2500-3500      | Full            |
| High        | 60 FPS    | 1500-2000      | Full            |
| Mid         | 50 FPS    | 800-1200       | Selective       |
| Low         | 30 FPS    | 300-600        | Disabled        |

---

## COMPLETION STATUS

### ✅ COMPLETED
- [x] Responsive calibration system (ResponsiveCalibration.ts)
- [x] Touch gesture recognition (useTouchGestures.ts)
- [x] Haptic feedback system (useHapticFeedback.ts)
- [x] Device tier detection (SettingsManager.ts)
- [x] Settings panel haptic controls (SettingsPanel.tsx)
- [x] Integration architecture documentation

### ⏳ PENDING
- [ ] Galaxy of Wishes responsive layout implementation
- [ ] Apology Garden responsive layout implementation
- [ ] Promises Chamber responsive layout implementation
- [ ] Melody Sphere responsive layout implementation
- [ ] Word Constellation responsive layout implementation
- [ ] Real device testing
- [ ] Performance profiling per tier

---

## NEXT STEP

**Update scene components** to integrate:
1. `useResponsiveConfig()` hook
2. Scene-specific gesture hooks (e.g., `useGalaxyGestures()`)
3. Scene-specific haptic hooks (e.g., `useGalaxyHaptic()`)
4. Safe-area insets in CSS/JSX
5. Responsive particle counts and shader selection

**Reply when ready:** "TOUCH-COMPLETE ✅"
