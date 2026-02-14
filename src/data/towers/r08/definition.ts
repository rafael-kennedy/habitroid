import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r08",
    "name": "Plague Bearer",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 10,
        "range": 130,
        "fireRate": 0.8,
        "special": "dot",
        "specialPower": 15,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 4,
        "range": 0,
        "fireRate": 0.1,
        "special": "dot",
        "specialPower": 6,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "plague-bearer",
    "flavorText": "Patient zero. And one through ten thousand.",
    "visuals": {
        "baseShape": "star",
        "basePoints": 8,
        "baseScale": 1.0620500000000002,
        "baseStrokeWidth": 4.34,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 2,
        "barrelLength": 10.3,
        "coreColor": "#39ff14",
        "accentColor": "#ffffff",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
