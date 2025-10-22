# PHASE 4 — RESPONSIVE SCENE LAYOUTS

**Philosophy:** Every scene adapts its soul to the device.
Mobile isn't a compromise — it's a different stage with its own choreography.

---

## 1. GALAXY OF WISHES (Scene 1)

### Desktop Layout (≥1024px)
- **Particle Field:** Full 3D depth, 2000 stars
- **Wish Text:** Center screen, max-width 800px
- **Typography:** 2.5rem heading, 1.25rem body
- **Camera:** Wide FOV (75°), full orbital controls

### Tablet Layout (640-1023px)
- **Particle Field:** Reduced depth, 1200 stars
- **Wish Text:** Center, max-width 600px
- **Typography:** 2rem heading, 1.1rem body
- **Camera:** Medium FOV (65°), simplified orbit

### Mobile Layout (<640px)
- **Particle Field:** 2D mode, 600 stars (GPU instanced)
- **Wish Text:** Full-width, padding 20px
- **Typography:** 1.8rem heading, 1rem body
- **Camera:** Fixed perspective with tilt-based parallax
- **Touch Gesture:** Tap to summon shooting star at touch point
- **Safe Area:** Top padding for notch (env(safe-area-inset-top))

**Responsive Config Hook:**
```tsx
const { config, isMobile } = useResponsiveConfig();
const particleCount = config.particleDensity * 2000; // Base count
```

---

## 2. APOLOGY GARDEN (Scene 2)

### Desktop Layout
- **Petal System:** 50 petals, volumetric rain shader
- **Apology Text:** Center overlay with frosted glass backdrop
- **Typography:** 2.2rem heading, 1.2rem body
- **Camera:** Slow downward drift

### Tablet Layout
- **Petal System:** 30 petals, medium rain shader
- **Apology Text:** Center, max-width 500px
- **Typography:** 1.9rem heading, 1.1rem body
- **Camera:** Simplified drift

### Mobile Layout
- **Petal System:** 15 petals, mobile rain shader (2 FBM iterations)
- **Apology Text:** Full-width card, bottom sheet style
- **Typography:** 1.7rem heading, 1rem body
- **Touch Gesture:** Tap to summon petal, swipe up to advance
- **Safe Area:** Bottom padding for home indicator

**Environmental Adaptation:**
```tsx
const { screenSize } = useResponsiveConfig();
const petalCount = screenSize === 'xs' ? 15 : screenSize === 'sm' ? 30 : 50;
const rainShader = isMobile ? auroraShaderMobile : auroraShader;
```

---

## 3. PROMISES CHAMBER (Scene 3)

### Desktop Layout
- **Orb Layout:** Radial constellation, 8-10 orbs
- **Promise Text:** Appears above clicked orb
- **Typography:** 2.5rem heading, 1.3rem body
- **Camera:** Free rotation around center

### Tablet Layout
- **Orb Layout:** Circular grid, 6-8 orbs
- **Promise Text:** Center overlay
- **Typography:** 2rem heading, 1.15rem body
- **Camera:** Limited rotation

### Mobile Layout
- **Orb Layout:** Vertical stack, 4-6 orbs (staggered reveal)
- **Promise Text:** Bottom drawer (swipe up to expand)
- **Typography:** 1.8rem heading, 1rem body
- **Touch Gesture:** Tap orb to reveal, long-press to linger
- **Safe Area:** Full viewport with safe-area insets

**Orb Positioning:**
```tsx
const { isMobile } = useResponsiveConfig();
const orbLayout = isMobile
  ? 'vertical-stack'   // Y-axis progression
  : 'radial-circle';   // Circular constellation
```

---

## 4. MELODY SPHERE (Scene 4)

### Desktop Layout
- **Sphere:** Large 3D audio-reactive sphere
- **Lyrics:** Bottom third, synced to audio
- **Typography:** 2.8rem heading, 1.4rem body
- **Camera:** Orbital around sphere

### Tablet Layout
- **Sphere:** Medium sphere, simplified audio reaction
- **Lyrics:** Center, max-width 600px
- **Typography:** 2.2rem heading, 1.2rem body
- **Camera:** Fixed angle with gentle sway

### Mobile Layout
- **Sphere:** Small 2D ring (top of screen)
- **Lyrics:** Full-width, center-aligned
- **Typography:** 1.9rem heading, 1.1rem body
- **Audio Controls:** Bottom sheet (play, pause, skip)
- **Touch Gesture:** Tap sphere for audio pulse, swipe for next song
- **Safe Area:** Bottom controls respect home indicator

**Audio Visualization:**
```tsx
const { config } = useResponsiveConfig();
const fftSize = isMobile ? 512 : 2048; // Lower FFT for mobile
const visualizerBars = isMobile ? 32 : 128;
```

---

## 5. WORD CONSTELLATION (Scene 5)

### Desktop Layout
- **Word Layout:** 3D constellation, category clusters
- **Word Count:** 80-100 words
- **Typography:** 1.5-3rem (size based on importance)
- **Camera:** Free rotation, depth-based parallax

### Tablet Layout
- **Word Layout:** 2.5D grid with depth hints
- **Word Count:** 50-60 words
- **Typography:** 1.3-2.5rem
- **Camera:** Limited rotation

### Mobile Layout
- **Word Layout:** Category waves (vertical scroll)
- **Word Count:** 30-40 words (progressive reveal)
- **Typography:** 1.2-2rem (scaled by emotion intensity)
- **Touch Gesture:** Tap word to emphasize, swipe for next category wave
- **Safe Area:** Scroll container respects top/bottom insets

**Category Wave Reveal:**
```tsx
const { isMobile } = useResponsiveConfig();
const waveConfig = {
  categories: ['tenderness', 'longing', 'joy'],
  waveDelay: isMobile ? 2000 : 3000,
  itemDelay: isMobile ? 200 : 300,
};
```

---

## GLOBAL RESPONSIVE PATTERNS

### Typography Scaling
```tsx
import { getTypographyScale } from './ResponsiveCalibration';

const emotion = 'tenderness';
const baseSize = 2.5; // rem
const scale = getTypographyScale(emotion, screenSize);
const finalSize = baseSize * scale;
```

### Safe Area Insets
```css
.scene-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Gesture-Gated Narrative
```tsx
import { useGalaxyGestures } from './useTouchGestures';

const gestureRef = useGalaxyGestures({
  onSummonStar: (position) => {
    // Spawn shooting star at normalized position
    spawnStar(position.x, position.y);
  },
  onAdvance: () => {
    // Swipe left/up → next wish
    narrativeStager.skipToNext();
  },
  onParallaxShift: (delta) => {
    // Drag → parallax depth shift
    camera.position.x += delta.x * 0.01;
    camera.position.y -= delta.y * 0.01;
  },
});

return <div ref={gestureRef} className="galaxy-scene">...</div>;
```

### Haptic Integration
```tsx
import { useGalaxyHaptic } from './useHapticFeedback';

const { onStarSummon, onWishReveal } = useGalaxyHaptic();

useEffect(() => {
  if (currentWish) {
    onWishReveal(currentWish.emotion); // Emotion-based haptic
  }
}, [currentWish]);
```

---

## IMPLEMENTATION CHECKLIST

- [x] Responsive calibration system (ResponsiveCalibration.ts)
- [x] Touch gesture recognition (useTouchGestures.ts)
- [x] Haptic feedback system (useHapticFeedback.ts)
- [x] Device tier detection (SettingsManager.ts)
- [ ] **Galaxy of Wishes responsive layout**
- [ ] **Apology Garden responsive layout**
- [ ] **Promises Chamber responsive layout**
- [ ] **Melody Sphere responsive layout**
- [ ] **Word Constellation responsive layout**
- [ ] Gesture-narrative integration (all scenes)
- [ ] Safe-area inset CSS (all scenes)
- [ ] Mobile shader variants integration
- [ ] Performance monitoring per scene

---

## NEXT STEPS

1. **Update each scene component** to use `useResponsiveConfig()`
2. **Integrate touch gestures** using scene-specific hooks
3. **Add haptic feedback** to narrative moments
4. **Test on real devices** (iPhone 14, Samsung S23, iPad)
5. **Verify safe-area insets** on notched devices

**Status:** Ready for scene-by-scene implementation.
