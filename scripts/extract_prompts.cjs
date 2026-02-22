const fs = require('fs');
const path = require('path');

const mdPath = path.resolve('/Users/rafaelkennedy/.gemini/antigravity/brain/d0a08953-7882-4c5c-8715-4ab91eec3dbe/card_expansion_design.md');
const md = fs.readFileSync(mdPath, 'utf8');

const lines = md.split('\n');
const cards = [];
for (const line of lines) {
    if (line.trim().startsWith('|') && !line.includes('Name | Rarity') && !line.includes(':---')) {
        const parts = line.split('|').map(s => s.trim()).filter(s => s !== '');
        if (parts.length >= 3) {
            let name = parts[0].replace(/\*\*/g, '').replace(/'/g, '').replace(/"/g, '').trim();
            let artPrompt = parts[parts.length - 1];
            cards.push({ name, artPrompt });
        }
    }
}

const cardsDir = path.resolve('src/data/cards');
const types = ['action', 'augment', 'leader', 'unit'];
const results = [];

types.forEach(type => {
    if (!fs.existsSync(path.join(cardsDir, type))) return;
    const items = fs.readdirSync(path.join(cardsDir, type));
    items.forEach(item => {
        const defPath = path.join(cardsDir, type, item, 'definition.ts');
        if (fs.existsSync(defPath)) {
            const content = fs.readFileSync(defPath, 'utf8');
            const nameMatch = content.match(/"name":\s*"([^"]+)"/);
            if (nameMatch) {
                let name = nameMatch[1].replace(/'/g, '').replace(/"/g, '');
                let designCard = cards.find(c => c.name === name || c.name.includes(name) || name.includes(c.name));

                // Fallbacks for tricky names
                if (!designCard) {
                    if (name.includes('Mind Reader')) designCard = cards.find(c => c.name.includes('Mind Meld'));
                    if (name.includes('Stitches')) designCard = cards.find(c => c.name.includes('Stitches'));
                    if (name.includes('Diplomat')) designCard = cards.find(c => c.name.includes('Diplomat'));
                }

                if (designCard) {
                    if (item !== 'u01') {
                        results.push({ id: item, name, type, prompt: designCard.artPrompt });
                    }
                } else {
                    console.log("Still no prompt for:", name);
                }
            }
        }
    });
});

let toolcalls = "";
results.forEach(r => {
    const prompt = `pixel art, commander keen style, fun zany saturday morning cartoon style, no text, no words, no letters, no speech bubbles, ${r.prompt.replace(/"/g, "'")}`;
    const escapedName = `${r.type}_${r.id}`.replace(/ /g, '_').toLowerCase();
    toolcalls += `call:default_api:generate_image{ImageName:"${escapedName}",Prompt:"${prompt}"}\n`;
});

fs.writeFileSync('tool_calls.txt', toolcalls);
console.log(`Generated ${results.length} tool calls into tool_calls.txt`);
