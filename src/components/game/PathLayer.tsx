import { memo } from 'react';
import type { EnemyPath } from '../../game/types';

interface Props {
    paths: EnemyPath[];
}

/**
 * Convert a series of waypoints into a smooth SVG cubic Bézier path
 * using Catmull-Rom → cubic Bézier conversion.
 * The curve passes through every original point.
 */
function toSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    if (points.length === 2) {
        return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
    }

    const tension = 0.3; // 0 = sharp, 1 = very loose
    let d = `M${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];

        // Catmull-Rom to cubic Bézier control points
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return d;
}

function PathLayer({ paths }: Props) {
    return (
        <g className="path-layer">
            {paths.map(path => {
                if (path.points.length < 2) return null;
                const d = toSmoothPath(path.points);
                return (
                    <g key={path.id}>
                        <path className="path-glow" d={d} />
                        <path className="path-core" d={d} />
                    </g>
                );
            })}
        </g>
    );
}

export default memo(PathLayer);
