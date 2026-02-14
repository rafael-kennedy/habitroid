export interface UpgradeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    maxLevel: number;
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
        maxLevel: 5,
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
        maxLevel: 3,
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
        maxLevel: 5,
        baseCost: 1000,
        costScaling: 'linear',
        costFactor: 1000,
        effectDescription: (level) => `+${level * 5}% Coin Gain`
    }
];

export function getUpgradeCost(def: UpgradeDefinition, currentLevel: number): number {
    if (currentLevel >= def.maxLevel) return 0;

    if (def.costScaling === 'linear') {
        return def.baseCost + (def.costFactor * currentLevel);
    } else {
        return Math.floor(def.baseCost * Math.pow(def.costFactor, currentLevel));
    }
}
