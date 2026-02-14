import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r16",
    "name": "Blight Sprout",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 12,
        "range": 100,
        "fireRate": 1.5,
        "special": "snare",
        "specialPower": 20,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 4,
        "range": 0,
        "fireRate": 0.2,
        "special": "snare",
        "specialPower": 10,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "blight-sprout",
    "flavorText": "It grows where you least expect it.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.1737,
        "baseStrokeWidth": 2.21,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 2,
        "barrelLength": 13.2,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
