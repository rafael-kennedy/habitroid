import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u08",
    "name": "Bio Mist",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 6,
        "range": 130,
        "fireRate": 0.8,
        "special": "slow",
        "specialPower": 25,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
        "baseDamage": 2,
        "range": 0,
        "fireRate": 0.1,
        "special": "slow",
        "specialPower": 12,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "bio-mist",
    "flavorText": "Breathe deep. Or don't.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.9059999999999999,
        "baseStrokeWidth": 3.83,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.6,
        "coreColor": "#39ff14",
        "accentColor": "#ffffff",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
