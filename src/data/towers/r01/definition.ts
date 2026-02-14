import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r01",
    "name": "Gauss Accelerator",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 25,
        "range": 180,
        "fireRate": 0.7,
        "special": "pierce",
        "specialPower": 3,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 8,
        "range": 0,
        "fireRate": 0.1,
        "special": "pierce",
        "specialPower": 1,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "gauss-accelerator",
    "flavorText": "Terminal velocity is a suggestion.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 7,
        "baseScale": 1.0351000000000001,
        "baseStrokeWidth": 4.13,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 19.6,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
