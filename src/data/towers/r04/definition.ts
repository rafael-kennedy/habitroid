import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r04",
    "name": "Necrosis Engine",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 14,
        "range": 120,
        "fireRate": 1,
        "special": "dot",
        "specialPower": 12,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 5,
        "range": 0,
        "fireRate": 0.1,
        "special": "dot",
        "specialPower": 5,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "necrosis-engine",
    "flavorText": "Death by a thousand molecules.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 8,
        "baseScale": 1.04665,
        "baseStrokeWidth": 4.22,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 19.9,
        "coreColor": "#39ff14",
        "accentColor": "#ffffff",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
