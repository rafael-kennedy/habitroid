import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u11",
    "name": "Capacitor Bank",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 9,
        "range": 110,
        "fireRate": 2,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.4,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "capacitor-bank",
    "flavorText": "Store. Release. Repeat.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 7,
        "baseScale": 0.99,
        "baseStrokeWidth": 4.55,
        "baseRotation": 90,
        "barrelShape": "tapered",
        "barrelCount": 1,
        "barrelLength": 11,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
