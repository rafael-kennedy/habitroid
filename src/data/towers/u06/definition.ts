import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u06",
    "name": "Magma Core",
    "rarity": "uncommon",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 18,
        "range": 80,
        "fireRate": 0.8,
        "special": "aoe",
        "specialPower": 55,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 6,
        "range": 0,
        "fireRate": 0.1,
        "special": "aoe",
        "specialPower": 25,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "magma-core",
    "flavorText": "The floor is lava. Literally.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.899,
        "baseStrokeWidth": 3.77,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.4,
        "coreColor": "#ff3b30",
        "accentColor": "#ffffff",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
