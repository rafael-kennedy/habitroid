import type { Rarity } from './cardDefinitions';

export interface BoosterPack {
    id: string;
    name: string;
    description: string;
    cost: number;        // coins
    cardCount: number;   // cards per pack
    rarityWeights: Record<Rarity, number>; // percentage weights (must sum to 100)
    artKey: string;
}

export const BOOSTER_PACKS: BoosterPack[] = [
    {
        id: 'pack-basic',
        name: 'Standard Issue',
        description: 'A basic pack of defenses. Mostly common, but you never know.',
        cost: 50,
        cardCount: 5,
        rarityWeights: { common: 70, uncommon: 22, rare: 7, legendary: 1 },
        artKey: 'pack-basic',
    },
    {
        id: 'pack-advanced',
        name: 'Advanced Ordnance',
        description: 'Higher-grade hardware. Better odds for rare modules.',
        cost: 120,
        cardCount: 5,
        rarityWeights: { common: 40, uncommon: 35, rare: 20, legendary: 5 },
        artKey: 'pack-advanced',
    },
    {
        id: 'pack-elite',
        name: 'Elite Arsenal',
        description: 'Top-shelf destructive potential. Legendary modules within reach.',
        cost: 250,
        cardCount: 5,
        rarityWeights: { common: 15, uncommon: 30, rare: 40, legendary: 15 },
        artKey: 'pack-elite',
    },
    {
        id: 'pack-single',
        name: 'Quick Draw',
        description: 'One card. One chance. Cheap and cheerful.',
        cost: 25,
        cardCount: 1,
        rarityWeights: { common: 60, uncommon: 25, rare: 12, legendary: 3 },
        artKey: 'pack-single',
    },
    {
        id: 'pack-mega',
        name: 'Mega Cache',
        description: 'A massive shipment. Ten modules with guaranteed quality.',
        cost: 400,
        cardCount: 10,
        rarityWeights: { common: 25, uncommon: 35, rare: 30, legendary: 10 },
        artKey: 'pack-mega',
    },
];
