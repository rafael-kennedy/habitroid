import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r10",
    "name": "Fusion Core",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 20,
        "range": 110,
        "fireRate": 1,
        "special": "dot",
        "specialPower": 8,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 7,
        "range": 0,
        "fireRate": 0.1,
        "special": "dot",
        "specialPower": 4,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "fusion-core",
    "flavorText": "Contained fusion. Mostly.",
    "visuals": {
        "baseShape": "spiky",
        "basePoints": 3,
        "baseScale": 1.1506,
        "baseStrokeWidth": 2.03,
        "baseRotation": 135,
        "barrelShape": "tapered",
        "barrelCount": 2,
        "barrelLength": 12.6,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
