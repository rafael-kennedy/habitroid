import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c07",
    "name": "Static Field",
    "rarity": "common",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 4,
        "range": 100,
        "fireRate": 1,
        "special": "slow",
        "specialPower": 15,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 1,
        "range": 0,
        "fireRate": 0.1,
        "special": "slow",
        "specialPower": 8,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "static-field",
    "flavorText": "Everything moves slower in here.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.9095,
        "baseStrokeWidth": 3.86,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.7,
        "coreColor": "#bf5af2",
        "accentColor": "#ffffff",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
