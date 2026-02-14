import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l02",
    "name": "Solar Annihilator",
    "rarity": "legendary",
    "energyCost": 6,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 40,
        "range": 120,
        "fireRate": 0.6,
        "special": "aoe",
        "specialPower": 100,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 12,
        "range": 0,
        "fireRate": 0.1,
        "special": "aoe",
        "specialPower": 45,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "solar-annihilator",
    "flavorText": "A sun in a box. Unbox carefully.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.2761999999999998,
        "baseStrokeWidth": 2.18,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13.1,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
