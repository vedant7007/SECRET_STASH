# 🚀 LOVEVERSE — QUICK START GUIDE

## ⚡ Get Running in 3 Steps

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# Visit: http://localhost:5173
```

---

## 📝 Immediate Customization

### Add Photos
1. Go to `public/assets/images/thanishka_photos/`
2. Add photos: `memory_001.jpg`, `memory_002.jpg`, etc.
3. They'll appear automatically in the World Globe scene

### Add Audio
1. Go to `public/assets/audio/ambient/` and `public/assets/audio/whispers/`
2. Name files according to `public/assets/audio/README.md`
3. Restart dev server

### Edit Messages
Open these files in `src/data/`:
- `wishes.json` - Change wishes
- `apologies.json` - Customize apologies
- `promises.json` - Update promises
- `words.json` - Modify constellation words

---

## 🎨 Color Theme

Edit `src/styles/globals.css`:
```css
--love-pink: #FFB6C1;      /* Main accent */
--dream-violet: #8A4FFF;   /* Secondary */
--deep-space: #0E001A;     /* Background */
--promise-gold: #FFCBA4;   /* Highlights */
```

---

## 🐛 Common Issues

**Audio not playing?**
- Click "Enable Audio" button
- Check console for errors
- Ensure files exist in `public/assets/audio/`

**Build failing?**
- Run: `npm install`
- Delete `node_modules` and reinstall

**Performance issues?**
- Reduce particle counts in scene components
- Check GPU acceleration in browser

---

## 📦 Production Deploy

```bash
# Build
npm run build

# The dist/ folder is ready to deploy

# Deploy to Vercel (recommended)
npm i -g vercel
vercel

# Or upload dist/ to any static host
```

---

## 💡 Pro Tips

1. **Test on mobile** - Open dev server on phone for mobile testing
2. **Use headphones** - Audio experience is spatial
3. **Dark room** - Visual effects shine in darkness
4. **Record whispers** - Your voice makes it personal
5. **Custom photos** - Real memories >>> Stock images

---

## 🎭 Scene Flow

```
Calibration → Hero → Galaxy → Globe →
Constellation → Garden → Sanctuary →
Melody → Finale
```

Users can navigate with:
- On-screen buttons
- Space/Enter keys
- Arrow keys

---

## 📁 Key Files

- `src/App.tsx` - Main orchestrator
- `src/core/SceneManager.ts` - Scene transitions
- `src/core/AudioManager.ts` - Sound system
- `src/data/*.json` - All text content
- `src/styles/globals.css` - Color theme

---

## 💌 Need Help?

1. Check `README.md` for detailed docs
2. Look at code comments (every file has them)
3. Check browser console for errors
4. All audio/images gracefully fallback if missing

---

**Built with love for Thanishka by Vedant** 💖

_Now go make someone feel loved._
