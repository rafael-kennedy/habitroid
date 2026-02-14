import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c18",
    "name": "Pilot Light",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 7,
        "range": 105,
        "fireRate": 1.5,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
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
    "artKey": "pilot-light",
    "flavorText": "Always on. Always ready.",
    "visuals": {
        "baseShape": "spiky",
        "basePoints": 3,
        "baseScale": 1.0215,
        "baseStrokeWidth": 4.82,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.9,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
