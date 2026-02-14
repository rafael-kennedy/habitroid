import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c05",
    "name": "Pellet Launcher",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 5,
        "range": 140,
        "fireRate": 2,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 2,
        "range": 0,
        "fireRate": 0.4,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "pellet-launcher",
    "flavorText": "Quantity has a quality all its own.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.9025,
        "baseStrokeWidth": 3.8,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.5,
        "coreColor": "#ffffff",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
