import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u12",
    "name": "Corrosion Well",
    "rarity": "uncommon",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 10,
        "range": 100,
        "fireRate": 1,
        "special": "dot",
        "specialPower": 8,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 4,
        "range": 0,
        "fireRate": 0.1,
        "special": "dot",
        "specialPower": 3,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "corrosion-well",
    "flavorText": "The deeper it goes, the worse it gets.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 7,
        "baseScale": 0.9934999999999999,
        "baseStrokeWidth": 4.58,
        "baseRotation": 90,
        "barrelShape": "tapered",
        "barrelCount": 1,
        "barrelLength": 11.1,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
