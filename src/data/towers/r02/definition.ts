import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r02",
    "name": "Plasma Forge",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 22,
        "range": 100,
        "fireRate": 0.8,
        "special": "aoe",
        "specialPower": 65,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 8,
        "range": 0,
        "fireRate": 0.1,
        "special": "aoe",
        "specialPower": 30,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "plasma-forge",
    "flavorText": "Star-hot. Star-bright.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 7,
        "baseScale": 1.03895,
        "baseStrokeWidth": 4.16,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 19.7,
        "coreColor": "#ff3b30",
        "accentColor": "#ffffff",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
