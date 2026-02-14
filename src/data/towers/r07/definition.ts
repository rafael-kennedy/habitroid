import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r07",
    "name": "Lightning Spire",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 18,
        "range": 160,
        "fireRate": 1.2,
        "special": "chain",
        "specialPower": 3,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 6,
        "range": 0,
        "fireRate": 0.2,
        "special": "chain",
        "specialPower": 2,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "lightning-spire",
    "flavorText": "The tallest point attracts the most power.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 8,
        "baseScale": 1.0582,
        "baseStrokeWidth": 4.3100000000000005,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 10.2,
        "coreColor": "#bf5af2",
        "accentColor": "#ffffff",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
