# 🚀 DEPLOYMENT QUICKSTART
## THANISHKA - THE LOVEVERSE V2

**Get staging live in 5 minutes**

---

## ⚡ QUICK START (Local Test)

```bash
# 1. Navigate to project
cd C:\CODING\23October\loveverse

# 2. Rename integrated finale
move src\components\FinaleSupernova.v2.INTEGRATED.tsx src\components\FinaleSupernova.v2.tsx

# 3. Install dependencies (if needed)
npm install

# 4. Start dev server
npm run dev
```

**Open**: http://localhost:5173

---

## ⚡ QUICK START (Vercel Staging)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy to staging
vercel
```

**Result**: `https://loveverse-[random].vercel.app`

---

## ⚡ QUICK START (Vercel Production)

```bash
# Deploy to production
vercel --prod
```

**Result**: `https://loveverse.vercel.app`

**Add password protection**:
1. Go to Vercel Dashboard
2. Project Settings → Deployment Protection
3. Enable Password Protection
4. Set password: `october22nd`

---

## 📂 FILES UPDATED

### ✅ Completed
- [x] `src/core/ContentTypes.ts` (courage/warmth emotions)
- [x] `src/components/FinaleSupernova.v2.INTEGRATED.tsx` (rename to `.v2.tsx`)
- [x] `vercel.json` (deployment config)
- [x] `src/data/finale.json` (8 confession lines)
- [x] `src/data/songs.json` (10 songs)
- [x] `src/data/words.json` (205 words)
- [x] `src/data/wishes.json` (28 wishes)
- [x] `src/data/apologies.json` (16 apologies)
- [x] `src/data/promises.json` (18 promises)

### 🚧 Optional (Before Final Launch)
- [ ] `src/components/MelodySphere.v2.tsx` (audio playback - template in PHASE7_INTEGRATION_GUIDE.md)
- [ ] `public/audio/*.mp3` (audio files for songs)
- [ ] `src/components/PasswordGate.tsx` (optional password wrapper)

---

## 🧪 TEST CHECKLIST (After Staging Deploy)

### Desktop
- [ ] All 9 scenes load
- [ ] Finale shows 8 confession lines (~22s sequence)
- [ ] Birthday line appears (line 7)
- [ ] "Stay." pulses at end
- [ ] No console errors

### Mobile (iPhone)
- [ ] Scenes load smoothly
- [ ] Haptic feedback triggers (heartbeat, flare, afterglow)
- [ ] FPS ≥ 55 (check Safari Dev Tools)
- [ ] Touch gestures work (tap/swipe/long-press)

### Mobile (Android)
- [ ] Scenes load smoothly
- [ ] FPS ≥ 45 (check Chrome DevTools Remote Debugging)
- [ ] Touch gestures work

---

## 🚨 TROUBLESHOOTING

### Build Fails

```bash
# Clear everything
rm -rf node_modules dist .vite
npm install
npm run build
```

### TypeScript Errors

Check `vite-env.d.ts` has:

```typescript
declare module '*.json' {
  const value: any;
  export default value;
}
```

### Vercel Deploy Fails

Check:
- Node version = 18 (in `vercel.json`)
- Build command = `npm run build`
- Output directory = `dist`

---

## 📞 SUPPORT

**Full documentation**: [`PHASE7_INTEGRATION_GUIDE.md`](PHASE7_INTEGRATION_GUIDE.md)

**Content documentation**: [`PHASE6_CONTENT_NOTES.md`](PHASE6_CONTENT_NOTES.md)

---

## ✅ READY TO LAUNCH WHEN:

1. ✅ Staging URL live
2. ⏳ Tested on real iPhone (haptics work)
3. ⏳ Tested on real Android (FPS ≥ 45)
4. ⏳ No console errors
5. ⏳ Password protection enabled
6. ⏳ All 8 finale lines appear correctly

---

**Next step**: Run local test, then deploy to staging, then report results.

