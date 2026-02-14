import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u14",
    "name": "Thermite Dropper",
    "rarity": "uncommon",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 16,
        "range": 85,
        "fireRate": 0.9,
        "special": "dot",
        "specialPower": 6,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 5,
        "range": 0,
        "fireRate": 0.1,
        "special": "dot",
        "specialPower": 3,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "thermite-dropper",
    "flavorText": "Burns through anything.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 7,
        "baseScale": 1.0005,
        "baseStrokeWidth": 4.640000000000001,
        "baseRotation": 90,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.3,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
