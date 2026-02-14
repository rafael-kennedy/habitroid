import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u15",
    "name": "Voltage Spike",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 14,
        "range": 100,
        "fireRate": 1,
        "special": "stun",
        "specialPower": 15,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 4,
        "range": 0,
        "fireRate": 0.1,
        "special": "stun",
        "specialPower": 8,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "voltage-spike",
    "flavorText": "Locked in place.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 7,
        "baseScale": 1.004,
        "baseStrokeWidth": 4.67,
        "baseRotation": 90,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.4,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
