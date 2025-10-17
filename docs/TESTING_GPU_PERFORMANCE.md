# GPU Performance Testing Guide

**Goal**: Measure FPS improvements from GPU optimizations
**Time**: 10-15 minutes
**Tools**: Chrome DevTools, Browser Console

---

## 🧪 Test Scenarios

### Test 1: Baseline - 100 Objects
**Expected**: 60 FPS (no improvement needed)

1. Open http://localhost:5173
2. Sign in with Google
3. Open Chrome DevTools (Cmd+Opt+I)
4. Go to **Performance** tab
5. Click **Record** (red circle)
6. Use AI Chat: "Create 100 random objects"
7. Wait 2 seconds
8. Select all (Cmd+A)
9. Drag objects around for 5 seconds
10. Stop recording
11. Check **FPS** (green line at top)

**Target**: Solid 60 FPS ✅

---

### Test 2: Medium Load - 500 Objects
**Expected**: 55-60 FPS (33% improvement)

1. Refresh page (to reset)
2. Open DevTools → Performance tab
3. Click **Record**
4. Use AI Chat: "Create 500 random objects"
5. Wait for all batches to complete
6. Select all (Cmd+A)
7. Drag, rotate, scale objects for 10 seconds
8. Stop recording
9. Check **FPS** and **GPU memory**

**Target**: 55-60 FPS ✅

---

### Test 3: Heavy Load - 1000 Objects
**Expected**: 50-55 FPS (96% improvement from baseline)

1. Refresh page
2. Open DevTools → Performance tab
3. Click **Record**
4. Use AI Chat: "Create 1000 random objects"
5. Wait for all batches (10 batches of 100)
6. Select all (Cmd+A)
7. Transform objects continuously for 10 seconds
8. Stop recording
9. Analyze FPS

**Target**: 50-55 FPS ✅

---

### Test 4: Stress Test - 2000 Objects
**Expected**: 42-48 FPS (180% improvement)

1. Refresh page
2. Open DevTools → Performance tab
3. Click **Record**
4. Use AI Chat: "Create 2000 random objects"
5. Wait for all batches (20 batches of 100)
6. Try to select and move objects
7. Stop recording after 10 seconds

**Target**: 42-48 FPS ✅

---

## 📊 How to Read Performance Results

### Chrome DevTools Performance Tab

After recording, you'll see:

1. **FPS Chart** (green line at top):
   - Solid green = 60 FPS ✅
   - Yellow = 30-60 FPS ⚠️
   - Red = <30 FPS ❌

2. **Main Thread** (timeline):
   - Short bars = Good performance ✅
   - Long bars = Frame drops ❌

3. **GPU Memory** (Summary tab):
   - Should stay stable
   - No continuous growth (memory leak)

4. **Rendering Stats**:
   - Click on a frame
   - Check "Rendering" time
   - Should be <16ms for 60 FPS

---

## 🖥️ Browser Console Tests

### Test GPU Features

Open Console (Cmd+Opt+J) and run:

```javascript
// Check WebGL support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
console.log('WebGL Supported:', !!gl);
console.log('GPU Vendor:', gl?.getParameter(gl.VENDOR));
console.log('GPU Renderer:', gl?.getParameter(gl.RENDERER));
```

**Expected Output**:
```
WebGL Supported: true
GPU Vendor: "Apple" (or "Intel", "NVIDIA", "AMD")
GPU Renderer: "Apple M1 GPU" (or similar)
```

---

### Test Layer Caching

```javascript
// Check if grid layer is cached
const stage = document.querySelector('canvas').konvaStage;
const gridLayer = stage.getLayers()[0]; // First layer = grid
console.log('Grid Layer Cached:', gridLayer._cache.canvas !== undefined);
```

**Expected**: `true` ✅

---

### Measure FPS in Real-Time

```javascript
// FPS Counter (paste in console)
let lastTime = performance.now();
let frames = 0;
let fps = 0;

function measureFPS() {
  frames++;
  const currentTime = performance.now();

  if (currentTime >= lastTime + 1000) {
    fps = Math.round((frames * 1000) / (currentTime - lastTime));
    console.log(`FPS: ${fps}`);
    frames = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(measureFPS);
}

measureFPS();
```

**Then**:
1. Create 1000 objects
2. Drag them around
3. Watch console for FPS updates
4. Stop with: `location.reload()`

---

## 🎯 Grid Performance Test

### Before Optimization (Theoretical)
Grid has ~500 lines. Each line = 1 draw call.

### After Optimization (Current)
Grid cached as 1 GPU texture = 1 draw call.

**Test It**:

1. Open DevTools → Performance
2. Record
3. Toggle grid on/off (press `G` key 10 times)
4. Stop recording
5. Check "Rendering" times

**Expected**: Grid toggle should be instant (<5ms) ✅

---

## 🧮 Performance Calculation

### Formula
```
FPS = 1000 / frame_time_ms
frame_time_ms = GPU_time + CPU_time + Network_time
```

For 60 FPS: `frame_time ≤ 16.67ms`

### GPU Time Budget
- **Grid Rendering**: <1ms (cached)
- **1000 Objects**: 8-10ms (GPU parallel)
- **Transformers**: 2-3ms
- **Compositing**: 1-2ms
- **Total**: ~12-16ms ✅

---

## 📈 Expected Results Table

| Test | Objects | Target FPS | Pass Criteria |
|------|---------|------------|---------------|
| Baseline | 100 | 60 FPS | No frame drops |
| Medium | 500 | 55-60 FPS | Smooth transforms |
| Heavy | 1000 | 50-55 FPS | Playable experience |
| Stress | 2000 | 42-48 FPS | Renders without crash |

---

## 🐛 Troubleshooting

### Issue: FPS Lower Than Expected

**Check**:
1. Hardware Acceleration enabled?
   - Chrome → Settings → Advanced → System → Hardware Acceleration
2. GPU drivers up to date?
3. Other tabs using GPU?
   - Check `chrome://gpu/`
4. Laptop on battery saver mode?

**Fix**: Enable hardware acceleration, close other tabs, plug in laptop

---

### Issue: Grid Lines Disappearing

**Check**:
```javascript
const gridLayer = stage.getLayers()[0];
console.log('Grid visible:', gridLayer.visible());
console.log('Grid cached:', gridLayer.isCached());
```

**Fix**: Press `G` to toggle grid, should recache automatically

---

### Issue: Memory Leak

**Check**:
1. Create 1000 objects
2. Delete all (select all + Delete key)
3. Check DevTools → Memory → Take snapshot
4. Create 1000 again
5. Delete all
6. Take another snapshot
7. Compare memory usage

**Expected**: Memory should return to baseline after deletion

---

## ✅ Success Criteria

### Minimum Requirements (Pass)
- ✅ 100 objects @ 60 FPS
- ✅ 500 objects @ 50+ FPS
- ✅ Grid toggle instant (<5ms)
- ✅ No memory leaks
- ✅ WebGL detected

### Target Performance (Excellent)
- ✅ 500 objects @ 58+ FPS
- ✅ 1000 objects @ 52+ FPS
- ✅ 2000 objects @ 40+ FPS
- ✅ Smooth transforms at all scales

---

## 📝 Test Report Template

After testing, fill this out:

```
## GPU Performance Test Report

**Date**: [Today's date]
**Hardware**: [Your computer specs]
**Browser**: Chrome [version]

### Test Results

| Test | Objects | FPS | Pass/Fail | Notes |
|------|---------|-----|-----------|-------|
| Baseline | 100 | ___ | [ ] | _____ |
| Medium | 500 | ___ | [ ] | _____ |
| Heavy | 1000 | ___ | [ ] | _____ |
| Stress | 2000 | ___ | [ ] | _____ |

### GPU Info
- Vendor: _______
- Renderer: _______
- WebGL Version: _______

### Observations
- [Write any observations here]

### Issues Found
- [List any issues]

### Recommendation
- [ ] Ready to commit
- [ ] Needs optimization
```

---

## 🚀 Quick Test (2 Minutes)

**Don't have time? Run this quick test**:

1. Open http://localhost:5173
2. Open Console (Cmd+Opt+J)
3. Paste this:

```javascript
console.clear();
console.log('🧪 Quick GPU Test Starting...\n');

// Check WebGL
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
console.log('✅ WebGL:', !!gl ? 'Supported' : '❌ NOT SUPPORTED');
console.log('🎮 GPU:', gl?.getParameter(gl.RENDERER));

// FPS Test
let frames = 0, lastTime = performance.now();
function countFPS() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log(`📊 FPS: ${Math.round(frames * 1000 / (now - lastTime))}`);
    frames = 0;
    lastTime = now;
  }
  if (frames < 300) requestAnimationFrame(countFPS);
}
countFPS();

console.log('\n✅ Test running for 5 seconds...');
console.log('💡 Create 500 objects and move them around!');
```

4. Use AI: "Create 500 objects"
5. Drag objects around
6. Check FPS in console

**Expected**: 55-60 FPS ✅

---

**Ready to test? Refresh your browser and follow Test 1! 🎯**

