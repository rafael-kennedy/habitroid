import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u16",
    "name": "Toxin Sprayer",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 7,
        "range": 120,
        "fireRate": 1.5,
        "special": "slow",
        "specialPower": 20,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.2,
        "special": "slow",
        "specialPower": 10,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "toxin-sprayer",
    "flavorText": "A fine mist of misery.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 3,
        "baseScale": 1.0075,
        "baseStrokeWidth": 4.7,
        "baseRotation": 90,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.5,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
