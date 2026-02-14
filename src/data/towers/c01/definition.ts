import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c01",
    "name": "Bolt Emitter",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 8,
        "range": 120,
        "fireRate": 1.5,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.2,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "bolt-emitter",
    "flavorText": "Standard-issue. Gets the job done.",
    "visuals": {
        "baseShape": "square",
        "basePoints": 6,
        "baseScale": 0.8885,
        "baseStrokeWidth": 3.68,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.1,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
