import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r19",
    "name": "Overcharge Node",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 20,
        "range": 100,
        "fireRate": 0.9,
        "special": "amplify",
        "specialPower": 25,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 7,
        "range": 0,
        "fireRate": 0.1,
        "special": "amplify",
        "specialPower": 12,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "overcharge-node",
    "flavorText": "Everything nearby hits harder.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.18525,
        "baseStrokeWidth": 2.3,
        "baseRotation": 180,
        "barrelShape": "tri",
        "barrelCount": 2,
        "barrelLength": 13.5,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
