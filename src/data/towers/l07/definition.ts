import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l07",
    "name": "Quantum Disruptor",
    "rarity": "legendary",
    "energyCost": 5,
    "primeEffect": {
        "damageType": "electric",
        "baseDamage": 25,
        "range": 160,
        "fireRate": 1,
        "special": "stun",
        "specialPower": 40,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "electric",
        "baseDamage": 8,
        "range": 0,
        "fireRate": 0.2,
        "special": "stun",
        "specialPower": 18,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "quantum-disruptor",
    "flavorText": "They exist in a state of uncertainty. Mostly pain.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.2972,
        "baseStrokeWidth": 2.33,
        "baseRotation": 180,
        "barrelShape": "tri",
        "barrelCount": 3,
        "barrelLength": 13.6,
        "coreColor": "#1a1a1a",
        "accentColor": "#bf5af2",
        "glowColor": "#bf5af2"
    }
},
    visualPath: image
};
