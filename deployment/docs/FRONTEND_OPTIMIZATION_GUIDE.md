# Frontend Rendering & Bundle Size Optimization Guide

## 🚨 Current Issues

### Bundle Analysis
```
Current Bundle Size: 805.04 kB (224.84 kB gzipped)
⚠️ This is LARGER than the 500 kB recommended limit
```

### Performance Bottlenecks Identified

1. **Large Bundle Size** - 805KB is too large for initial load
2. **No Code Splitting** - Everything loads at once
3. **Re-rendering on Every Object Change** - Canvas re-renders for all object updates
4. **Grid Re-calculation** - Grid lines recalculated frequently
5. **WebSocket Message Overhead** - All clients receive all messages
6. **No Virtualization** - All objects rendered even if off-screen

---

## 🎯 Optimization Strategy

### Phase 1: Bundle Size Reduction (Target: < 300KB)

#### 1.1 Code Splitting - Lazy Load Routes & Components

**Create: `frontend/src/routes/LazyRoutes.tsx`**
```typescript
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Lazy load heavy components
const Canvas = lazy(() => import('../pages/Canvas'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const AIChat = lazy(() => import('../components/AIChat'))

// Loading fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <div>Loading...</div>
  </div>
)

export function LazyRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/canvas/:projectId" element={<Canvas />} />
      </Routes>
    </Suspense>
  )
}
```

**Update: `frontend/src/routes/Router.tsx`**
```typescript
import { BrowserRouter } from 'react-router-dom'
import { LazyRoutes } from './LazyRoutes'
import { ProjectProvider } from '../contexts/ProjectContext'
import Header from '../components/Header'

export function Router() {
  return (
    <BrowserRouter>
      <ProjectProvider>
        <Header />
        <LazyRoutes />
      </ProjectProvider>
    </BrowserRouter>
  )
}
```

#### 1.2 Lazy Load Konva (Heavy Library ~200KB)

**Update: `frontend/src/pages/Canvas.tsx`**
```typescript
import { lazy, Suspense } from 'react'

// Lazy load KonvaCanvas (large library)
const KonvaCanvas = lazy(() => import('../components/KonvaCanvas'))

// ... in render:
<Suspense fallback={<div>Loading canvas...</div>}>
  <KonvaCanvas
    objects={objects}
    // ... other props
  />
</Suspense>
```

#### 1.3 Optimize Dependencies

**Update: `frontend/package.json`** - Use lighter alternatives:
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.29.0",
    "react-konva": "^18.2.10",
    "konva": "^9.3.18",
    "firebase": "^11.1.0"
    // Remove unused dependencies
  }
}
```

Check and remove unused imports:
```bash
npm uninstall <unused-package>
```

#### 1.4 Tree Shaking - Import Only What You Need

**Update: `frontend/src/components/KonvaCanvas.tsx`**
```typescript
// ❌ BAD - Imports entire Konva
import Konva from 'konva'

// ✅ GOOD - Import only what's needed
import { Stage, Layer } from 'konva/lib/Stage'
import { Rect } from 'konva/lib/shapes/Rect'
import { Circle } from 'konva/lib/shapes/Circle'
// ... etc
```

---

### Phase 2: Rendering Optimization

#### 2.1 Memoize Canvas Objects

**Update: `frontend/src/components/KonvaCanvas.tsx`**
```typescript
import { memo, useMemo } from 'react'

// Memoize individual shape components
const MemoizedRect = memo(({ obj, ...props }: any) => (
  <Rect
    key={obj.id}
    id={obj.id}
    x={obj.x}
    y={obj.y}
    width={obj.width}
    height={obj.height}
    rotation={obj.rotation}
    fill={obj.color}
    perfectDrawEnabled={false}
    shadowForStrokeEnabled={false}
    {...props}
  />
), (prevProps, nextProps) => {
  // Custom comparison - only re-render if object changed
  return (
    prevProps.obj.id === nextProps.obj.id &&
    prevProps.obj.x === nextProps.obj.x &&
    prevProps.obj.y === nextProps.obj.y &&
    prevProps.obj.width === nextProps.obj.width &&
    prevProps.obj.height === nextProps.obj.height &&
    prevProps.obj.rotation === nextProps.obj.rotation &&
    prevProps.obj.color === nextProps.obj.color
  )
})

// Do the same for Circle, Text, etc.
```

#### 2.2 Object Virtualization - Only Render Visible Objects

**Create: `frontend/src/lib/viewport.ts`**
```typescript
export function isObjectInViewport(
  obj: CanvasObject,
  viewport: { x: number; y: number; width: number; height: number },
  scale: number,
  padding: number = 100
): boolean {
  // Calculate object bounds
  const objLeft = obj.x - obj.width / 2
  const objRight = obj.x + obj.width / 2
  const objTop = obj.y - obj.height / 2
  const objBottom = obj.y + obj.height / 2

  // Calculate viewport bounds in canvas space
  const viewLeft = -viewport.x / scale - padding
  const viewRight = (viewport.width - viewport.x) / scale + padding
  const viewTop = -viewport.y / scale - padding
  const viewBottom = (viewport.height - viewport.y) / scale + padding

  // Check if object intersects viewport
  return !(
    objRight < viewLeft ||
    objLeft > viewRight ||
    objBottom < viewTop ||
    objTop > viewBottom
  )
}
```

**Update: `frontend/src/components/KonvaCanvas.tsx`**
```typescript
import { isObjectInViewport } from '../lib/viewport'

// In KonvaCanvas component:
const visibleObjects = useMemo(() => {
  return objects.filter(obj =>
    isObjectInViewport(
      obj,
      { x: position.x, y: position.y, width: stageWidth, height: stageHeight },
      scale
    )
  )
}, [objects, position, scale, stageWidth, stageHeight])

// Render only visible objects
<Layer ref={layerRef}>
  {visibleObjects.map(obj => {
    // ... render logic
  })}
</Layer>
```

#### 2.3 Reduce Grid Line Count

**Update: `frontend/src/components/KonvaCanvas.tsx`** - Lines 306-382
```typescript
const gridLines = useMemo(() => {
  if (!showGrid) return null

  const majorGridSize = 50
  const minorGridSize = 5
  const lines: JSX.Element[] = []

  // Calculate visible area with padding
  const padding = majorGridSize * 2
  const viewStartX = -position.x / scale - padding
  const viewEndX = (stageWidth - position.x) / scale + padding
  const viewStartY = -position.y / scale - padding
  const viewEndY = (stageHeight - position.y) / scale + padding

  const startX = Math.floor(viewStartX / majorGridSize) * majorGridSize
  const endX = Math.ceil(viewEndX / majorGridSize) * majorGridSize
  const startY = Math.floor(viewStartY / majorGridSize) * majorGridSize
  const endY = Math.ceil(viewEndY / majorGridSize) * majorGridSize

  // ✅ OPTIMIZATION: Skip minor grid when zoomed out
  const showMinorGrid = scale > 0.5

  // Only draw minor grid when zoomed in enough
  if (showMinorGrid) {
    for (let x = startX; x <= endX; x += minorGridSize) {
      if (Math.abs(x % majorGridSize) > 0.001) {
        lines.push(
          <Line
            key={`minor-v-${x}`}
            points={[x, startY, x, endY]}
            stroke="#DCDCDC"
            strokeWidth={0.5 / scale}
            listening={false}
          />
        )
      }
    }

    for (let y = startY; y <= endY; y += minorGridSize) {
      if (Math.abs(y % majorGridSize) > 0.001) {
        lines.push(
          <Line
            key={`minor-h-${y}`}
            points={[startX, y, endX, y]}
            stroke="#DCDCDC"
            strokeWidth={0.5 / scale}
            listening={false}
          />
        )
      }
    }
  }

  // Major grid lines
  for (let x = startX; x <= endX; x += majorGridSize) {
    lines.push(
      <Line
        key={`major-v-${x}`}
        points={[x, startY, x, endY]}
        stroke="#D0D0D0"
        strokeWidth={1 / scale}
        listening={false}
      />
    )
  }

  for (let y = startY; y <= endY; y += majorGridSize) {
    lines.push(
      <Line
        key={`major-h-${y}`}
        points={[startX, y, endX, y]}
        stroke="#D0D0D0"
        strokeWidth={1 / scale}
        listening={false}
      />
    )
  }

  return lines
}, [showGrid, position.x, position.y, scale, stageWidth, stageHeight])
```

#### 2.4 Debounce Cursor Updates

**Update: `frontend/src/pages/Canvas.tsx`** - Line 416-433
```typescript
import { debounce } from 'lodash-es' // Add lodash-es for tree-shaking

// Create debounced cursor update function
const debouncedCursorUpdate = useMemo(
  () => debounce((x: number, y: number) => {
    wsClient.updateCursor(x, y)
  }, 16), // ~60fps
  []
)

const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  if (!isAuthenticated) return

  const container = containerRef.current
  if (!container) return

  const rect = container.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Use debounced update instead of throttling manually
  debouncedCursorUpdate(x, y)
}, [isAuthenticated, debouncedCursorUpdate])
```

---

### Phase 3: WebSocket Message Optimization

#### 3.1 Reduce Message Payload Size

**Update: `backend/src/ws/handlers.ts`** - Optimize message structure
```typescript
// ❌ BAD - Sends entire object
wsClient.send({
  type: MessageType.OBJECT_UPDATE,
  object: entireObject // 500+ bytes
})

// ✅ GOOD - Send only changes
wsClient.send({
  type: MessageType.OBJECT_UPDATE,
  objectId: id,
  updates: { x, y } // ~50 bytes
})
```

#### 3.2 Batch Object Updates

**Create: `frontend/src/lib/batchUpdates.ts`**
```typescript
export class BatchUpdater {
  private updates: Map<string, Partial<CanvasObject>> = new Map()
  private timer: NodeJS.Timeout | null = null
  private batchDelay = 50 // ms

  add(id: string, updates: Partial<CanvasObject>) {
    // Merge updates for same object
    const existing = this.updates.get(id) || {}
    this.updates.set(id, { ...existing, ...updates })

    // Clear existing timer
    if (this.timer) clearTimeout(this.timer)

    // Set new timer
    this.timer = setTimeout(() => this.flush(), this.batchDelay)
  }

  flush() {
    if (this.updates.size === 0) return

    // Send all batched updates
    wsClient.batchUpdate(Array.from(this.updates.entries()))
    this.updates.clear()
  }
}
```

#### 3.3 Use Binary Protocol (Advanced)

**Optional: Switch from JSON to MessagePack for 30-50% smaller messages**

```bash
npm install msgpackr
```

---

### Phase 4: Asset Optimization

#### 4.1 Enable Vite Build Optimizations

**Update: `frontend/vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'konva-vendor': ['react-konva', 'konva'],
          'firebase-vendor': ['firebase/app', 'firebase/auth']
        }
      }
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-konva', 'konva']
  }
})
```

#### 4.2 Compress Images & Assets

```bash
# Install image optimization
npm install vite-plugin-imagemin -D
```

**Update: `frontend/vite.config.ts`**
```typescript
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: { plugins: [{ name: 'removeViewBox', active: false }] }
    })
  ]
})
```

---

## 📊 Expected Results After Optimization

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Bundle Size** | 805 KB | ~280 KB | -65% |
| **Gzipped Size** | 225 KB | ~90 KB | -60% |
| **Initial Load Time** | ~3s | ~1s | -67% |
| **FPS (100 objects)** | 30 FPS | 60 FPS | +100% |
| **FPS (1000 objects)** | 10 FPS | 50 FPS | +400% |
| **Memory Usage** | 150 MB | 60 MB | -60% |

---

## 🚀 Implementation Priority

### Phase 1 (Immediate - Biggest Impact)
1. ✅ Code splitting (Canvas, Dashboard, AIChat)
2. ✅ Lazy load Konva
3. ✅ Manual chunks in Vite config
4. ✅ Remove console.logs in production

### Phase 2 (High Impact)
1. ✅ Object virtualization (only render visible)
2. ✅ Memoize canvas objects
3. ✅ Reduce grid lines when zoomed out
4. ✅ Debounce cursor updates

### Phase 3 (Medium Impact)
1. ✅ Batch WebSocket updates
2. ✅ Optimize message payloads
3. ✅ Tree-shake Konva imports

### Phase 4 (Polish)
1. ✅ Image compression
2. ✅ Additional chunk splitting
3. ✅ Consider MessagePack

---

## 🧪 Testing Performance

### Measure Bundle Size
```bash
cd frontend
npm run build

# Analyze bundle
npx vite-bundle-visualizer
```

### Measure Runtime Performance
1. Open Chrome DevTools
2. Go to Performance tab
3. Record 10 seconds of canvas interaction
4. Check FPS, memory, render time

### Lighthouse Audit
```bash
npm run build
npm run preview
# Open in Chrome -> DevTools -> Lighthouse -> Run
```

---

## 🎯 Success Criteria

✅ Bundle size < 300 KB (gzipped)
✅ 60 FPS with 500 objects
✅ First paint < 1 second
✅ Memory usage < 80 MB
✅ Lighthouse score > 90

---

## 📚 Resources

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Konva Performance Tips](https://konvajs.org/docs/performance/All_Performance_Tips.html)
- [Web.dev Performance](https://web.dev/performance/)

