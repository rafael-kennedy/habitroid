import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u10",
    "name": "Solar Lens",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 13,
        "range": 150,
        "fireRate": 1,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 5,
        "range": 20,
        "fireRate": 0.1,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "solar-lens",
    "flavorText": "Focused sunlight. Deadly.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 7,
        "baseScale": 0.9864999999999999,
        "baseStrokeWidth": 4.52,
        "baseRotation": 90,
        "barrelShape": "rect",
        "barrelCount": 1,
        "barrelLength": 10.9,
        "coreColor": "#1a1a1a",
        "accentColor": "#ffffff",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
