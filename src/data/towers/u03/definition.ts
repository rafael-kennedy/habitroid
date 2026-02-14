import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u03",
    "name": "Arc Conductor",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 10,
        "range": 120,
        "fireRate": 1.5,
        "special": "chain",
        "specialPower": 2,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.2,
        "special": "chain",
        "specialPower": 1,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "arc-conductor",
    "flavorText": "Lightning finds its own path.",
    "visuals": {
        "baseShape": "square",
        "basePoints": 6,
        "baseScale": 0.8885,
        "baseStrokeWidth": 3.68,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.1,
        "coreColor": "#bf5af2",
        "accentColor": "#ffffff",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
