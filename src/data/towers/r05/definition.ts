import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r05",
    "name": "Autocannon",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 12,
        "range": 140,
        "fireRate": 3.5,
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
        "fireRate": 0.7,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "autocannon",
    "flavorText": "The sound alone is terrifying.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 8,
        "baseScale": 1.0505,
        "baseStrokeWidth": 4.25,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 10,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
