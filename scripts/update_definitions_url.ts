import fs from 'node:fs';
import path from 'node:path';

const TOWERS_DIR = path.resolve(process.cwd(), 'src/data/towers');

if (!fs.existsSync(TOWERS_DIR)) {
    console.error('Towers directory not found at', TOWERS_DIR);
    process.exit(1);
}

const towers = fs.readdirSync(TOWERS_DIR).filter(d => fs.statSync(path.join(TOWERS_DIR, d)).isDirectory());

console.log(`Updating ${towers.length} tower definitions...`);

for (const id of towers) {
    const defPath = path.join(TOWERS_DIR, id, 'definition.ts');
    if (!fs.existsSync(defPath)) continue;

    let content = fs.readFileSync(defPath, 'utf8');

    // Replace import with const URL
    if (content.includes("import image from './image.svg';")) {
        content = content.replace(
            "import image from './image.svg';",
            "const image = new URL('./image.svg', import.meta.url).href;"
        );
        fs.writeFileSync(defPath, content);
    }
}

console.log('Update complete.');
