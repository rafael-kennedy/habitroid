import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c11",
    "name": "Zap Wire",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 5,
        "range": 115,
        "fireRate": 2,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 2,
        "range": 0,
        "fireRate": 0.3,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "zap-wire",
    "flavorText": "Touch the wire. I dare you.",
    "visuals": {
        "baseShape": "bouba",
        "basePoints": 7,
        "baseScale": 0.997,
        "baseStrokeWidth": 4.609999999999999,
        "baseRotation": 90,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.2,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
