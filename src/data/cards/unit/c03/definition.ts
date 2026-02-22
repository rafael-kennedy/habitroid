import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c03",
    "type": "unit",
    "name": "S-7 Sentinel Drone",
    "rarity": "common",
    "energyCost": 2,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 12,
        "range": 120,
        "fireRate": 1.2,
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
    "artKey": "c03",
    "flavorText": "Cheap, reliable defense with a small shield.",
    "visuals": {
        "baseShape": "hex",
        "basePoints": 4,
        "baseScale": 1,
        "baseStrokeWidth": 2,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 1,
        "barrelLength": 15,
        "coreColor": "#fff",
        "accentColor": "#aaa",
        "glowColor": "#f00"
}
},
    visualPath: image
};
