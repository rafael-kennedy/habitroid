import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c15",
    "name": "Buzzer",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 7,
        "range": 110,
        "fireRate": 1.5,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.2,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "buzzer",
    "flavorText": "Annoying and effective.",
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
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
