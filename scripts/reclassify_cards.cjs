const fs = require('fs');
const path = require('path');

const DIR = path.resolve('src/data/towers');

// We will arbitrarily assign the first few cards to be Leaders, some to be Actions, and some to be Augments
// to test the system.

const LEADER_IDS = ['l10', 'l09']; // Legendary 10 and 9 are Leaders
const ACTION_IDS = ['c01', 'u01', 'r01', 'l01']; // Make one of each rarity an Action
const AUGMENT_IDS = ['c02', 'c03', 'u02', 'u03', 'r02', 'r03', 'l02', 'l03']; // A handful of augments

for (const dir of fs.readdirSync(DIR)) {
    if (dir === 'index.ts' || dir.startsWith('.')) continue;

    const p = path.join(DIR, dir, 'definition.ts');
    if (fs.existsSync(p)) {
        let text = fs.readFileSync(p, 'utf8');

        // Determine new type
        let newType = 'unit';
        if (LEADER_IDS.includes(dir)) newType = 'leader';
        if (ACTION_IDS.includes(dir)) newType = 'action';
        if (AUGMENT_IDS.includes(dir)) newType = 'augment';

        // Replace the existing "type": "unit" line
        text = text.replace(/"type":\s*"[^"]+",/, `"type": "${newType}",`);

        fs.writeFileSync(p, text);
    }
}

console.log("Card Type reclassification complete.");
