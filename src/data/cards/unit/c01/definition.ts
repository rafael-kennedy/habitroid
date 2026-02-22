import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "c01",
    "type": "unit",
    "name": "B.O.B. (Bumbling Ordnance Bot)",
    "rarity": "common",
    "energyCost": 1,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 5,
        "range": 120,
        "fireRate": 0.8,
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
    "artKey": "c01",
    "flavorText": "Gains +15% Fire Rate for every other Robot you control.",
    "visuals": {
        "baseShape": "circle",
        "basePoints": 4,
        "baseScale": 1,
        "baseStrokeWidth": 2,
        "baseRotation": 0,
        "barrelShape": "rect",
        "barrelCount": 1,
        "barrelLength": 15,
        "coreColor": "#888",
        "accentColor": "#aaa",
        "glowColor": "#0ff"
}
},
    visualPath: image
};
