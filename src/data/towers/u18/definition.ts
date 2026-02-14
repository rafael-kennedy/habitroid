import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u18",
    "name": "Flame Jet",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 11,
        "range": 95,
        "fireRate": 1.8,
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
        "fireRate": 0.3,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "flame-jet",
    "flavorText": "Continuous stream of fire.",
    "visuals": {
        "baseShape": "spiky",
        "basePoints": 3,
        "baseScale": 1.0145,
        "baseStrokeWidth": 4.76,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.7,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
