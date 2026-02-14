import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c04",
    "name": "Acid Dripper",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 7,
        "range": 110,
        "fireRate": 1.4,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "corrosive",
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
    "artKey": "acid-dripper",
    "flavorText": "Drip. Drip. Dissolve.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.899,
        "baseStrokeWidth": 3.77,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.4,
        "coreColor": "#39ff14",
        "accentColor": "#ffffff",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
