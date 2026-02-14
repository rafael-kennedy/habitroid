import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c16",
    "name": "Drip Feed",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 6,
        "range": 115,
        "fireRate": 1.5,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 2,
        "range": 0,
        "fireRate": 0.3,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "drip-feed",
    "flavorText": "Slow dissolution.",
    "visuals": {
        "baseShape": "spiky",
        "basePoints": 3,
        "baseScale": 1.0145,
        "baseStrokeWidth": 4.76,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.7,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
