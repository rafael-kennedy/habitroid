import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r14",
    "name": "Pyroclasm",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 18,
        "range": 120,
        "fireRate": 0.9,
        "special": "aoe",
        "specialPower": 55,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 6,
        "range": 0,
        "fireRate": 0.1,
        "special": "aoe",
        "specialPower": 25,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "pyroclasm",
    "flavorText": "The earth cracks and bleeds fire.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 3,
        "baseScale": 1.1660000000000001,
        "baseStrokeWidth": 2.15,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 2,
        "barrelLength": 13,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
