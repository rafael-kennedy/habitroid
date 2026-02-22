import type { CardDefinition } from '../../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "l03",
    "type": "unit",
    "name": "Omicron, The Final Arbiter",
    "rarity": "legendary",
    "energyCost": 8,
    "primeEffect": {
        "damageType": "kinetic",
        "baseDamage": 100,
        "range": 120,
        "fireRate": 1,
        "special": "aoe",
        "specialPower": 80,
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
    "artKey": "l03",
    "flavorText": "If he has 3+ Augments, attacks stun everything in a huge radius.",
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
