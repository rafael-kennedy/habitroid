import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l08",
    "name": "Pandemic Vector",
    "rarity": "legendary",
    "energyCost": 6,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 15,
        "range": 140,
        "fireRate": 1,
        "special": "dot",
        "specialPower": 30,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 6,
        "range": 0,
        "fireRate": 0.2,
        "special": "dot",
        "specialPower": 12,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "pandemic-vector",
    "flavorText": "Contagion as a weapon system.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.3014,
        "baseStrokeWidth": 2.36,
        "baseRotation": 180,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13.7,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
