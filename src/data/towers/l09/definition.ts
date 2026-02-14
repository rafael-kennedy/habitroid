import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l09",
    "name": "Antimatter Projector",
    "rarity": "legendary",
    "energyCost": 7,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 80,
        "range": 190,
        "fireRate": 0.15,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 25,
        "range": 0,
        "fireRate": 0.02,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "antimatter-projector",
    "flavorText": "When matter meets anti-matter, anti-matter wins.",
    "visuals": {
        "baseShape": "diamond",
        "basePoints": 4,
        "baseScale": 1.3056,
        "baseStrokeWidth": 2.39,
        "baseRotation": 180,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13.8,
        "coreColor": "#1a1a1a",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
