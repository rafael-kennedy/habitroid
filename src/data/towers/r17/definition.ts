import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r17",
    "name": "Shrapnel Bloom",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 15,
        "range": 100,
        "fireRate": 1.2,
        "special": "aoe",
        "specialPower": 50,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 5,
        "range": 0,
        "fireRate": 0.2,
        "special": "aoe",
        "specialPower": 22,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "shrapnel-bloom",
    "flavorText": "Beautiful. And lethal.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.17755,
        "baseStrokeWidth": 2.24,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 2,
        "barrelLength": 13.3,
        "coreColor": "#1a1a1a",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
