const fs = require('fs');
const path = require('path');

const cardsDir = path.resolve('src/data/cards');
const types = ['action', 'augment', 'leader', 'unit'];

types.forEach(type => {
    const typeDir = path.join(cardsDir, type);
    if (!fs.existsSync(typeDir)) return;

    const cards = fs.readdirSync(typeDir);
    cards.forEach(card => {
        const fullPath = path.join(typeDir, card, 'definition.ts');
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/..\/..\/cardDefinitions/g, '../../../cardDefinitions');
            fs.writeFileSync(fullPath, content);
        }
    });
});
console.log("Fixed import paths in all definitions.");
