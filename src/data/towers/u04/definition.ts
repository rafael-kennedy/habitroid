import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u04",
    "name": "Caustic Reservoir",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 8,
        "range": 110,
        "fireRate": 1.2,
        "special": "dot",
        "specialPower": 5,
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
        "specialPower": 2,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "caustic-reservoir",
    "flavorText": "It lingers.",
    "visuals": {
        "baseShape": "square",
        "basePoints": 6,
        "baseScale": 0.892,
        "baseStrokeWidth": 3.71,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.2,
        "coreColor": "#39ff14",
        "accentColor": "#ffffff",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
