import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r06",
    "name": "Nova Emitter",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 28,
        "range": 90,
        "fireRate": 0.6,
        "special": "aoe",
        "specialPower": 80,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 9,
        "range": 0,
        "fireRate": 0.1,
        "special": "aoe",
        "specialPower": 35,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "nova-emitter",
    "flavorText": "A miniature supernova. Every six seconds.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 8,
        "baseScale": 1.0543500000000001,
        "baseStrokeWidth": 4.28,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 10.1,
        "coreColor": "#ff3b30",
        "accentColor": "#ffffff",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
