import { ALL_TOWERS } from '../src/data/towers/index';

console.log(`Analyzing ${ALL_TOWERS.length} towers...`);

const SCORES: { id: string, name: string, score: number, dps: number }[] = [];

for (const tower of ALL_TOWERS) {
    const { primeEffect, energyCost } = tower;
    const dps = (primeEffect.baseDamage || 0) * (primeEffect.fireRate || 1) * (1 + (primeEffect.multishot || 0) * 0.5); // Crude approximation
    const rangeScore = (primeEffect.range || 100) / 100;

    let specialScore = 1;
    if (primeEffect.special !== 'none') specialScore = 1.2;
    if (primeEffect.specialPower > 10) specialScore += 0.1;

    // Cost efficiency: higher is better? No, simpler: Value = DPS * Range * Utility
    // Then compare Value / Cost.

    // Normalized Value
    const value = dps * rangeScore * specialScore;
    const score = value / (energyCost || 1); // Efficiency

    SCORES.push({
        id: tower.id,
        name: tower.name,
        score,
        dps
    });
}

// Stats
const avgScore = SCORES.reduce((a, b) => a + b.score, 0) / SCORES.length;
const sorted = [...SCORES].sort((a, b) => b.score - a.score);

console.log(`Average Efficiency Score: ${avgScore.toFixed(2)}`);
console.log('\n--- Top 5 (Overpowered?) ---');
sorted.slice(0, 5).forEach(t => console.log(`${t.id} ${t.name}: ${t.score.toFixed(2)} (DPS: ${t.dps.toFixed(1)})`));

console.log('\n--- Bottom 5 (Underpowered?) ---');
sorted.slice(-5).reverse().forEach(t => console.log(`${t.id} ${t.name}: ${t.score.toFixed(2)} (DPS: ${t.dps.toFixed(1)})`));

console.log('\nDone.');
