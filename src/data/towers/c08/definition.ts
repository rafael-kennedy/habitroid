import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c08",
    "name": "Rust Spray",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 9,
        "range": 95,
        "fireRate": 1.3,
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
    "artKey": "rust-spray",
    "flavorText": "Oxidation is inevitable.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 6,
        "baseScale": 0.913,
        "baseStrokeWidth": 3.89,
        "baseRotation": 0,
        "barrelShape": "orb",
        "barrelCount": 1,
        "barrelLength": 18.8,
        "coreColor": "#39ff14",
        "accentColor": "#ffffff",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
