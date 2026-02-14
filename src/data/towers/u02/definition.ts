import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u02",
    "name": "Inferno Coil",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 15,
        "range": 100,
        "fireRate": 1,
        "special": "aoe",
        "specialPower": 40,
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
        "special": "aoe",
        "specialPower": 20,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "inferno-coil",
    "flavorText": "Everything burns in range.",
    "visuals": {
        "baseShape": "square",
        "basePoints": 6,
        "baseScale": 0.885,
        "baseStrokeWidth": 3.6500000000000004,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18,
        "coreColor": "#ff3b30",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
