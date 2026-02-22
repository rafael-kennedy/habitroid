import { describe, it, expect } from 'vitest';
import {
    createGameState,
    moveEnemies,
    updateEffects,
    moveProjectiles,
    applyDamage,
    updateTowers
} from './engine';
import type { GameState, Enemy, Projectile, Tower } from './types';


// Helper to create a minimal enemy
function createEnemy(id: string, hp = 100, x = 0, y = 0): Enemy {
    return {
        id,
        type: 'basic',
        hp,
        maxHp: hp,
        speed: 100, // easy math: 1 sec = 100px
        armor: 0,
        pathId: 'path-main',
        pathProgress: 0,
        x,
        y,
        alive: true,
        effects: [],
        value: 10,
        totalPathLength: 1000, // Arbitrary default
        wanderPhase: 0,
        wanderAmplitude: 0
    };
}

// Helper to create a minimal projectile
function createProj(id: string, targetId: string, damage = 10, special = 'none', specialPower = 0): Projectile {
    return {
        id,
        x: 0,
        y: 0,
        targetId,
        speed: 1000, // instant hit at close range
        damage,
        damageType: 'kinetic',
        special,
        specialPower,
        towerId: 'tower1',
        pierceCount: 0,
        pierced: [],
        knockback: 0,
        homing: true
    };
}

// Minimal stub for Map Data (since engine imports real maps, we might test against real ones or mocking)
// Since engine.ts imports MAP_DEFINITIONS from a file, mocking that import is cleaner, but Vitest mocking of modules is tricky in a single file without separate setup.
// We'll trust that map-serpent exists as it is hardcoded in `engine.ts` default exports? No, `createGameState` uses explicit mapId.
// We'll use 'map-serpent' which we know exists.

describe('Game Engine Mechanics', () => {

    describe('Game State Initialization', () => {
        it('should initialize with correct map defaults', () => {
            const _nextState = createGameState('map-serpent', ['c01', 'c02']);
            expect(_nextState.phase).toBe('DRAW_PHASE');
            expect(_nextState.hp).toBe(20); // map-serpent default
            expect(_nextState.energy).toBe(5); // map-serpent default
            expect(_nextState.drawPile).toHaveLength(2);
        });
    });

    describe('Enemy Movement & Status Effects', () => {
        it('should move enemies along path', () => {
            const state = createGameState('map-serpent', []);
            // Manually inject an enemy at (0, 0)
            const enemy = createEnemy('e1', 100, 0, 100); // path-main starts at 0,100
            state.enemies = [enemy];

            // map-serpent path-main segment 1 is (0,100) -> (150,100). Len = 150.
            // Speed 100. dt = 1. Should move 100px.
            // Progress = 100 / TotalLen. TotalLen is complex.
            // Let's just check position changes.



            // Path provided above overrides logic if we mocked map? No, engine imports map directly.
            // moveEnemies second arg IS the map object. We can inject a fake map!

            const fakeMap = {
                paths: [{ id: 'path-main', points: [{ x: 0, y: 0 }, { x: 1000, y: 0 }] }]
            };

            const next = moveEnemies(state, fakeMap as any, 1.0);
            expect(next.enemies[0].x).toBe(100);
            expect(next.enemies[0].y).toBe(0);
        });

        it('should stop moving when STUNNED', () => {
            const enemy = createEnemy('e1');
            enemy.effects.push({ type: 'stun', power: 1, duration: 1, remaining: 1 });
            const state = { enemies: [enemy], hp: 20 } as GameState;
            const fakeMap = { paths: [{ id: 'path-main', points: [{ x: 0, y: 0 }, { x: 1000, y: 0 }] }] };

            const next = moveEnemies(state, fakeMap as any, 1.0);
            expect(next.enemies[0].x).toBe(0); // Did not move
        });

        it('should convert SLOW percentage to speed reduction', () => {
            const enemy = createEnemy('e1'); // Speed 100
            enemy.effects.push({ type: 'slow', power: 50, duration: 1, remaining: 1 }); // 50% slow
            const state = { enemies: [enemy], hp: 20 } as GameState;
            const fakeMap = { paths: [{ id: 'path-main', points: [{ x: 0, y: 0 }, { x: 1000, y: 0 }] }] };

            const next = moveEnemies(state, fakeMap as any, 1.0);
            expect(next.enemies[0].x).toBe(50); // Moved 50px instead of 100
        });

        it('should compound SLOW and SNARE multiplicatively', () => {
            const enemy = createEnemy('e1');
            enemy.effects.push({ type: 'slow', power: 50, duration: 1, remaining: 1 }); // 0.5x
            enemy.effects.push({ type: 'snare', power: 50, duration: 1, remaining: 1 }); // 0.5x -> Total 0.25x
            const state = { enemies: [enemy], hp: 20 } as GameState;
            const fakeMap = { paths: [{ id: 'path-main', points: [{ x: 0, y: 0 }, { x: 1000, y: 0 }] }] };

            const next = moveEnemies(state, fakeMap as any, 1.0);
            expect(next.enemies[0].x).toBe(25); // 100 * 0.5 * 0.5 = 25
        });
    });

    describe('DoT Mechanics', () => {
        it('should check Corrosive (Poison) extends DURATION', () => {
            let enemy = createEnemy('e1');
            const proj = createProj('p1', 'e1', 5, 'dot', 10);
            proj.damageType = 'corrosive';

            // First hit
            let enemies = applyDamage([enemy], 'e1', proj);
            let effect = enemies[0].effects[0];
            expect(effect.type).toBe('dot');
            expect(effect.damageType).toBe('corrosive');
            expect(effect.remaining).toBe(3);

            // Second hit (same projectile type)
            enemies = applyDamage(enemies, 'e1', proj);
            effect = enemies[0].effects[0];

            expect(effect.remaining).toBe(6); // 3 + 3
            expect(effect.power).toBe(10); // Power unchanged
        });

        it('should check Thermal (Fire) stacks INTENSITY', () => {
            let enemy = createEnemy('e1');
            const proj = createProj('p1', 'e1', 5, 'dot', 10);
            proj.damageType = 'thermal';

            // First hit
            let enemies = applyDamage([enemy], 'e1', proj);

            // Second hit
            enemies = applyDamage(enemies, 'e1', proj);
            const effect = enemies[0].effects[0];

            expect(effect.damageType).toBe('thermal');
            expect(effect.power).toBe(20); // 10 + 10
            expect(effect.remaining).toBe(3); // Refreshed to 3
        });
    });

    describe('Projectile Mechanics', () => {
        it('should PIERCE multiple enemies', () => {
            // Setup 3 enemies in a line
            const e1 = createEnemy('e1', 50, 100, 0); // Target
            const e2 = createEnemy('e2', 50, 110, 0); // Behind e1
            const e3 = createEnemy('e3', 50, 120, 0); // Behind e2 (out of range/pierce limit)

            // Projectile at 95,0 moving right. PierceCount = 1 (should hit 2 total: e1 + one more)
            const proj: Projectile = {
                id: 'p1', x: 95, y: 0, targetId: 'e1',
                speed: 1000, damage: 10, damageType: 'kinetic', special: 'none', specialPower: 0,
                towerId: 't1',
                pierceCount: 1,
                pierced: [],
                knockback: 0,
                homing: true
            };

            const state = {
                enemies: [e1, e2, e3],
                projectiles: [proj],
                score: 0
            } as GameState;

            // Update 1: Hit e1
            let next = moveProjectiles(state, 0.1);

            expect(next.projectiles).toHaveLength(1); // Projectile survives
            expect(next.projectiles[0].pierceCount).toBe(0); // Decremented
            expect(next.projectiles[0].pierced).toContain('e1'); // Recorded
            expect(next.enemies.find(e => e.id === 'e1')?.hp).toBe(40); // Damaged

            // Should retardget e2 (nearest non-pierced)
            // It might look like it's taking a frame to find target, but logic is: 
            // if (pierce > 0) re-push with targetId: ''.
            // Next frame finds target.

            // Update 2: Find new target (e2) and move toward it
            // With the fix for tunneling, it should hit e2 in this frame because dist (10) <= move (100)
            next = moveProjectiles(next, 0.1);

            // Check e2 hit
            expect(next.enemies.find(e => e.id === 'e2')?.hp).toBe(40); // Damaged
            expect(next.projectiles).toHaveLength(0); // Destroyed after pierceCount 0 used up
        });

        it('should CHAIN to nearby enemies', () => {
            const e1 = createEnemy('e1', 50, 100, 0);
            const e2 = createEnemy('e2', 50, 150, 0); // 50px away

            const proj: Projectile = {
                id: 'p1', x: 95, y: 0, targetId: 'e1',
                speed: 1000, damage: 10, damageType: 'electric', special: 'chain', specialPower: 2,
                towerId: 't1', pierceCount: 0, pierced: [], knockback: 0, homing: true
            };

            const state = {
                enemies: [e1, e2],
                projectiles: [proj],
                score: 0
            } as GameState;

            // Hit e1
            const next = moveProjectiles(state, 0.1);

            // e1 damaged
            expect(next.enemies.find(e => e.id === 'e1')?.hp).toBe(40);

            // New projectile spawned targeting e2
            expect(next.projectiles).toHaveLength(1);
            const chainProj = next.projectiles[0];
            expect(chainProj.targetId).toBe('e2');
            expect(chainProj.specialPower).toBe(1); // CHAIN count decremented
            expect(chainProj.damage).toBe(8); // 80% damage
        });
    });

    describe('Scoring Logic', () => {
        it('should award score when Projectile kills enemy', () => {
            const e1 = createEnemy('e1', 5); // 5 HP
            e1.value = 50;
            const proj = createProj('p1', 'e1', 10); // 10 Dmg

            const state = { enemies: [e1], projectiles: [proj], score: 0 } as GameState;
            const next = moveProjectiles(state, 0.1);

            expect(next.score).toBe(50);
            expect(next.enemies[0].alive).toBe(false);
        });

        it('should award score when DoT kills enemy', () => {
            const e1 = createEnemy('e1', 5);
            e1.value = 100;
            // Add deadly DoT
            e1.effects.push({ type: 'dot', power: 10, duration: 1, remaining: 1 });

            const state = { enemies: [e1], score: 0 } as GameState;
            const next = updateEffects(state, 1.0); // 1 sec tick = 10 dmg > 5 HP

            expect(next.score).toBe(100);
            expect(next.enemies[0].alive).toBe(false);
        });

        // This test confirms no double counting if we run both locally (simulated frame)
        // If we ran a full game loop it would be integration test, but unit tests suffice.
    });

});

describe('Advanced Mechanics', () => {
    it('should respect TARGET STRATEGIES (Strongest/Weakest/Furthest)', () => {
        const e1 = createEnemy('e1', 10); // Weak
        const e2 = createEnemy('e2', 100); // Strong
        e1.pathProgress = 0.9; // Furthest
        e2.pathProgress = 0.1;
        // set positions to verify nearest logic doesn't interfere
        e1.x = 1000; e2.x = 0;

        const tower = {
            id: 't1', x: 0, y: 0, range: 2000, cooldown: 0, fireRate: 1,
            targetStrategy: 'nearest', damage: 10, multishot: 0, knockback: 0, homing: true, special: 'none', specialPower: 0,
            targetId: null, angle: 0, primeCardDefId: 'c1', supportCardDefIds: [],
            zoneId: 'z1', damageType: 'kinetic'
        } as Tower;

        let state = { enemies: [e1, e2], towers: [tower], projectiles: [], score: 0 } as unknown as GameState;

        // Weakest
        tower.targetStrategy = 'weakest';
        tower.cooldown = 0;
        let next = updateTowers(state, 0.1);
        expect(next.towers[0].targetId).toBe('e1');

        // Strongest
        tower.targetStrategy = 'strongest';
        tower.cooldown = 0;
        next = updateTowers(state, 0.1);
        expect(next.towers[0].targetId).toBe('e2');

        // Furthest
        tower.targetStrategy = 'furthest';
        tower.cooldown = 0;
        next = updateTowers(state, 0.1);
        expect(next.towers[0].targetId).toBe('e1');
    });

    it('should fire MULTISHOT projectiles', () => {
        const e1 = createEnemy('e1', 100, 100, 0);
        const tower = {
            id: 't1', x: 0, y: 0, range: 200, cooldown: 0, fireRate: 1,
            multishot: 2, // 3 shots
            targetStrategy: 'nearest', damage: 10, knockback: 0, homing: true, special: 'none', specialPower: 0,
            targetId: null, angle: 0, primeCardDefId: 'c1', supportCardDefIds: [],
            zoneId: 'z1', damageType: 'kinetic'
        } as Tower;

        const state = { enemies: [e1], towers: [tower], projectiles: [], score: 0 } as unknown as GameState;
        const next = updateTowers(state, 0.1);

        expect(next.projectiles).toHaveLength(3);
        const angles = next.projectiles.map(p => p.angle).sort((a, b) => (a || 0) - (b || 0));
        expect(angles[1]).toBeCloseTo(0, 1);
        expect(angles[2]! - angles[0]!).toBeGreaterThan(0.4);
    });

    it('should generate resources with ECONOMY towers', () => {
        const tower = {
            id: 't1', x: 0, y: 0, range: 200, cooldown: 0, fireRate: 1,
            special: 'generate_energy', specialPower: 5,
            multishot: 0, knockback: 0, homing: true, targetStrategy: 'nearest',
            targetId: null, angle: 0, primeCardDefId: 'c1', supportCardDefIds: [],
            zoneId: 'z1', damageType: 'kinetic', damage: 0
        } as Tower;

        // Mock piles
        const state = { enemies: [], towers: [tower], projectiles: [], energy: 10, drawPile: [], discardPile: [], hand: [] } as unknown as GameState;
        const next = updateTowers(state, 0.1);

        expect(next.energy).toBe(15);
        expect(next.projectiles).toHaveLength(0);
    });

    it('should apply KNOCKBACK', () => {
        const e1 = createEnemy('e1', 100);
        e1.pathProgress = 0.5;
        e1.totalPathLength = 1000;

        const proj = {
            id: 'p1', x: 0, y: 0, targetId: 'e1', speed: 1000,
            damage: 0, damageType: 'kinetic', special: 'none', specialPower: 0,
            knockback: 100, homing: true, pierceCount: 0, pierced: [], towerId: 't1'
        } as Projectile;

        const result = applyDamage([e1], 'e1', proj);
        expect(result[0].pathProgress).toBeCloseTo(0.4, 2);
    });

    it('should apply VULNERABLE multiplier', () => {
        const e1 = createEnemy('e1', 100);
        e1.effects.push({ type: 'vulnerable', power: 50, duration: 2, remaining: 2 });

        const proj = {
            id: 'p1', x: 0, y: 0, targetId: 'e1', speed: 1000,
            damage: 10, damageType: 'kinetic', special: 'none', specialPower: 0,
            knockback: 0, homing: true, pierceCount: 0, pierced: [], towerId: 't1'
        } as Projectile;

        // 10 * 1.5 = 15
        const result = applyDamage([e1], 'e1', proj);
        expect(result[0].hp).toBe(85);
    });

    it('should deal PERCENT damage', () => {
        const e1 = createEnemy('e1', 200);
        e1.maxHp = 200;

        const proj = {
            id: 'p1', x: 0, y: 0, targetId: 'e1', speed: 1000,
            damage: 10,
            damageType: 'kinetic', special: 'percent', specialPower: 10, // 10% of 200 = 20
            knockback: 0, homing: true, pierceCount: 0, pierced: [], towerId: 't1'
        } as Projectile;

        // 10 + 20 = 30
        const result = applyDamage([e1], 'e1', proj);
        expect(result[0].hp).toBe(170);
    });

    it('should move LINEAR projectiles (non-homing) correctly', () => {
        // Place target far enough (200) so move (100) doesn't hit
        const e1 = createEnemy('e1', 100, 0, 200);

        const proj = {
            id: 'p1', x: 0, y: 0, targetId: 'e1', speed: 100,
            damage: 10, damageType: 'kinetic', special: 'none', specialPower: 0,
            knockback: 0, homing: false, angle: 0,
            pierceCount: 0, pierced: [], towerId: 't1'
        } as Projectile;

        const state = { enemies: [e1], projectiles: [proj], score: 0 } as unknown as GameState;
        const next = moveProjectiles(state, 1.0);

        // Proj moves 100px. e1 at 200px. Proj at 100.
        expect(next.projectiles[0].x).toBeCloseTo(100);
        expect(next.projectiles[0].y).toBeCloseTo(0);
        expect(next.enemies[0].hp).toBe(100); // No hit
    });
});
