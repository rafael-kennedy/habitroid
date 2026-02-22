import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r04",
    "type": "unit",
    "name": "The Diplomat",
    "rarity": "rare",
    "energyCost": 4,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 0,
        "range": 120,
        "fireRate": 1,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": false,
        "targetStrategy": "nearest"
},
    "supportEffect": {
        "damageType": "kinetic",
        "baseDamage": 0,
        "range": 0,
        "fireRate": 0,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": false,
        "targetStrategy": "nearest"
},
    "artKey": "r04",
    "flavorText": "Aura: Enemies lose all armor and special traits.",
    "visuals": {
        "baseShape": "square",
        "basePoints": 4,
        "baseScale": 1,
        "baseStrokeWidth": 2,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 1,
        "barrelLength": 15,
        "coreColor": "#fff",
        "accentColor": "#aaa",
        "glowColor": "#0ff"
}
},
    visualPath: image
};
