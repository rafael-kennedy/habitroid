// ---- Card Definition Types & 70-Card Catalog ----
import type { TargetStrategy } from '../game/types';

export type CardType = 'leader' | 'unit' | 'augment' | 'action';

export type DamageType = 'kinetic' | 'thermal' | 'electric' | 'corrosive' | 'void';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type SpecialEffect = 'none' | 'slow' | 'aoe' | 'chain' | 'dot' | 'pierce' | 'stun' | 'snare' | 'bounce' | 'percent' | 'vulnerable' | 'generate_energy' | 'draw_card' | 'leech' | 'amplify' | 'buff_firerate' | 'global_knockback' | 'refresh_cooldowns' | 'random_dmg' | 'pierce_armor' | 'confuse' | 'aura_slow' | 'aoe_slow';

export interface TowerEffect {
    damageType: DamageType;
    baseDamage: number;
    range: number;       // pixels
    fireRate: number;    // shots per second
    special: SpecialEffect;
    specialPower: number; // effect magnitude (e.g. slow %, aoe radius)
    // Advanced Mechanics
    multishot: number;
    knockback: number;
    homing: boolean;
    targetStrategy: TargetStrategy;
}

export interface TowerVisuals {
    // Identity Shapes
    baseShape: 'circle' | 'square' | 'hex' | 'star' | 'bouba' | 'spiky' | 'chevron' | 'diamond' | 'crescent';
    basePoints: number; // For star/polygon/bouba lobes (3-8)
    baseScale: number;  // 0.8 - 1.2
    baseStrokeWidth: number; // 2 - 5px for line thickness variation
    baseRotation: number; // 0 - 360 static rotation

    // Turret/Barrel
    barrelShape: 'rect' | 'tapered' | 'tri' | 'multi' | 'orb';
    barrelCount: number; // 1, 2, 3
    barrelLength: number;

    // Colors
    coreColor: string;   // Hex or CSS var
    accentColor: string; // Hex or CSS var
    glowColor: string;   // For the neon effect (usually dmg type)
}

export interface CardDefinition {
    id: string;
    type: CardType;
    name: string;
    rarity: Rarity;
    energyCost: number;
    primeEffect: TowerEffect;
    supportEffect: TowerEffect;
    artKey: string;     // CSS class / canvas draw identifier
    flavorText: string;
    visuals: TowerVisuals;
    visualPath?: string;
}

// Deterministic RNG for visuals
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function generateVisuals(id: string, type: DamageType, rarity: Rarity): TowerVisuals {
    const seed = hashCode(id);
    const rng = (offset: number) => (seed + offset * 12345) % 100 / 100; // Deterministic float 0-1
    const pick = <T>(arr: T[], offset: number): T => arr[Math.floor(rng(offset) * arr.length)];

    // Rarity Influence
    const rarityScale = rarity === 'legendary' ? 1.2 : rarity === 'rare' ? 1.1 : 1.0;
    const rarityComplexity = rarity === 'legendary' ? 2 : rarity === 'rare' ? 1 : 0;

    // 1. Base Shape
    const shapes: TowerVisuals['baseShape'][] = ['circle', 'square', 'hex', 'star', 'bouba', 'spiky', 'chevron', 'diamond', 'crescent'];
    const baseShape = pick(shapes, 1);

    // 2. Base Params
    const basePoints = 3 + Math.floor(rng(2) * (5 + rarityComplexity)); // 3-8 (more for rarities)
    const baseScale = (0.85 + rng(3) * 0.35) * rarityScale; // 0.85 - 1.2+
    const baseStrokeWidth = 2 + rng(4) * 3; // 2 - 5
    const baseRotation = Math.floor(rng(5) * 4) * 90 + (rng(6) > 0.8 ? 45 : 0); // Mostly 90deg snaps, sometimes 45

    // 3. Barrel
    const barrels: TowerVisuals['barrelShape'][] = ['rect', 'tapered', 'tri', 'multi', 'orb'];
    const barrelShape = pick(barrels, 7);
    const barrelCount = 1 + Math.floor(rng(8) * (1.5 + rarityComplexity * 0.5)); // Legendaries might get 3 barrels
    const barrelLength = 10 + rng(9) * 10; // 10-20

    // 4. Colors
    const typeColors: Record<DamageType, string> = {
        kinetic: '#ffffff', // White/Cyan
        thermal: '#ff3b30', // Red/Orange
        electric: '#bf5af2', // Purple
        corrosive: '#39ff14', // Neon Green
        void: '#9900ff' // Deep Purple/Void
    };

    const glowColor = typeColors[type];

    // Core color is either dark metal or tinted by type
    const coreColor = rng(10) > 0.5 ? '#1a1a1a' : glowColor;

    // Accent is complementary or bright white
    const accentColor = rng(11) > 0.7 ? '#ffffff' : glowColor;

    return {
        baseShape,
        basePoints,
        baseScale,
        baseStrokeWidth,
        baseRotation,
        barrelShape,
        barrelCount,
        barrelLength,
        coreColor,
        accentColor,
        glowColor
    };
}

export { generateVisuals };

import { CARD_DEFINITIONS as ALL_CARDS } from './cards/index';
export const CARD_DEFINITIONS: CardDefinition[] = ALL_CARDS;

export const CARD_DEFINITION_MAP: Record<string, CardDefinition> = ALL_CARDS.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
}, {} as Record<string, CardDefinition>);
