import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c03",
    "name": "Spark Plug",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 6,
        "range": 130,
        "fireRate": 1.8,
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
    "artKey": "spark-plug",
    "flavorText": "A little jolt goes a long way.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.8955,
        "baseStrokeWidth": 3.7399999999999998,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.299999999999997,
        "coreColor": "#bf5af2",
        "accentColor": "#ffffff",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
