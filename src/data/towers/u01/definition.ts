import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u01",
    "name": "Gatling Module",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 6,
        "range": 130,
        "fireRate": 3,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 2,
        "range": 0,
        "fireRate": 0.6,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "gatling-module",
    "flavorText": "More dakka.",
    "visuals": {
        "baseShape": "square",
        "basePoints": 6,
        "baseScale": 0.8815,
        "baseStrokeWidth": 3.62,
        "baseRotation": 270,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 17.9,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
