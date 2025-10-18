# 🔊 Audio Assets Guide

## Directory Structure

### `/ambient/`
Background music and atmospheric soundscapes for each scene.

**Required files:**
- `intro_theme.mp3` - Soft, mysterious opening (should build slowly)
- `hero_bloom.mp3` - Grand orchestral swell for hero section
- `galaxy_wonder.mp3` - Playful, twinkling atmosphere
- `globe_nostalgia.mp3` - Warm, gentle melody with subtle melancholy
- `constellation_ambient.mp3` - Ethereal, expansive pad sounds
- `rain_garden.mp3` - Gentle rain with soft reverb for apology scene
- `promise_sanctuary.mp3` - Serene, golden-hour feeling
- `melody_dance.mp3` - Rhythmic, uplifting, BPM-driven
- `finale_orchestra.mp3` - Triumphant yet gentle conclusion

**Audio specs:**
- Format: MP3 (192kbps minimum)
- Volume: Normalized to -14 LUFS
- Length: 2-4 minutes (loopable)

### `/whispers/`
Vedant's voice recordings - intimate, close-mic whispers.

**Required files:**
- `scene1_intro.wav` - "Welcome to our universe..."
- `scene2_hero.wav` - "This is where everything begins..."
- `scene3_wishes.wav` - "Every star holds a wish for you..."
- `scene4_globe.wav` - "Every place we've been, every place we'll go..."
- `scene5_words.wav` - "These are the words I carry for you..."
- `scene6_apology.wav` - "I'm sorry for the times I..."
- `scene7_promises.wav` - "I promise you..."
- `scene8_melody.wav` - "Listen... this is us..."
- `finale_whisper.wav` - "Thank you for existing, Thanishka."

**Recording tips:**
- Close mic distance (6-12 inches)
- Quiet room (minimal reverb)
- Soft, intimate tone
- Format: WAV (uncompressed) or high-quality MP3
- Pause naturally between phrases

### `/songs/`
Full songs with lyrics for the Melody Sphere scene.

**Required structure per song:**
```
song1.mp3
song1_lyrics.json
song1_cover.webp
```

**lyrics.json format:**
```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "lyrics": [
    {"time": 0.5, "line": "First line of lyrics"},
    {"time": 4.2, "line": "Second line..."}
  ]
}
```

---

## Placeholder Audio

Until real audio is ready, the system will:
- Use sine wave tones at different frequencies per scene
- Show visual indicators when audio would trigger
- Log audio events to console for debugging

## Integration Notes

All audio is managed by `/src/core/AudioManager.ts`:
- Preloading during calibration
- Crossfading between scenes (3.5s default)
- Spatial positioning for whispers
- Volume curves synced with animations
