import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u19",
    "name": "EMP Pulse",
    "rarity": "uncommon",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 8,
        "range": 120,
        "fireRate": 0.6,
        "special": "stun",
        "specialPower": 25,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.1,
        "special": "stun",
        "specialPower": 12,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "emp-pulse",
    "flavorText": "Systems offline.",
    "visuals": {
        "baseShape": "spiky",
        "basePoints": 3,
        "baseScale": 1.018,
        "baseStrokeWidth": 4.79,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.8,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
