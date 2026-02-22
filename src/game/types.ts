// ---- Shared Game Types ----

export interface Vec2 {
    x: number;
    y: number;
}

export type TargetStrategy = 'nearest' | 'furthest' | 'weakest' | 'strongest';

export type GamePhase = 'MENU' | 'DRAW_PHASE' | 'PLACEMENT_PHASE' | 'COMBAT_PHASE' | 'WAVE_END' | 'GAME_OVER' | 'VICTORY';

export interface PathPoint {
    x: number;
    y: number;
}

// A path is a series of waypoints that enemies follow
export interface EnemyPath {
    id: string;
    points: PathPoint[];
}

// A zone where towers can be placed
export interface PlacementZone {
    id: string;
    center: Vec2;
    radius: number; // circular zones for simplicity
}

export interface MapDefinition {
    id: string;
    name: string;
    width: number;
    height: number;
    paths: EnemyPath[];
    placementZones: PlacementZone[];
    waves: WaveDefinition[];
    startEnergy: number;
    energyPerWave: number;
    startHP: number;
    unlockCost?: number; // If undefined, map is free
}

export interface WaveDefinition {
    enemies: { type: EnemyType; count: number; delay: number }[];
}

export type EnemyType = 'basic' | 'fast' | 'armored' | 'swarm' | 'boss';

export interface Enemy {
    id: string;
    type: EnemyType;
    hp: number;
    maxHp: number;
    speed: number;       // pixels per second
    armor: number;       // flat damage reduction
    pathId: string;
    pathProgress: number; // 0-1 along the path
    x: number;
    y: number;
    alive: boolean;
    effects: ActiveEffect[];
    value: number;        // score on kill
    totalPathLength: number;
    wanderPhase: number;
    wanderAmplitude: number;
}

export interface ActiveEffect {
    type: 'slow' | 'dot' | 'stun' | 'snare' | 'vulnerable';
    damageType?: string; // e.g. 'corrosive' for poison stacking, 'thermal' for fire stacking
    power: number;
    duration: number;
    remaining: number;
}

export interface Tower {
    id: string;
    x: number;
    y: number;
    zoneId: string;
    primeCardDefId: string;
    supportCardDefIds: string[];
    // Computed stats
    damageType: string;
    damage: number;
    range: number;
    fireRate: number;
    special: string;
    specialPower: number;
    // Advanced Mechanics
    multishot: number;
    knockback: number;
    homing: boolean;
    targetStrategy: TargetStrategy;
    // Runtime
    cooldown: number;
    targetId: string | null;
    angle: number;
    // Card-specific runtime state
    killCount: number;
    disabled: boolean;
    tags: string[];  // e.g. ['robot', 'alien', 'organic', 'yellow_shirt']
}

export interface Projectile {
    id: string;
    x: number;
    y: number;
    targetId: string;
    speed: number;
    damage: number;
    damageType: string;
    special: string;
    specialPower: number;
    towerId: string;
    pierceCount: number; // how many more enemies it can hit
    pierced: string[];   // list of enemy IDs already hit
    knockback: number;
    homing: boolean;
    angle?: number; // for linear movement
}

export interface GameState {
    phase: GamePhase;
    mapId: string;
    deckId: string;
    currentWave: number;
    totalWaves: number;
    energy: number;
    maxEnergy: number;
    hp: number;
    maxHp: number;
    score: number;
    enemies: Enemy[];
    towers: Tower[];
    projectiles: Projectile[];
    hand: string[];          // card definition IDs in hand
    drawPile: string[];      // card definition IDs
    discardPile: string[];
    selectedCardDefId: string | null;
    enemiesSpawned: number;
    spawnTimer: number;
    waveEnemies: { type: EnemyType; delay: number }[];
    waveEnergyYield: number;
    waveComplete: boolean;
    // Card behavior state
    unitCostDiscount: number;     // temporary cost reduction for next unit (u10)
    firstActionThisWave: boolean; // whether first action has been played this wave (l07)
}

export const ENEMY_STATS: Record<EnemyType, { hp: number; speed: number; armor: number; value: number }> = {
    basic: { hp: 50, speed: 60, armor: 0, value: 10 },
    fast: { hp: 30, speed: 120, armor: 0, value: 15 },
    armored: { hp: 100, speed: 40, armor: 5, value: 20 },
    swarm: { hp: 20, speed: 80, armor: 0, value: 5 },
    boss: { hp: 500, speed: 30, armor: 10, value: 100 },
};
