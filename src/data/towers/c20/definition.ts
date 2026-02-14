import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c20",
    "name": "Corrode Patch",
    "rarity": "common",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 4,
        "range": 130,
        "fireRate": 1,
        "special": "slow",
        "specialPower": 10,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 1,
        "range": 0,
        "fireRate": 0.1,
        "special": "slow",
        "specialPower": 5,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "corrode-patch",
    "flavorText": "The ground beneath dissolves.",
    "visuals": {
        "baseShape": "diamond",
        "basePoints": 4,
        "baseScale": 1.1019999999999999,
        "baseStrokeWidth": 2.51,
        "baseRotation": 180,
        "barrelShape": "tri",
        "barrelCount": 2,
        "barrelLength": 14.2,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
