import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l01",
    "name": "Ragnarok Cannon",
    "rarity": "legendary",
    "energyCost": 6,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 50,
        "range": 200,
        "fireRate": 0.4,
        "special": "pierce",
        "specialPower": 5,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 15,
        "range": 0,
        "fireRate": 0.1,
        "special": "pierce",
        "specialPower": 2,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "ragnarok-cannon",
    "flavorText": "The last argument of kings.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.272,
        "baseStrokeWidth": 2.15,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13,
        "coreColor": "#1a1a1a",
        "accentColor": "#ffffff",
        "glowColor": "#ffffff"
    }
},
    visualPath: image
};
