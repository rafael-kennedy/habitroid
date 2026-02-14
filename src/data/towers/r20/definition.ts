import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r20",
    "name": "Venom Well",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 8,
        "range": 140,
        "fireRate": 0.7,
        "special": "dot",
        "specialPower": 18,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.1,
        "special": "dot",
        "specialPower": 7,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "venom-well",
    "flavorText": "Bottomless poison.",
    "visuals": {
        "baseShape": "crescent",
        "basePoints": 5,
        "baseScale": 1.2699500000000001,
        "baseStrokeWidth": 2.96,
        "baseRotation": 270,
        "barrelShape": "multi",
        "barrelCount": 1,
        "barrelLength": 15.7,
        "coreColor": "#39ff14",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
