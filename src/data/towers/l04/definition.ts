import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l04",
    "name": "Entropy Engine",
    "rarity": "legendary",
    "energyCost": 6,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 20,
        "range": 150,
        "fireRate": 0.8,
        "special": "dot",
        "specialPower": 25,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 8,
        "range": 0,
        "fireRate": 0.1,
        "special": "dot",
        "specialPower": 10,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "entropy-engine",
    "flavorText": "All things end. This accelerates it.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.2846,
        "baseStrokeWidth": 2.24,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13.3,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
