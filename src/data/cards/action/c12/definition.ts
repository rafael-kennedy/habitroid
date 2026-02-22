import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.png', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
        "id": "c12",
        "type": "action",
        "name": "Vent the Core!",
        "rarity": "common",
        "energyCost": 2,
        "primeEffect": {
            "damageType": "kinetic",
            "baseDamage": 30,
            "range": 120,
            "fireRate": 1,
            "special": "aoe",
            "specialPower": 150,
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
        "artKey": "c12",
        "flavorText": "Deal 30 AoE damage around the base.",
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
