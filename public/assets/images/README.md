# 🖼️ Image Assets Guide

## Directory Structure

### `/backgrounds/`
Large, atmospheric background images.

**Recommended files:**
- `space_deep.webp` - Deep space texture (2560x1440 min)
- `nebula_violet.webp` - Purple/violet nebula clouds
- `aurora_gradient.webp` - Aurora borealis inspired gradient
- `starfield.webp` - Dense star field (tileable)

**Specs:**
- Format: WebP (for performance) or JPG
- Size: 2560x1440 or higher
- Compression: Balanced (quality 80-85)

### `/petals/`
Individual flower petal images for the Apology Garden scene.

**Files needed:**
- `petal_pink_1.png` - Individual rose petal
- `petal_pink_2.png` - Variation 2
- `petal_pink_3.png` - Variation 3
- `petal_violet_1.png` - Violet/lavender petal

**Specs:**
- Format: PNG with transparency
- Size: 200x200px to 512x512px
- Should look natural, slightly curved
- Soft lighting, gentle shadows

### `/stars/`
Star and particle textures.

**Files:**
- `star_glow.png` - Soft glowing star (circular gradient)
- `particle_dot.png` - Small particle (16x16px)
- `shooting_star_trail.png` - Elongated glow for shooting stars

**Specs:**
- Format: PNG with transparency
- Sizes: 64x64px to 256x256px
- White/light colored (will be tinted in code)

### `/thanishka_photos/`
**Personal photos of Thanishka for the World Globe scene.**

Place photos here with these naming conventions:
- `memory_001.jpg`
- `memory_002.jpg`
- etc.

**Specs:**
- Format: JPG or WebP
- Size: 800x800px to 1200x1200px (will be displayed at ~400px)
- Aspect ratio: Any (will be contained in circles)
- Preferred: Square crops, good lighting, meaningful moments

**Privacy:**
- These images are for local viewing only
- Not included in git repository (.gitignore configured)
- Only visible when running the site

---

## Placeholder Images

Until real images are provided, the system uses:
- CSS gradients for backgrounds
- Procedurally generated canvas particles for stars
- Colored div placeholders for photos
- SVG shapes for petals

## Optimization

All images should be:
- Compressed appropriately
- Lazy-loaded when possible
- Preloaded during calibration for smooth experience
