import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r01",
    "type": "unit",
    "name": "Z-9000 Eradicator",
    "rarity": "rare",
    "energyCost": 5,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 40,
        "range": 120,
        "fireRate": 2,
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
    "artKey": "r01",
    "flavorText": "If it has Thermal augment, permanently melts enemy armor.",
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
