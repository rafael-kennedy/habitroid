import fs from 'node:fs';
import path from 'node:path';
import { CARD_DEFINITIONS, type CardDefinition, type TowerVisuals } from '../src/data/cardDefinitions';

// ---- SVG Generation Logic (Adapted from TowerSprite.tsx) ----

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

function generateTowerSvg(visuals: TowerVisuals): string {
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
            // Orb handled as circle tag logic below if needed, but for simplicity let's path it 
            // actually let's just make a circle path approximation for orb to keep it simple in path d string
            // or we can use circle tag in the string. 
            // Let's stick to path d for simplicity of accumulation if possible, but <circle> is fine.
        }
        else p = `M -2 0 L -2 -10 L 2 -10 L 2 0 Z`;

        // Transform logic is tricky in pure string path calc, let's just use group transform in SVG
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

// ---- Migration Logic ----

const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const TOWERS_DIR = path.join(DATA_DIR, 'towers');

if (!fs.existsSync(TOWERS_DIR)) {
    fs.mkdirSync(TOWERS_DIR, { recursive: true });
}

console.log(`Migrating ${CARD_DEFINITIONS.length} towers to ${TOWERS_DIR}...`);

const indexExports: string[] = [];

for (const card of CARD_DEFINITIONS) {
    const towerDir = path.join(TOWERS_DIR, card.id);
    if (!fs.existsSync(towerDir)) {
        fs.mkdirSync(towerDir, { recursive: true });
    }

    // 1. Generate SVG
    const svgContent = generateTowerSvg(card.visuals);
    fs.writeFileSync(path.join(towerDir, 'image.svg'), svgContent);

    // 2. Create Definition File
    // We need to clean up the card object to remove 'visuals' if we want, or keep them for reference?
    // The plan implies using static assets, so 'visuals' might be redundant but maybe good to keep for "DNA".
    // Let's keep 'visuals' for now in case we want to re-generate later or modify.
    // BUT we should add 'visualPath' or similar? 
    // Actually, we can just assume it's always `./image.svg` relative to the file, 
    // or import it in the definition file? 
    // Best practice: Import the svg in the definition file (Vite handles this as a URL)

    // We can't easily json-stringify imports. 
    // So we'll write a .ts file that constructs the object.

    // Helper to print keys
    const printVal = (v: any): string => {
        if (typeof v === 'string') return `'${v}'`;
        if (typeof v === 'object' && v !== null) {
            if (Array.isArray(v)) return `[${v.map(printVal).join(', ')}]`;
            return `{ ${Object.entries(v).map(([k, val]) => `${k}: ${printVal(val)}`).join(', ')} }`;
        }
        return String(v);
    };

    // We need to reconstruct the `cardDef` object literally.
    // We'll just serialize the JSON and then massage it into TS export.
    const cleanCard = { ...card };
    // @ts-ignore
    // delete cleanCard.visuals; // Optional: Keep or delete? Let's KEEP for now, as "source of truth" regarding shape.

    const tsContent = `import type { CardDefinition } from '../../cardDefinitions';
import image from './image.svg';

export const CARD: CardDefinition & { visualPath: string } = {
    ...${JSON.stringify(cleanCard, null, 4)},
    visualPath: image
};
`;

    fs.writeFileSync(path.join(towerDir, 'definition.ts'), tsContent);

    indexExports.push(`export { CARD as ${card.id} } from './${card.id}/definition';`);
}

// 3. Generate Index
const indexContent = `import type { CardDefinition } from '../cardDefinitions';

${indexExports.join('\n')}

export const ALL_TOWERS: (CardDefinition & { visualPath: string })[] = [
    ${CARD_DEFINITIONS.map(c => c.id).join(',\n    ')}
];
`;

fs.writeFileSync(path.join(TOWERS_DIR, 'index.ts'), indexContent);

console.log('Migration complete!');
