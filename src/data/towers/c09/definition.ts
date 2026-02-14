import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c09",
    "name": "Nail Gun",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 7,
        "range": 125,
        "fireRate": 1.6,
        "special": "none",
        "specialPower": 0,
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
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "nail-gun",
    "flavorText": "Pin them down.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.9165,
        "baseStrokeWidth": 3.92,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.9,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
