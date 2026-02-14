import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r15",
    "name": "Ion Cascade",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 12,
        "range": 140,
        "fireRate": 0.8,
        "special": "chain",
        "specialPower": 5,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 4,
        "range": 0,
        "fireRate": 0.1,
        "special": "chain",
        "specialPower": 2,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "ion-cascade",
    "flavorText": "One spark becomes an avalanche.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 3,
        "baseScale": 1.16985,
        "baseStrokeWidth": 2.18,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 2,
        "barrelLength": 13.1,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
