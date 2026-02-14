import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u17",
    "name": "Penetrator Round",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 16,
        "range": 130,
        "fireRate": 0.8,
        "special": "pierce",
        "specialPower": 1,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 5,
        "range": 0,
        "fireRate": 0.1,
        "special": "pierce",
        "specialPower": 1,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "penetrator-round",
    "flavorText": "It goes through the first. And the second.",
    "visuals": {
        "baseShape": "spiky",
        "basePoints": 3,
        "baseScale": 1.011,
        "baseStrokeWidth": 4.73,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 11.6,
        "coreColor": "#1a1a1a",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
