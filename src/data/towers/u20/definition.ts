import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "u20",
    "name": "Enzyme Bath",
    "rarity": "uncommon",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "corrosive",
        "baseDamage": 12,
        "range": 90,
        "fireRate": 1.1,
        "special": "dot",
        "specialPower": 4,
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
        "specialPower": 2,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "enzyme-bath",
    "flavorText": "Biology has weaponized patience.",
    "visuals": {
        "baseShape": "diamond",
        "basePoints": 4,
        "baseScale": 1.095,
        "baseStrokeWidth": 2.45,
        "baseRotation": 180,
        "barrelShape": "tri",
        "barrelCount": 2,
        "barrelLength": 14,
        "coreColor": "#1a1a1a",
        "accentColor": "#39ff14",
        "glowColor": "#39ff14"
    }
},
    visualPath: image
};
