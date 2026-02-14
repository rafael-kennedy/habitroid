import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c13",
    "name": "Slug Thrower",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 11,
        "range": 105,
        "fireRate": 1.1,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 4,
        "range": 0,
        "fireRate": 0.1,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "slug-thrower",
    "flavorText": "Heavy and reliable.",
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
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
