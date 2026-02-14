import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c06",
    "name": "Ember Node",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 12,
        "range": 90,
        "fireRate": 1,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 5,
        "range": 0,
        "fireRate": 0.1,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "ember-node",
    "flavorText": "Burns slow, burns steady.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.9059999999999999,
        "baseStrokeWidth": 3.83,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.6,
        "coreColor": "#ff3b30",
        "accentColor": "#ffffff",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
