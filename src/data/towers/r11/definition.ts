import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r11",
    "name": "Dynamo Heart",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 14,
        "range": 130,
        "fireRate": 1.8,
        "special": "stun",
        "specialPower": 20,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 5,
        "range": 0,
        "fireRate": 0.3,
        "special": "stun",
        "specialPower": 10,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "dynamo-heart",
    "flavorText": "It beats. They freeze.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 3,
        "baseScale": 1.15445,
        "baseStrokeWidth": 2.06,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 12.7,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
