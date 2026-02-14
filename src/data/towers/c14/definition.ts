import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c14",
    "name": "Candle Turret",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 6,
        "range": 120,
        "fireRate": 1.6,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
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
    "artKey": "candle-turret",
    "flavorText": "A tiny flame in the darkness.",
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
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
