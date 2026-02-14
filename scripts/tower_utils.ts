export type TowerVisuals = {
    baseShape?: 'circle' | 'square' | 'hex' | 'diamond' | 'chevron' | 'star' | 'crescent' | 'spiky' | 'bouba';
    baseColor?: string;
    coreColor?: string;
    accentColor?: string;
    glowColor?: string;
    barrelShape?: 'rect' | 'tapered' | 'tri' | 'multi' | 'orb' | 'tesla';
    barrelCount?: number;
    barrelLength?: number;
    baseScale?: number;
    baseRotation?: number;
    baseStrokeWidth?: number;
    basePoints?: number; // for star/poly
};

function getShapePath(visuals: TowerVisuals): string {
    const { baseShape, basePoints } = visuals;
    const r = 10;

    if (baseShape === 'circle') return `M ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0`;
    if (baseShape === 'square') return `M ${-r} ${-r} L ${r} ${-r} L ${r} ${r} L ${-r} ${r} Z`;
    if (baseShape === 'hex') {
        return Array.from({ length: 6 }, (_, i) => {
            const a = i * Math.PI / 3;
            return `${Math.cos(a) * r},${Math.sin(a) * r}`;
        }).map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p).join(' ') + ' Z';
    }
    if (baseShape === 'diamond') return `M 0 ${-r * 1.2} L ${r * 0.8} 0 L 0 ${r * 1.2} L ${-r * 0.8} 0 Z`;
    if (baseShape === 'chevron') return `M ${-r} ${r} L 0 ${-r} L ${r} ${r} L 0 ${r * 0.5} Z`;
    if (baseShape === 'crescent') return `M ${r} 0 A ${r} ${r} 0 1 1 ${-r * 0.5} ${-r * 0.8} Q 0 0 ${-r * 0.5} ${r * 0.8} A ${r} ${r} 0 0 1 ${r} 0`;

    // Procedural Polygon/Star/Bouba
    const points: string[] = [];
    const step = (Math.PI * 2) / (basePoints || 3);

    for (let i = 0; i < (basePoints || 3) * 2; i++) {
        const a = i * step / 2;
        let rad = r;
        if (i % 2 !== 0) {
            if (baseShape === 'star') rad = r * 0.5;
            if (baseShape === 'spiky') rad = r * 0.3; // Sharper
            if (baseShape === 'bouba') rad = r * 0.8; // Smoother
        }
        if (isNaN(rad)) rad = r;
        points.push(`${Math.cos(a) * rad} ${Math.sin(a) * rad}`);
    }

    if (baseShape === 'bouba') {
        // Curve through points
        return `M ${points[0]} ` + points.map((p) => {
            return `L ${p}`;
        }).join(' ') + ' Z';
    }

    return `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ') + ' Z';
}

export function generateTowerSvg(visuals: TowerVisuals): string {
    const {
        barrelShape, barrelCount, barrelLength, coreColor, accentColor, glowColor,
        baseScale, baseRotation, baseStrokeWidth, baseShape
    } = visuals;

    const barrelPaths: string[] = [];
    const barrelCountVal = barrelCount || 1;
    const barrelLengthVal = barrelLength || 12;

    for (let i = 0; i < barrelCountVal; i++) {
        const offset = (i - (barrelCountVal - 1) / 2) * 6;
        let p = '';
        if (barrelShape === 'rect') p = `M -2 0 L -2 -${barrelLengthVal} L 2 -${barrelLengthVal} L 2 0 Z`;
        else if (barrelShape === 'tapered') p = `M -3 0 L -1 -${barrelLengthVal} L 1 -${barrelLengthVal} L 3 0 Z`;
        else if (barrelShape === 'tri') p = `M -4 0 L 0 -${barrelLengthVal} L 4 0 Z`;
        else if (barrelShape === 'multi') p = `M -1.5 0 L -1.5 -${barrelLengthVal} L 1.5 -${barrelLengthVal} L 1.5 0 Z`;
        else if (barrelShape === 'orb') {
            // handled via circle element usually
        }
        else p = `M -2 0 L -2 -10 L 2 -10 L 2 0 Z`;

        const transform = `translate(${offset}, 0)`;

        let el = '';
        if (barrelShape === 'orb') {
            el = `<circle cx="${offset}" cy="${-(barrelLengthVal) / 2}" r="3" fill="${coreColor}" />`;
        } else {
            el = `<path d="${p}" fill="${coreColor}" transform="${transform}" />`;
        }
        barrelPaths.push(el);
    }

    const baseD = getShapePath(visuals);
    const strokeJoin = baseShape === 'bouba' ? 'round' : 'miter';
    const strokeCap = baseShape === 'bouba' ? 'round' : 'butt';

    return `<svg width="64" height="64" viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg">
  <!-- Glow -->
  <circle cx="0" cy="0" r="${16 * (baseScale || 1)}" fill="${glowColor || 'cyan'}" opacity="0.4" filter="blur(4px)" />

  <!-- Base -->
  <g transform="scale(${baseScale || 1}) rotate(${baseRotation || 0})">
    <path d="${baseD}" fill="#111" stroke="${coreColor || '#fff'}" stroke-width="${baseStrokeWidth || 2}" stroke-linejoin="${strokeJoin}" stroke-linecap="${strokeCap}" />
    <path d="${baseD}" fill="none" stroke="${accentColor || '#fff'}" stroke-width="1" transform="scale(0.6)" opacity="0.7" />
  </g>

  <!-- Barrels (Point Up) -->
  <g transform="rotate(0)"> 
     ${barrelPaths.join('\n     ')}
  </g>
</svg>`;
}
