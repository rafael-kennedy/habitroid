import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
        "id": "c02",
        "type": "unit",
        "name": "Gloop, The Acidic Janitor",
        "rarity": "common",
        "energyCost": 2,
        "primeEffect": {
            "damageType": "corrosive",
            "baseDamage": 8,
            "range": 120,
            "fireRate": 1,
            "special": "vulnerable",
            "specialPower": 10,
            "multishot": 0,
            "knockback": 0,
            "homing": false,
            "targetStrategy": "nearest"
        },
        "supportEffect": {
            "damageType": "kinetic",
            "baseDamage": 0,
            "range": 0,
            "fireRate": 0,
            "special": "none",
            "specialPower": 0,
            "multishot": 0,
            "knockback": 0,
            "homing": false,
            "targetStrategy": "nearest"
        },
        "artKey": "c02",
        "flavorText": "Enemies hit take 10% more damage from all sources.",
        "visuals": {
            "baseShape": "bouba",
            "basePoints": 4,
            "baseScale": 1,
            "baseStrokeWidth": 2,
            "baseRotation": 0,
            "barrelShape": "rect",
            "barrelCount": 1,
            "barrelLength": 15,
            "coreColor": "#0f0",
            "accentColor": "#aaa",
            "glowColor": "#0ff"
        }
    },
    visualPath: image
};
