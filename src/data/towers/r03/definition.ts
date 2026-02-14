import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r03",
    "name": "Storm Generator",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 16,
        "range": 150,
        "fireRate": 1,
        "special": "chain",
        "specialPower": 4,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 6,
        "range": 0,
        "fireRate": 0.2,
        "special": "chain",
        "specialPower": 2,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "storm-generator",
    "flavorText": "Calling down the thunder.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 7,
        "baseScale": 1.0428,
        "baseStrokeWidth": 4.1899999999999995,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 19.8,
        "coreColor": "#bf5af2",
        "accentColor": "#ffffff",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
