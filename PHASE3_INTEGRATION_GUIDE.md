# 🎭 PHASE 3 INTEGRATION GUIDE — CONTENT & EMOTIONAL BINDING

**Status:** ✅ **READY FOR YOUR JSON PACKS**
**Date:** 2025-10-20

---

## ✅ **SYSTEM PREPARATION COMPLETE**

All scenes are now prepared to dynamically load and bind emotional content from JSON sources with full animation metadata support.

---

## 📦 **What Has Been Built**

### **1. TypeScript Type System** — [ContentTypes.ts](src/core/ContentTypes.ts)

**Interfaces Created:**
- ✅ `Wish` — For Galaxy of Wishes scene
- ✅ `Apology` — For Apology Garden scene
- ✅ `Promise` — For Promises Chamber scene
- ✅ `Song` — For Melody Sphere scene (with `LyricLine` timing)
- ✅ `Word` — For Word Constellation scene (500+ words)

**Expected Structure (All JSON Files):**
```typescript
{
  id: number,
  text: string,
  emotion: string,      // Maps to animation timing (e.g., "joy", "tenderness")
  effect: string,       // Animation effect name (e.g., "sparkle-burst", "soft-glow")
  theme: string,        // Theme-based styling (e.g., "beauty", "kindness")
  timing: number        // Duration or delay in seconds
}
```

**Emotion-to-Animation Mapping:**
```typescript
EMOTION_TO_ANIMATION = {
  joy:        "sparkle-burst"   // 800ms, scale 1.5, rotate 360°
  tenderness: "soft-glow"        // 1200ms, blur 8px, gentle pulse
  serenity:   "gentle-float"     // 2000ms, y-axis float
  awe:        "radial-bloom"     // 1500ms, scale + brightness
  nostalgia:  "fade-in-warm"     // 1800ms, sepia fade
  wonder:     "twinkle"          // 1000ms, opacity + scale pulse
  elation:    "bounce-glow"      // 600ms, bounce + brightness
  completion: "expand-fade"      // 3000ms, scale 2x + fade out
}
```

**Theme-to-Style Mapping:**
```typescript
THEME_TO_STYLE = {
  beauty:    { primary: "#FFB6C1", glow: "#FFD4E5", blur: 4 }
  strength:  { primary: "#8A4FFF", glow: "#B19CD9", blur: 2 }
  kindness:  { primary: "#FFCBA4", glow: "#FFEAA7", blur: 6 }
  light:     { primary: "#FFFFFF", glow: "#FFFEF0", blur: 8 }
  warmth:    { primary: "#FF8C42", glow: "#FFDAB9", blur: 5 }
  grace:     { primary: "#E8E0F5", glow: "#F0E6FA", blur: 3 }
  wisdom:    { primary: "#4682B4", glow: "#B0E0E6", blur: 4 }
  courage:   { primary: "#DC143C", glow: "#FF6B6B", blur: 3 }
}
```

---

### **2. Content Loader System** — [ContentLoader.ts](src/core/ContentLoader.ts)

**Features:**
- ✅ Async JSON fetching with caching
- ✅ Automatic validation (warns if fields are missing, provides defaults)
- ✅ React hooks for each content type
- ✅ Filter by emotion/theme
- ✅ Random selection utilities

**Usage Example:**
```typescript
import contentLoader, { useWishes } from './core/ContentLoader';

// In a React component:
const { data: wishes, isLoading, error } = useWishes();

// Or imperative:
const wishes = await contentLoader.loadWishes();
```

**Available Hooks:**
- `useWishes()` — Loads [wishes.json](src/data/wishes.json)
- `useApologies()` — Loads [apologies.json](src/data/apologies.json)
- `usePromises()` — Loads [promises.json](src/data/promises.json)
- `useSongs()` — Loads `songs.json` (template awaiting your JSON)
- `useWords()` — Loads `words.json` (template awaiting your JSON)

---

### **3. Emotion Animator Component** — [EmotionAnimator.tsx](src/core/EmotionAnimator.tsx)

**React Component for Emotion-Driven Animations:**
```tsx
import EmotionAnimator, { EmotionalText } from './core/EmotionAnimator';

// Animate any element with emotion metadata
<EmotionAnimator emotion="joy" trigger="mount" delay={0.5}>
  <div>This text fades in with joy timing!</div>
</EmotionAnimator>

// Specialized components:
<EmotionalText text="Hello" emotion="tenderness" delay={1.0} />
<EmotionalButton emotion="elation" onClick={handleClick}>Click Me</EmotionalButton>
<EmotionalGlow emotion="awe">Always pulsing glow</EmotionalGlow>
```

**Trigger Modes:**
- `mount` — Animate on component mount
- `hover` — Animate on hover
- `tap` — Animate on click
- `always` — Continuously animate (pulse/float)

---

### **4. Updated JSON Files (Sample Data)**

#### **✅ wishes.json** — [View File](src/data/wishes.json)
```json
{
  "id": 1,
  "text": "I wish your smile outlives galaxies...",
  "emotion": "joy",
  "effect": "sparkle-burst",
  "theme": "light",
  "animation": "shooting-star",
  "intensity": "bright",
  "timing": 1.2
}
```
**Status:** ✅ 10 items with full metadata

#### **✅ apologies.json** — [View File](src/data/apologies.json)
```json
{
  "id": 1,
  "text": "I'm sorry for the times I didn't listen...",
  "emotion": "tenderness",
  "effect": "soft-glow",
  "theme": "kindness",
  "intensity": "soft",
  "petal_count": 15,
  "rain_intensity": 0.3,
  "pause_duration": 2500,
  "timing": 2.0
}
```
**Status:** ✅ 8 items with petal/rain metadata

#### **✅ promises.json** — [View File](src/data/promises.json)
```json
{
  "id": 1,
  "text": "I promise to always listen, truly listen...",
  "emotion": "serenity",
  "effect": "gentle-float",
  "theme": "kindness",
  "glow_color": "#80F5FF",
  "orb_size": "medium",
  "reveal_delay": 800,
  "timing": 2.0
}
```
**Status:** ✅ 9 items with orb styling

#### **⏳ songs.json** — AWAITING YOUR JSON
**Expected Structure:**
```json
{
  "id": 1,
  "title": "Song Title",
  "artist": "Artist Name",
  "emotion": "romantic",
  "effect": "fade-bloom",
  "theme": "beauty",
  "duration": 180,
  "mood": "gentle",
  "color_palette": ["#FFB6C1", "#8A4FFF", "#80F5FF"],
  "audio_file": "/assets/audio/song1.mp3",
  "lyrics": [
    { "time": 0, "text": "First line", "emphasis": false, "effect": "fade" },
    { "time": 5.2, "text": "Second line", "emphasis": true, "effect": "bloom" }
  ],
  "timing": 3.0
}
```

#### **⏳ words.json** — AWAITING YOUR JSON
**Expected Structure (500+ words):**
```json
{
  "id": 1,
  "text": "Radiant",
  "emotion": "awe",
  "effect": "radial-bloom",
  "theme": "beauty",
  "category": "beauty",
  "phrase": "You shine with a light that no darkness can dim",
  "glow_intensity": 0.8,
  "size": "medium",
  "orbit_speed": 1.2,
  "timing": 1.5
}
```

---

## 🎬 **Scene Integration Templates**

### **Galaxy of Wishes Scene**
```tsx
import { useWishes } from '../core/ContentLoader';
import EmotionAnimator from '../core/EmotionAnimator';
import { getStyleForTheme } from '../core/ContentTypes';

const GalaxyOfWishes = () => {
  const { data: wishes, isLoading } = useWishes();

  if (isLoading) return <LoadingScreen />;

  return (
    <Canvas>
      {wishes.map((wish, index) => {
        const theme = getStyleForTheme(wish.theme);

        return (
          <Star
            key={wish.id}
            position={calculatePosition(index)}
            color={theme.colors.primary}
            glowColor={theme.colors.glow}
            onClick={() => revealWish(wish)}
            animation={wish.animation}
          >
            <EmotionAnimator
              emotion={wish.emotion}
              effect={wish.effect}
              trigger="tap"
            >
              <WishText>{wish.text}</WishText>
            </EmotionAnimator>
          </Star>
        );
      })}
    </Canvas>
  );
};
```

### **Apology Garden Scene**
```tsx
import { useApologies } from '../core/ContentLoader';

const ApologyGarden = () => {
  const { data: apologies } = useApologies();
  const [currentIndex, setCurrentIndex] = useState(0);
  const apology = apologies[currentIndex];

  useEffect(() => {
    if (!apology) return;

    // Spawn petals based on metadata
    spawnPetals(apology.petal_count);

    // Adjust rain intensity
    setRainIntensity(apology.rain_intensity);

    // Auto-advance after pause duration
    const timer = setTimeout(() => {
      setCurrentIndex(i => i + 1);
    }, apology.pause_duration);

    return () => clearTimeout(timer);
  }, [apology]);

  return (
    <div className="garden">
      <RainEffect intensity={apology?.rain_intensity || 0.3} />
      <PetalSystem count={apology?.petal_count || 15} />

      <EmotionAnimator
        emotion={apology?.emotion || 'tenderness'}
        trigger="mount"
        delay={apology?.timing || 2.0}
      >
        <p className="apology-text">{apology?.text}</p>
      </EmotionAnimator>
    </div>
  );
};
```

### **Promises Chamber Scene**
```tsx
import { usePromises } from '../core/ContentLoader';

const PromisesChamber = () => {
  const { data: promises } = usePromises();

  return (
    <Canvas>
      {promises.map((promise, index) => (
        <PromiseOrb
          key={promise.id}
          position={calculateOrbPosition(index)}
          glowColor={promise.glow_color}
          size={promise.orb_size}
          onClick={() => revealPromise(promise)}
        >
          <EmotionAnimator
            emotion={promise.emotion}
            trigger="tap"
            delay={promise.reveal_delay / 1000}
          >
            <PromiseText>{promise.text}</PromiseText>
          </EmotionAnimator>
        </PromiseOrb>
      ))}
    </Canvas>
  );
};
```

### **Word Constellation Scene**
```tsx
import { useWords } from '../core/ContentLoader';
import { getStyleForTheme } from '../core/ContentTypes';

const WordConstellation = () => {
  const { data: words } = useWords();

  // Group by category
  const wordsByCategory = words.reduce((acc, word) => {
    if (!acc[word.category]) acc[word.category] = [];
    acc[word.category].push(word);
    return acc;
  }, {});

  return (
    <Canvas>
      {Object.entries(wordsByCategory).map(([category, categoryWords]) => (
        <WordCluster key={category} category={category}>
          {categoryWords.map((word, index) => {
            const theme = getStyleForTheme(word.theme);

            return (
              <WordNode
                key={word.id}
                text={word.text}
                position={calculateOrbit(index, categoryWords.length)}
                size={word.size}
                glowColor={theme.colors.glow}
                glowIntensity={word.glow_intensity}
                orbitSpeed={word.orbit_speed}
                onClick={() => revealPhrase(word)}
              >
                <EmotionAnimator emotion={word.emotion} trigger="hover">
                  <WordLabel>{word.text}</WordLabel>
                </EmotionAnimator>
              </WordNode>
            );
          })}
        </WordCluster>
      ))}
    </Canvas>
  );
};
```

### **Melody Sphere Scene**
```tsx
import { useSongs } from '../core/ContentLoader';

const MelodySphere = () => {
  const { data: songs } = useSongs();
  const [activeSong, setActiveSong] = useState(null);
  const [currentLyric, setCurrentLyric] = useState(null);

  useEffect(() => {
    if (!activeSong) return;

    // Play audio
    const audio = new Audio(activeSong.audio_file);
    audio.play();

    // Sync lyrics
    const lyricTimer = setInterval(() => {
      const currentTime = audio.currentTime;
      const lyric = activeSong.lyrics.find(
        (l, i) => l.time <= currentTime &&
                  (!activeSong.lyrics[i + 1] || activeSong.lyrics[i + 1].time > currentTime)
      );
      setCurrentLyric(lyric);
    }, 100);

    return () => {
      audio.pause();
      clearInterval(lyricTimer);
    };
  }, [activeSong]);

  return (
    <div>
      <Canvas>
        {songs.map((song, index) => (
          <SongSphere
            key={song.id}
            position={calculateSpherePosition(index)}
            colors={song.color_palette}
            mood={song.mood}
            onClick={() => setActiveSong(song)}
          >
            <SongTitle>{song.title}</SongTitle>
          </SongSphere>
        ))}
      </Canvas>

      {currentLyric && (
        <EmotionAnimator
          emotion={activeSong.emotion}
          effect={currentLyric.effect}
          trigger="mount"
        >
          <LyricDisplay emphasis={currentLyric.emphasis}>
            {currentLyric.text}
          </LyricDisplay>
        </EmotionAnimator>
      )}
    </div>
  );
};
```

---

## ✅ **SYSTEM CHECKLIST**

- [x] **1. Scene loaders can read external JSON content**
  - ✅ ContentLoader.ts with async fetch + caching
  - ✅ React hooks for each content type
  - ✅ Automatic validation with defaults

- [x] **2. Animation effects can be selected via "effect" or "theme"**
  - ✅ EMOTION_TO_ANIMATION mapping (8 emotions)
  - ✅ THEME_TO_STYLE mapping (8 themes)
  - ✅ Helper functions: `getAnimationForEmotion()`, `getStyleForTheme()`

- [x] **3. Each scene is ready to map emotional metadata → micro-interactions**
  - ✅ EmotionAnimator component with 4 trigger modes
  - ✅ Specialized components: EmotionalText, EmotionalButton, EmotionalGlow
  - ✅ Integration templates for all 5 scenes

- [x] **4. Words/star nodes support theme-based glow styling**
  - ✅ Theme colors include primary, secondary, accent, glow
  - ✅ Theme effects include blur, brightness, saturation
  - ✅ `glow_intensity` field in Word interface

---

## 🎯 **READY FOR YOUR JSON PACKS**

Please provide the following JSON files with the structures defined above:

### **Required:**
1. **songs.json** — Song data with lyrics timing + VFX hooks
2. **words.json** — 500+ emotional descriptors with category grouping

### **Optional Enhancements:**
You may also replace the current sample data in:
- **wishes.json** (currently 10 items)
- **apologies.json** (currently 8 items)
- **promises.json** (currently 9 items)

---

## 📖 **Expected JSON Format Reference**

### **Minimal Required Fields (All Content Types):**
```json
{
  "id": number | string,
  "text": string,
  "emotion": string,
  "effect": string,
  "theme": string,
  "timing": number
}
```

### **Scene-Specific Fields:**

**Wishes:**
- `animation`: "shooting-star" | "twinkle" | "bloom" | "pulse" | "spiral"
- `intensity`: "soft" | "medium" | "bright"

**Apologies:**
- `intensity`: "soft" | "deep" | "tender"
- `petal_count`: number (10-30)
- `rain_intensity`: number (0-1)
- `pause_duration`: number (milliseconds)

**Promises:**
- `glow_color`: hex color string
- `orb_size`: "small" | "medium" | "large"
- `reveal_delay`: number (milliseconds)

**Songs:**
- `title`, `artist`, `duration`, `mood`, `color_palette`, `audio_file`
- `lyrics`: array of `{ time, text, emphasis, effect }`

**Words:**
- `category`: "beauty" | "strength" | "kindness" | "light" | "warmth" | "grace" | "wisdom" | "courage" | "other"
- `phrase`: string (reveals on click)
- `glow_intensity`: number (0-1)
- `size`: "small" | "medium" | "large"
- `orbit_speed`: number (multiplier, default 1.0)

---

## 🚀 **Once You Provide the JSON:**

I will:
1. ✅ Validate the structure
2. ✅ Wire the data into all scenes
3. ✅ Test emotion-to-animation mappings
4. ✅ Ensure theme-based styling applies correctly
5. ✅ Verify lyric timing sync (for songs)
6. ✅ Test category grouping (for words)

---

**The system is ready. The canvas is prepared. Now it awaits your poetry.** 💫

**Please confirm readiness and deliver the JSON packs for Phase 3 completion.**
