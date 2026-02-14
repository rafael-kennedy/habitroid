import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u09",
    "name": "Burst Cannon",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 14,
        "range": 110,
        "fireRate": 1.8,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 5,
        "range": 0,
        "fireRate": 0.3,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "burst-cannon",
    "flavorText": "Three-round bursts. Precise.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.9095,
        "baseStrokeWidth": 3.86,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.7,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
