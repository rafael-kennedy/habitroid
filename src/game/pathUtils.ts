// ---- Catmull-Rom Path Utilities ----
// Shared between SVG renderer (PathLayer) and engine (moveEnemies).
// Samples the Catmull-Rom spline into dense polyline segments so the engine
// can interpolate along the *same* smooth curve that gets rendered visually.

export interface Vec2 { x: number; y: number }

const TENSION = 0.3;           // Must match PathLayer.tsx
const SAMPLES_PER_SEGMENT = 20; // 20 samples per original pair of waypoints

// Cache — keyed by a stable string derived from the point array
const cache = new Map<string, Vec2[]>();

function cacheKey(points: Vec2[]): string {
    return points.map(p => `${p.x},${p.y}`).join('|');
}

/**
 * Evaluate a cubic Bézier at parameter t ∈ [0,1].
 */
function bezier(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    return {
        x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
        y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    };
}

/**
 * Convert an array of waypoints into a densely-sampled polyline
 * following the same Catmull-Rom → cubic Bézier curve used by PathLayer.
 * Results are cached per unique point set.
 */
export function sampleSmoothPath(points: Vec2[]): Vec2[] {
    if (points.length < 3) return points;

    const key = cacheKey(points);
    const hit = cache.get(key);
    if (hit) return hit;

    const result: Vec2[] = [{ ...points[0] }];

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];

        // Catmull-Rom → cubic Bézier control points (same formula as PathLayer)
        const cp1: Vec2 = {
            x: p1.x + (p2.x - p0.x) * TENSION,
            y: p1.y + (p2.y - p0.y) * TENSION,
        };
        const cp2: Vec2 = {
            x: p2.x - (p3.x - p1.x) * TENSION,
            y: p2.y - (p3.y - p1.y) * TENSION,
        };

        for (let j = 1; j <= SAMPLES_PER_SEGMENT; j++) {
            const t = j / SAMPLES_PER_SEGMENT;
            result.push(bezier(p1, cp1, cp2, p2, t));
        }
    }

    cache.set(key, result);
    return result;
}
