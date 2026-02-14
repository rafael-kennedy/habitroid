import fs from 'node:fs';
import path from 'node:path';

// Manual list or derived? We know the IDs.
const ids: string[] = [];
// C01-C20, U01-U20, R01-R20, L01-L10
const types = ['c', 'u', 'r'];
for (const t of types) {
    for (let i = 1; i <= 20; i++) {
        ids.push(`${t}${i.toString().padStart(2, '0')}`);
    }
}
for (let i = 1; i <= 10; i++) {
    ids.push(`l${i.toString().padStart(2, '0')}`);
}

const imports = ids.map(id => `import { CARD as ${id} } from './${id}/definition';`).join('\n');
const exports = `export { ${ids.join(', ')} };`;
const array = `export const ALL_TOWERS = [\n    ${ids.join(',\n    ')}\n];`;

const content = `import type { CardDefinition } from '../cardDefinitions';

${imports}

${exports}

${array}
`;

const dest = path.resolve(process.cwd(), 'src/data/towers/index.ts');
fs.writeFileSync(dest, content);
console.log('Fixed index.ts at', dest);
