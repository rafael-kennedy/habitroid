import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r09",
    "name": "Siege Driver",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 35,
        "range": 170,
        "fireRate": 0.3,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 12,
        "range": 0,
        "fireRate": 0.05,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "siege-driver",
    "flavorText": "One shot. One kill. One per decade.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 8,
        "baseScale": 1.0659,
        "baseStrokeWidth": 4.37,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 10.4,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
