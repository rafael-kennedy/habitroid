import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u05",
    "name": "Railgun Lens",
    "rarity": "uncommon",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 20,
        "range": 160,
        "fireRate": 0.5,
        "special": "pierce",
        "specialPower": 2,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 6,
        "range": 0,
        "fireRate": 0.1,
        "special": "pierce",
        "specialPower": 1,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "railgun-lens",
    "flavorText": "Clean through.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.8955,
        "baseStrokeWidth": 3.7399999999999998,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.299999999999997,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
