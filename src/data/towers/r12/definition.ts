import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r12",
    "name": "Dissolve Matrix",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 16,
        "range": 110,
        "fireRate": 1.2,
        "special": "slow",
        "specialPower": 35,
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
        "special": "slow",
        "specialPower": 15,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "dissolve-matrix",
    "flavorText": "Hard to run when the ground eats your legs.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 3,
        "baseScale": 1.1583,
        "baseStrokeWidth": 2.09,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 12.8,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
