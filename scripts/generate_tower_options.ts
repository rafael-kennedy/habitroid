import fs from 'node:fs';
import path from 'node:path';
import { generateTowerSvg, type TowerVisuals } from './tower_utils';

const OUT_DIR = path.resolve(process.cwd(), 'tower_drafts');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0000', '#ffffff'];
const shapes = ['circle', 'square', 'hex', 'diamond', 'chevron', 'star', 'spiky'] as const;
const barrels = ['rect', 'tapered', 'tri', 'orb', 'tesla'] as const;

function random<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

console.log(`Generating 5 tower drafts in ${OUT_DIR}...`);

for (let i = 1; i <= 5; i++) {
    const visuals: TowerVisuals = {
        baseShape: random(shapes),
        coreColor: random(colors),
        accentColor: random(colors),
        glowColor: random(colors),
        barrelShape: random(barrels),
        barrelCount: Math.floor(Math.random() * 3) + 1,
        barrelLength: 10 + Math.random() * 10,
        baseScale: 0.8 + Math.random() * 0.4,
        baseRotation: Math.floor(Math.random() * 360),
        baseStrokeWidth: 1 + Math.random() * 2,
        basePoints: 3 + Math.floor(Math.random() * 5)
    };

    const svg = generateTowerSvg(visuals);
    const filename = `draft_${i}.svg`;
    fs.writeFileSync(path.join(OUT_DIR, filename), svg);
    console.log(`Generated ${filename}`);
}

console.log('Done.');
