import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c02",
    "name": "Heat Coil",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 10,
        "range": 100,
        "fireRate": 1.2,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
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
    "artKey": "heat-coil",
    "flavorText": "Warm to the touch. Scorching to the enemy.",
    "visuals": {
        "baseShape": "square",
        "basePoints": 6,
        "baseScale": 0.892,
        "baseStrokeWidth": 3.71,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.2,
        "coreColor": "#ff3b30",
        "accentColor": "#ffffff",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
