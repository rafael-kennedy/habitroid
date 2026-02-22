const fs = require('fs');
const path = require('path');

const DIR = path.resolve('src/data/towers');
for (const dir of fs.readdirSync(DIR)) {
    if (dir === 'index.ts') continue;
    const p = path.join(DIR, dir, 'definition.ts');
    if (fs.existsSync(p)) {
        let text = fs.readFileSync(p, 'utf8');
        if (!text.includes('"type"')) {
            text = text.replace(/"id": "([^"]+)",/, '"id": "$1",\n    "type": "unit",');
            fs.writeFileSync(p, text);
        }
    }
}
console.log("Migration finished.");
