import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.png', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
        "id": "c20",
        "type": "action",
        "name": "Comm Communicator",
        "rarity": "common",
        "energyCost": 0,
        "primeEffect": {
            "damageType": "kinetic",
            "baseDamage": 10,
            "range": 120,
            "fireRate": 1,
            "special": "draw_card",
            "specialPower": 0,
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
        "artKey": "c20",
        "flavorText": "Draw 1 card, gain 1 energy.",
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
