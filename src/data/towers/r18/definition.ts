import type { CardDefinition } from '../../cardDefinitions';
const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    ...{
    "id": "r18",
    "name": "Cinder Swarm",
    "rarity": "rare",
    "energyCost": 3,
    "primeEffect": {
        "damageType": "thermal",
        "baseDamage": 8,
        "range": 140,
        "fireRate": 2.5,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "supportEffect": {
        "damageType": "thermal",
        "baseDamage": 3,
        "range": 0,
        "fireRate": 0.5,
        "special": "none",
        "specialPower": 0,
        "multishot": 0,
        "knockback": 0,
        "homing": true,
        "targetStrategy": "nearest"
    },
    "artKey": "cinder-swarm",
    "flavorText": "A thousand tiny fires.",
    "visuals": {
        "baseShape": "chevron",
        "basePoints": 4,
        "baseScale": 1.1814,
        "baseStrokeWidth": 2.27,
        "baseRotation": 225,
        "barrelShape": "tri",
        "barrelCount": 2,
        "barrelLength": 13.4,
        "coreColor": "#1a1a1a",
        "accentColor": "#ff3b30",
        "glowColor": "#ff3b30"
    }
},
    visualPath: image
};
