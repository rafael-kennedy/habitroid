import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l03",
    "name": "Thundergod Spire",
    "rarity": "legendary",
    "energyCost": 6,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 30,
        "range": 180,
        "fireRate": 0.8,
        "special": "chain",
        "specialPower": 7,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 10,
        "range": 0,
        "fireRate": 0.2,
        "special": "chain",
        "specialPower": 3,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "thundergod-spire",
    "flavorText": "Zeus called. He wants his tower back.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.2804,
        "baseStrokeWidth": 2.21,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13.2,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
