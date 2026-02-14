import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l06",
    "name": "Supernova Core",
    "rarity": "legendary",
    "energyCost": 7,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 60,
        "range": 100,
        "fireRate": 0.3,
        "special": "aoe",
        "specialPower": 120,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 18,
        "range": 0,
        "fireRate": 0.05,
        "special": "aoe",
        "specialPower": 50,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "supernova-core",
    "flavorText": "One pulse. Nothing remains.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.293,
        "baseStrokeWidth": 2.3,
        "baseRotation": 180,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13.5,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
