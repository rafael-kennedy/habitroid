import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u07",
    "name": "Tesla Array",
    "rarity": "uncommon",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 12,
        "range": 140,
        "fireRate": 1.2,
        "special": "chain",
        "specialPower": 3,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 4,
        "range": 0,
        "fireRate": 0.2,
        "special": "chain",
        "specialPower": 1,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "tesla-array",
    "flavorText": "Named after the master.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.9025,
        "baseStrokeWidth": 3.8,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.5,
        "coreColor": "#bf5af2",
        "accentColor": "#ffffff",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
