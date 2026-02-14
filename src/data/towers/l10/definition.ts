import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l10",
    "name": "Nexus Obelisk",
    "rarity": "legendary",
    "energyCost": 5,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 18,
        "range": 200,
        "fireRate": 0.6,
        "special": "amplify",
        "specialPower": 50,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 6,
        "range": 30,
        "fireRate": 0.1,
        "special": "amplify",
        "specialPower": 25,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "nexus-obelisk",
    "flavorText": "Everything in its shadow becomes stronger.",
    "visuals": {
        "baseShape": "circle",
        "basePoints": 6,
        "baseScale": 1.398,
        "baseStrokeWidth": 3.05,
        "baseRotation": 270,
        "barrelShape": "multi",
        "barrelCount": 1,
        "barrelLength": 16,
        "coreColor": "#bf5af2",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
