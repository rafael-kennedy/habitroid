import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c12",
    "name": "Sludge Vent",
    "rarity": "common",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 5,
        "range": 90,
        "fireRate": 1,
        "special": "dot",
        "specialPower": 3,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 2,
        "range": 0,
        "fireRate": 0.1,
        "special": "dot",
        "specialPower": 1,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "sludge-vent",
    "flavorText": "The gift that keeps on giving.",
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
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
