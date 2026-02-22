export interface UpgradeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    baseCost: number;
    costScaling: 'linear' | 'exponential';
    costFactor: number; // For linear: cost + factor * level. For exponential: cost * (factor ^ level)
    effectDescription: (level: number) => string;
}

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
    {
        id: 'hull_plating',
        name: 'Nanoweave Hull',
        description: 'Reinforced plating increases your base HP.',
        icon: 'shield',
        baseCost: 500,
        costScaling: 'exponential',
        costFactor: 1.5,
        effectDescription: (level) => `+${level * 5} Max HP`
    },
    {
        id: 'reactor_core',
        name: 'Antimatter Reactor',
        description: 'Advanced power systems provide more starting energy.',
        icon: 'bolt',
        baseCost: 2000,
        costScaling: 'exponential',
        costFactor: 2.0,
        effectDescription: (level) => `+${level} Starting Energy`
    },
    {
        id: 'scavenger_protocol',
        name: 'Scavenger Protocol',
        description: 'Optimized algorithms extract more value from defeated enemies.',
        icon: 'coin',
        baseCost: 1000,
        costScaling: 'exponential',
        costFactor: 1.5,
        effectDescription: (level) => `+${level * 5}% Coin Gain`
    },
    {
        id: 'system_cache',
        name: 'System Cache',
        description: 'Expanded memory allows for more cards in your opening hand.',
        icon: 'layers', // Assuming 'layers' or similar exists, fallback to 'card' logic if needed but using generic names
        baseCost: 1500,
        costScaling: 'exponential',
        costFactor: 1.8,
        effectDescription: (level) => `+${level} Starting Cards`
    },
    {
        id: 'heat_sink',
        name: 'Heat Sink',
        description: 'Improved thermal management accelerates energy regeneration.',
        icon: 'zap',
        baseCost: 1200,
        costScaling: 'exponential',
        costFactor: 1.6,
        effectDescription: (level) => `+${level} Energy Regen`
    },
    {
        id: 'hardened_shields',
        name: 'Hardened Shields',
        description: 'Start each combat with a layer of protection.',
        icon: 'shield-check',
        baseCost: 800,
        costScaling: 'exponential',
        costFactor: 1.4,
        effectDescription: (level) => `Start with ${level * 3} Block`
    },
    {
        id: 'auto_repair',
        name: 'Auto-Repair',
        description: 'Nanobots repair hull damage after every battle.',
        icon: 'heart',
        baseCost: 1000,
        costScaling: 'exponential',
        costFactor: 1.5,
        effectDescription: (level) => `Heal ${level * 2} HP after battle`
    },
    {
        id: 'data_mining',
        name: 'Data Mining',
        description: 'Advanced heuristics locate more card data packages.',
        icon: 'database',
        baseCost: 1500,
        costScaling: 'exponential',
        costFactor: 1.7,
        effectDescription: (level) => `+${level * 2}% Card Drop Chance`
    },
    {
        id: 'quantum_processing',
        name: 'Quantum Processing',
        description: 'Complex calculations reveal higher rarity signals.',
        icon: 'star',
        baseCost: 2500,
        costScaling: 'exponential',
        costFactor: 2.2,
        effectDescription: (level) => `+${level}% Rare Card Chance`
    },
    {
        id: 'kinetic_battery',
        name: 'Kinetic Battery',
        description: 'Converts impact force into usable energy.',
        icon: 'activity',
        baseCost: 1800,
        costScaling: 'exponential',
        costFactor: 1.9,
        effectDescription: (level) => `${level * 5}% chance to gain Energy when hit`
    },
    {
        id: 'nano_swarm',
        name: 'Nano-Swarm',
        description: 'Aggressive nanites strip enemy defenses at combat start.',
        icon: 'crosshair',
        baseCost: 1200,
        costScaling: 'exponential',
        costFactor: 1.6,
        effectDescription: (level) => `Deal ${level * 3} damage to all enemies at start`
    },
    {
        id: 'initiative_overdrive',
        name: 'Initiative Overdrive',
        description: 'Overclocked sensory inputs allow for faster reaction times.',
        icon: 'fast-forward',
        baseCost: 2000,
        costScaling: 'exponential',
        costFactor: 2.0,
        effectDescription: (level) => `+${level} Initiative`
    },
    {
        id: 'backup_drive',
        name: 'Backup Drive',
        description: 'Redundant storage systems prevent data loss.',
        icon: 'save',
        baseCost: 1500,
        costScaling: 'exponential',
        costFactor: 1.8,
        effectDescription: (level) => `${level * 10}% chance to retain a card`
    }
];

export function getUpgradeCost(def: UpgradeDefinition, currentLevel: number): number {
    if (def.costScaling === 'linear') {
        return def.baseCost + (def.costFactor * currentLevel);
    } else {
        return Math.floor(def.baseCost * Math.pow(def.costFactor, currentLevel));
    }
}
