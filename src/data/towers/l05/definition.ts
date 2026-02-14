import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l05",
    "name": "Omega Gatling",
    "rarity": "legendary",
    "energyCost": 5,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 15,
        "range": 150,
        "fireRate": 5,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 5,
        "range": 0,
        "fireRate": 1,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "omega-gatling",
    "flavorText": "The rate of fire is measured in \"yes.\"",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.2887999999999997,
        "baseStrokeWidth": 2.27,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13.4,
        "coreColor": "#1a1a1a",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
