const fs = require('fs');
const path = require('path');

const cardsDir = path.resolve('src/data/cards');

const types = ['action', 'augment', 'leader', 'unit'];
let imports = [];
let exportsList = [];

types.forEach(type => {
    const typeDir = path.join(cardsDir, type);
    if (!fs.existsSync(typeDir)) return;

    const cards = fs.readdirSync(typeDir);
    cards.forEach(card => {
        if (!fs.statSync(path.join(typeDir, card)).isDirectory()) return;
        const varName = card.toUpperCase();
        imports.push(`import { CARD as ${varName} } from './${type}/${card}/definition';`);
        exportsList.push(varName);
    });
});

const content = `// Auto-generated index
${imports.join('\n')}

export const CARD_DEFINITIONS = [
    ${exportsList.join(',\n    ')}
];
`;

fs.writeFileSync(path.join(cardsDir, 'index.ts'), content);
console.log('Regenerated src/data/cards/index.ts');
