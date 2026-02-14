import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c10",
    "name": "Flare Pod",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 8,
        "range": 110,
        "fireRate": 1.4,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.2,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "flare-pod",
    "flavorText": "A brief, bright life.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 7,
        "baseScale": 0.9934999999999999,
        "baseStrokeWidth": 4.58,
        "baseRotation": 90,
        "barrelShape": "tapered",
        "barrelCount": 1,
        "barrelLength": 11.1,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
