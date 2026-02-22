const fs = require('fs');
const path = require('path');

const DIR = path.resolve('src/data/towers');

// Helper to generate the definition string
function genDef(id, type, name, rarity, cost, primeEff, suppEff, flavor, art, visual) {
    return `import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "${id}",
    "type": "${type}",
    "name": "${name}",
    "rarity": "${rarity}",
    "energyCost": ${cost},
    "primeEffect": ${JSON.stringify(primeEff, null, 8).trim()},
    "supportEffect": ${JSON.stringify(suppEff, null, 8).trim()},
    "artKey": "${id}",
    "flavorText": "${flavor}",
    "visuals": ${JSON.stringify(visual, null, 8).trim()}
},
    visualPath: image
};
`;
}

// Defaults
const defPrime = { damageType: "kinetic", baseDamage: 10, range: 120, fireRate: 1.0, special: "none", specialPower: 0, multishot: 0, knockback: 0, homing: false, targetStrategy: "nearest" };
const defSupp = { damageType: "kinetic", baseDamage: 0, range: 0, fireRate: 0, special: "none", specialPower: 0, multishot: 0, knockback: 0, homing: false, targetStrategy: "nearest" };
const defVis = { baseShape: "square", basePoints: 4, baseScale: 1, baseStrokeWidth: 2, baseRotation: 0, barrelShape: "rect", barrelCount: 1, barrelLength: 15, coreColor: "#fff", accentColor: "#aaa", glowColor: "#0ff" };

const cards = [
    // COMMONS (20)
    // Space Opera Units (1-4)
    { id: 'c01', t: 'unit', n: 'B.O.B. (Bumbling Ordnance Bot)', r: 'common', c: 1, p: { ...defPrime, baseDamage: 5, fireRate: 0.8 }, f: 'Gains +15% Fire Rate for every other Robot you control.', v: { ...defVis, baseShape: 'circle', coreColor: '#888' } },
    { id: 'c02', t: 'unit', n: 'Gloop, The Acidic Janitor', r: 'common', c: 2, p: { ...defPrime, damageType: 'corrosive', baseDamage: 8 }, f: 'Enemies hit take 10% more damage from all sources.', v: { ...defVis, baseShape: 'bouba', coreColor: '#0f0' } },
    { id: 'c03', t: 'unit', n: 'S-7 Sentinel Drone', r: 'common', c: 2, p: { ...defPrime, baseDamage: 12, fireRate: 1.2 }, f: 'Cheap, reliable defense with a small shield.', v: { ...defVis, baseShape: 'hex', coreColor: '#fff', glowColor: '#f00' } },
    { id: 'c04', t: 'unit', n: 'Ensign Ricky', r: 'common', c: 1, p: { ...defPrime, baseDamage: 3 }, f: 'If placed adjacent to the Leader, generates +1 energy passively each wave.', v: { ...defVis, baseShape: 'square', coreColor: '#f00' } },
    // Space Opera Augments (5-8)
    { id: 'c05', t: 'augment', n: 'Duct-Tape Modifications', r: 'common', c: 1, s: { ...defSupp, baseDamage: 15 }, f: '+15 base dmg, 5% chance to misfire (stun itself for 1s).' },
    { id: 'c06', t: 'augment', n: 'Jumper Cables', r: 'common', c: 1, s: { ...defSupp, damageType: 'electric', special: 'chain', specialPower: 1 }, f: 'Gives the unit a weak Chain Lightning effect.' },
    { id: 'c07', t: 'augment', n: 'Recycled Kinetic Rounds', r: 'common', c: 1, s: { ...defSupp, knockback: 20 }, f: 'Adds small knockback to attacks.' },
    { id: 'c08', t: 'augment', n: 'Heavy Plating', r: 'common', c: 1, s: { ...defSupp, baseDamage: 20, range: -10 }, f: '+20 Base Damage, -10 Range.' },
    // Space Opera Actions (9-13)
    { id: 'c09', t: 'action', n: 'Target Override: Strongest', r: 'common', c: 1, p: { ...defPrime, targetStrategy: 'strongest' }, f: 'Unit prioritizes enemy with highest HP. +15% Dmg.' },
    { id: 'c10', t: 'action', n: 'Target Override: Weakest', r: 'common', c: 1, p: { ...defPrime, targetStrategy: 'weakest' }, f: 'Unit prioritizes enemy with lowest HP. +15% Fire Rate.' },
    { id: 'c11', t: 'action', n: 'Target Override: Closest', r: 'common', c: 1, p: { ...defPrime, targetStrategy: 'nearest' }, f: 'Unit prioritizes closest enemy. +10 Range.' },
    { id: 'c12', t: 'action', n: 'Vent the Core!', r: 'common', c: 2, p: { ...defPrime, special: 'aoe', baseDamage: 30, specialPower: 150 }, f: 'Deal 30 AoE damage around the base.' },
    { id: 'c13', t: 'action', n: 'Red Alert', r: 'common', c: 1, p: { ...defPrime, special: 'buff_firerate' }, f: 'All Units gain +20% Fire Rate for 3 seconds.' },
    // Retro Units (14-16)
    { id: 'c14', t: 'unit', n: 'Security Patrol (Yellow Shirt)', r: 'common', c: 1, p: { ...defPrime, baseDamage: 8 }, f: 'If you have 3+ Yellow Shirts, they all gain +10 dmg.' },
    { id: 'c15', t: 'unit', n: 'Expendable Crewman (Red Shirt)', r: 'common', c: 1, p: { ...defPrime, baseDamage: 0 }, f: 'Dies instantly when touched, grants 2 Energy.' },
    { id: 'c16', t: 'unit', n: 'Silver-Plated Android', r: 'common', c: 2, p: { ...defPrime, fireRate: 0.5, special: 'confuse' }, f: 'Fires slow energy rings. Enemies wander back and forth.' },
    // Retro Augments (17-18)
    { id: 'c17', t: 'augment', n: 'Lava Lamp Cartridge', r: 'common', c: 1, s: { ...defSupp, special: 'random_dmg' }, f: 'Damage fluctuates wildly every shot (1-20).' },
    { id: 'c18', t: 'augment', n: 'Tricorder Scan', r: 'common', c: 1, s: { ...defSupp, special: 'pierce_armor' }, f: 'Unit ignores enemy armor entirely.' },
    // Retro Actions (19-20)
    { id: 'c19', t: 'action', n: '"Peace, Man!"', r: 'common', c: 1, p: { ...defPrime, damageType: 'kinetic', baseDamage: -10 }, f: 'Heal base for 10, draw 1 card.' },
    { id: 'c20', t: 'action', n: 'Comm Communicator', r: 'common', c: 0, p: { ...defPrime, special: 'draw_card' }, f: 'Draw 1 card, gain 1 energy.' },

    // UNCOMMONS (20)
    // Space Opera Leader
    { id: 'u01', t: 'leader', n: 'Dr. Zapmore & The Electrosphere', r: 'uncommon', c: 0, p: { ...defPrime }, f: 'Units dealing Electric damage cost 1 less energy. Electric kills give +20% energy.' },
    // Space Opera Units (2-5)
    { id: 'u02', t: 'unit', n: 'Lt. Vex, The Sharpshooter', r: 'uncommon', c: 3, p: { ...defPrime, range: 250, baseDamage: 25, fireRate: 0.3 }, f: 'Deals 2x base damage if she has ZERO Augments attached.' },
    { id: 'u03', t: 'unit', n: 'Xylar, the Plasma-Blower', r: 'uncommon', c: 3, p: { ...defPrime, special: 'bounce', specialPower: 1 }, f: 'Attacks naturally bounce to 1 extra target.' },
    { id: 'u04', t: 'unit', n: 'Dave the Trapper', r: 'uncommon', c: 2, p: { ...defPrime, baseDamage: 0, special: 'aura_slow' }, f: 'Emits an aura that slows all enemies in range by 20%.' },
    { id: 'u05', t: 'unit', n: 'Doc Stitches', r: 'uncommon', c: 3, p: { ...defPrime, baseDamage: 0 }, f: 'Heals the Base for 1 HP every time an Organic unit kills an enemy.' },
    // Space Opera Augments (6-8)
    { id: 'u06', t: 'augment', n: 'Unstable Plasma Cell', r: 'uncommon', c: 2, s: { ...defSupp, baseDamage: 30 }, f: '+30 Damage. When the Unit kills an enemy, small AoE damage.' },
    { id: 'u07', t: 'augment', n: 'Cryo-Grenade Launcher', r: 'uncommon', c: 2, s: { ...defSupp, damageType: 'cold', special: 'aoe_slow' }, f: 'Lobs a grenade that leaves a slowing ice patch.' },
    { id: 'u08', t: 'augment', n: 'Ricochet Prism', r: 'uncommon', c: 3, s: { ...defSupp, special: 'bounce', specialPower: 2 }, f: 'Projectiles bounce to 2 additional targets (half damage).' },
    // Space Opera Actions (9-12)
    { id: 'u09', t: 'action', n: 'Scrap Magnet', r: 'uncommon', c: 1, p: { ...defPrime }, f: 'Draw 2 cards, discard 1.' },
    { id: 'u10', t: 'action', n: 'Caffeinate', r: 'uncommon', c: 0, p: { ...defPrime }, f: 'The next Unit you play this wave costs 1 less.' },
    { id: 'u11', t: 'action', n: 'Warning Shot', r: 'uncommon', c: 1, p: { ...defPrime, special: 'global_knockback' }, f: 'Knocks all enemies on screen back by a small amount.' },
    { id: 'u12', t: 'action', n: 'Temporal Reset', r: 'uncommon', c: 3, p: { ...defPrime, special: 'refresh_cooldowns' }, f: 'Refresh the cooldowns of all units instantly.' },
    // Retro Units (13-16)
    { id: 'u13', t: 'unit', n: 'The Disc-Thrower', r: 'uncommon', c: 3, p: { ...defPrime, special: 'bounce', specialPower: 3 }, f: 'Throws a ricocheting metallic disc. Pierces 3 targets.' },
    { id: 'u14', t: 'unit', n: 'Gorn-Like Bruiser', r: 'uncommon', c: 3, p: { ...defPrime, range: 60, baseDamage: 50, fireRate: 0.5 }, f: 'Short range, very powerful melee hits.' },
    { id: 'u15', t: 'unit', n: 'The Science Officer', r: 'uncommon', c: 3, p: { ...defPrime }, f: 'If it has an Electric augment attached, attacks apply a micro-stun.' },
    { id: 'u16', t: 'unit', n: 'Mind Reader', r: 'uncommon', c: 2, p: { ...defPrime }, f: 'Reveals cloaked enemies in a wide radius.' },
    // Retro Augments (17-18)
    { id: 'u17', t: 'augment', n: 'Energy Suppressor', r: 'uncommon', c: 1, s: { ...defSupp }, f: 'Attacks dont wake sleeping enemies or trigger on-hit abilities.' },
    { id: 'u18', t: 'augment', n: 'Phaser Converter', r: 'uncommon', c: 2, s: { ...defSupp, damageType: 'thermal' }, f: 'Damage becomes Thermal, attacks leave a stacking burn DoT.' },
    // Retro Actions (19-20)
    { id: 'u19', t: 'action', n: 'Smoke Screen', r: 'uncommon', c: 2, p: { ...defPrime }, f: 'Enemies passing through zone are slowed 50% & lose armor.' },
    { id: 'u20', t: 'action', n: 'Shaken, Not Stirred', r: 'uncommon', c: 3, p: { ...defPrime }, f: 'Randomize all enemies current HP.' },

    // RARES (20)
    // Space Opera Units (1-5)
    { id: 'r01', t: 'unit', n: 'Z-9000 Eradicator', r: 'rare', c: 5, p: { ...defPrime, baseDamage: 40, fireRate: 2 }, f: 'If it has Thermal augment, permanently melts enemy armor.' },
    { id: 'r02', t: 'unit', n: 'Gorgon The Unflinching', r: 'rare', c: 4, p: { ...defPrime, knockback: 30 }, f: 'Deals 3x damage to enemies that were recently knocked back.' },
    { id: 'r03', t: 'unit', n: 'Chief Engineer Sparky', r: 'rare', c: 3, p: { ...defPrime }, f: 'When played, you can move any number of Augments onto Sparky.' },
    { id: 'r04', t: 'unit', n: 'The Diplomat', r: 'rare', c: 4, p: { ...defPrime, baseDamage: 0 }, f: 'Aura: Enemies lose all armor and special traits.' },
    { id: 'r05', t: 'unit', n: 'Junk-Bot Harvester', r: 'rare', c: 2, p: { ...defPrime, baseDamage: 5 }, f: '20% chance to generate 1 energy when it kills an enemy.' },
    // Space Opera Augments (6-9)
    { id: 'r06', t: 'augment', n: 'Symbiotic Brain-Slug', r: 'rare', c: 3, s: { ...defSupp, homing: true }, f: 'Gives Homing. If Unit is alien, also gives +20 Damage.' },
    { id: 'r07', t: 'augment', n: 'Void-Matter Injector', r: 'rare', c: 4, s: { ...defSupp, damageType: 'void' }, f: 'Changes dmg to Void. Instantly eradicates non-bosses under 20% HP.' },
    { id: 'r08', t: 'augment', n: 'Assimilation Matrix', r: 'rare', c: 4, s: { ...defSupp }, f: 'When Unit kills an enemy, gains a permanent +1 damage.' },
    { id: 'r09', t: 'augment', n: 'Gravity Well Generator', r: 'rare', c: 3, s: { ...defSupp, knockback: 10 }, f: 'Enemies hit are pulled slightly backwards along the path.' },
    // Space Opera Actions (10-12)
    { id: 'r10', t: 'action', n: 'Over-Volting', r: 'rare', c: 2, p: { ...defPrime }, f: 'Unit gains +100% Fire Rate for this wave, disabled next wave.' },
    { id: 'r11', t: 'action', n: 'EMP Blast', r: 'rare', c: 3, p: { ...defPrime, special: 'stun', specialPower: 5 }, f: 'Stun all robotic enemies for 5s and remove shields.' },
    { id: 'r12', t: 'action', n: 'Jury-Rig', r: 'rare', c: 2, p: { ...defPrime }, f: 'Return a random Augment from discard pile to your hand.' },
    // Retro Leader (13)
    { id: 'r13', t: 'leader', n: 'The Spire of Observation', r: 'rare', c: 0, p: { ...defPrime }, f: 'All Units globally gain +15 Range and pierce 1 additional time.' },
    // Retro Units (14-16)
    { id: 'r14', t: 'unit', n: 'Mad Scientist Bob', r: 'rare', c: 4, p: { ...defPrime }, f: 'Periodically spawns a Mini-Clone in an adjacent free zone.' },
    { id: 'r15', t: 'unit', n: 'Retro-Tech Quartermaster', r: 'rare', c: 4, p: { ...defPrime }, f: 'While on board, all your Augments cost 1 less energy.' },
    { id: 'r16', t: 'unit', n: 'The Captains Chair', r: 'rare', c: 4, p: { ...defPrime, baseDamage: 0 }, f: 'Provides a massive aura of fire-rate to adjacent units.' },
    // Retro Augments (17-18)
    { id: 'r17', t: 'augment', n: 'Gold-Plated Blaster', r: 'rare', c: 4, s: { ...defSupp }, f: 'Enemies killed yield 2x Score/Energy, Unit fires 50% slower.' },
    { id: 'r18', t: 'augment', n: 'Transporter Buffer', r: 'rare', c: 3, s: { ...defSupp }, f: '10% chance on hit to teleport enemy slightly backwards.' },
    // Retro Actions (19-20)
    { id: 'r19', t: 'action', n: 'Mind Meld', r: 'rare', c: 2, p: { ...defPrime }, f: 'Copy all augments from one unit to another for this wave.' },
    { id: 'r20', t: 'action', n: 'Trap Door', r: 'rare', c: 3, p: { ...defPrime }, f: 'Drop highest HP enemy out of dimension (Not bosses).' },
    { id: 'r21', t: 'action', n: 'Reverse Polarity', r: 'rare', c: 4, p: { ...defPrime }, f: 'All enemies move backward along their path for 3 seconds.' },

    // LEGENDARIES (10)
    // Space Opera Leaders (1-2)
    { id: 'l01', t: 'leader', n: 'The Lucky Centipede & Capt. OMalley', r: 'legendary', c: 0, p: { ...defPrime }, f: 'Every 10 kills drops a random 1-cost Augment into deck/hand.' },
    { id: 'l02', t: 'leader', n: 'The Bio-Sphere & The Overmind', r: 'legendary', c: 0, p: { ...defPrime }, f: 'Base HP resets to 1, gains +1 Max HP for every kill each wave.' },
    // Space Opera Units (3-4)
    { id: 'l03', t: 'unit', n: 'Omicron, The Final Arbiter', r: 'legendary', c: 8, p: { ...defPrime, baseDamage: 100, special: 'aoe', specialPower: 80 }, f: 'If he has 3+ Augments, attacks stun everything in a huge radius.' },
    { id: 'l04', t: 'unit', n: 'Captain Blasters Jackson', r: 'legendary', c: 6, p: { ...defPrime, fireRate: 2 }, f: 'For every Action card played while here, permanently gains +5% Fire Rate.' },
    // Space Opera Augment (5)
    { id: 'l05', t: 'augment', n: 'Sentient Singularity Core', r: 'legendary', c: 6, s: { ...defSupp, baseDamage: 80 }, f: 'Immense damage, randomly unequips & leaps to a different Unit every wave.' },
    // Space Opera Action (6)
    { id: 'l06', t: 'action', n: 'Orbital Beam Strike', r: 'legendary', c: 6, p: { ...defPrime, special: 'aoe', baseDamage: 200, specialPower: 120 }, f: 'Obliterate enemies in a zone. Scorch mark damages walkers for 10s.' },
    // Retro Leader (7)
    { id: 'l07', t: 'leader', n: 'The Chromed Cruiser & Agent X', r: 'legendary', c: 0, p: { ...defPrime }, f: 'Your first Action card played each wave is cast twice.' },
    // Retro Unit (8)
    { id: 'l08', t: 'unit', n: 'The Psychedelic Goliath', r: 'legendary', c: 7, p: { ...defPrime, fireRate: 5 }, f: 'Fires blinding lasers 360deg. Hypnotizes enemies to walk backward.' },
    // Retro Augment (9)
    { id: 'l09', t: 'augment', n: 'The Doomsday Switch', r: 'legendary', c: 4, s: { ...defSupp }, f: 'If attached Unit reaches 100 kills, instantly win the current wave.' },
    // Retro Action (10)
    { id: 'l10', t: 'action', n: 'Monologue Delay', r: 'legendary', c: 7, p: { ...defPrime }, f: 'Stuns all bosses permanently until attacked. You gain +2 Energy.' }
];

// NOTE: I made a slight error above, I made 21 Rares so it's 71 total. I will pop the 21st Rare to fix exactly 70.
const rare21Index = cards.findIndex(c => c.id === 'r21');
if (rare21Index >= 0) {
    cards.splice(rare21Index, 1);
}

cards.forEach(c => {
    // Merge basic supp info if it's an augment
    let supp = { ...defSupp };
    if (c.t === 'augment' && c.s) {
        supp = { ...defSupp, ...c.s };
    }

    // Default visual
    let visu = { ...defVis };
    if (c.v) {
        visu = { ...defVis, ...c.v };
    }

    const content = genDef(c.id, c.t, c.n, c.r, c.c, c.p || defPrime, supp, c.f, c.id, visu);

    const targetDir = path.join(DIR, c.id);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, 'definition.ts'), content);
});

console.log("Generated " + cards.length + " cards successfully.");
