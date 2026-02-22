import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.png', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
        "id": "c06",
        "type": "augment",
        "name": "Jumper Cables",
        "rarity": "common",
        "energyCost": 1,
        "primeEffect": {
            "damageType": "kinetic",
            "baseDamage": 10,
            "range": 120,
            "fireRate": 1,
            "special": "none",
            "specialPower": 0,
            "multishot": 0,
            "knockback": 0,
            "homing": false,
            "targetStrategy": "nearest"
        },
        "supportEffect": {
            "damageType": "electric",
            "baseDamage": 0,
            "range": 0,
            "fireRate": 0,
            "special": "chain",
            "specialPower": 1,
            "multishot": 0,
            "knockback": 0,
            "homing": false,
            "targetStrategy": "nearest"
        },
        "artKey": "c06",
        "flavorText": "Gives the unit a weak Chain Lightning effect.",
        "visuals": {
            "baseShape": "square",
            "basePoints": 4,
            "baseScale": 1,
            "baseStrokeWidth": 2,
            "baseRotation": 0,
            "barrelShape": "rect",
            "barrelCount": 1,
            "barrelLength": 15,
            "coreColor": "#fff",
            "accentColor": "#aaa",
            "glowColor": "#0ff"
        }
    },
    visualPath: image
};
