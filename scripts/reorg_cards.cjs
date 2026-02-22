const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('src/data/towers');
const targetDir = path.resolve('src/data/cards');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const dirs = fs.readdirSync(srcDir);
dirs.forEach(d => {
    const fullDir = path.join(srcDir, d);
    if (!fs.statSync(fullDir).isDirectory()) return;
    const defPath = path.join(fullDir, 'definition.ts');
    if (fs.existsSync(defPath)) {
        const content = fs.readFileSync(defPath, 'utf8');
        const match = content.match(/"type":\s*"([^"]+)"/);
        if (match) {
            const type = match[1];
            const typeDir = path.join(targetDir, type);
            if (!fs.existsSync(typeDir)) {
                fs.mkdirSync(typeDir, { recursive: true });
            }
            fs.renameSync(fullDir, path.join(typeDir, d));
        }
    }
});
fs.rmSync(srcDir, { recursive: true, force: true });
console.log("Moved cards and deleted tokens.");
