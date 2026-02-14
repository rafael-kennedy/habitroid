import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r13",
    "name": "Velocity Manifold",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 10,
        "range": 150,
        "fireRate": 4,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 4,
        "range": 0,
        "fireRate": 0.8,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "velocity-manifold",
    "flavorText": "Faster than the eye can track.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 3,
        "baseScale": 1.16215,
        "baseStrokeWidth": 2.12,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 12.9,
        "coreColor": "#1a1a1a",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
