import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u13",
    "name": "Scatter Shot",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 8,
        "range": 90,
        "fireRate": 1.5,
        "special": "aoe",
        "specialPower": 35,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.2,
        "special": "aoe",
        "specialPower": 15,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "scatter-shot",
    "flavorText": "Spray and pray.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 7,
        "baseScale": 0.997,
        "baseStrokeWidth": 4.609999999999999,
        "baseRotation": 90,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.2,
        "coreColor": "#1a1a1a",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
