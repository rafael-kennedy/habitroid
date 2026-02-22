
import { describe, it, expect } from 'vitest';
import { createGameState, moveEnemies } from './engine';
import { MAP_DEFINITIONS } from './map';
import { ENEMY_STATS, type EnemyType } from './types';

describe('Enemy Movement Reproduction', () => {
    it('should move fast enemies faster than basic enemies', () => {
        const mapId = 'map-serpent';
        const map = MAP_DEFINITIONS.find(m => m.id === mapId)!;

        // Mock state with one basic and one fast enemy
        // We manually inject them to avoid spawn logic delays
        const basicEnemy = {
            id: 'basic-1',
            type: 'basic' as EnemyType,
            hp: 100,
            maxHp: 100,
            speed: ENEMY_STATS.basic.speed,
            armor: 0,
            pathId: map.paths[0].id,
            pathProgress: 0,
            x: map.paths[0].points[0].x,
            y: map.paths[0].points[0].y,
            alive: true,
            effects: [],
            value: 10,
            totalPathLength: 1000, // Arbitrary, but same for both
            wanderPhase: 0,
            wanderAmplitude: 0
        };

        const fastEnemy = {
            id: 'fast-1',
            type: 'fast' as EnemyType,
            hp: 100,
            maxHp: 100,
            speed: ENEMY_STATS.fast.speed,
            armor: 0,
            pathId: map.paths[0].id,
            pathProgress: 0,
            x: map.paths[0].points[0].x,
            y: map.paths[0].points[0].y,
            alive: true,
            effects: [],
            value: 10,
            totalPathLength: 1000, // Same path length
            wanderPhase: 0,
            wanderAmplitude: 0
        };

        let state = createGameState(mapId, []);
        state.phase = 'COMBAT_PHASE';
        state.enemies = [basicEnemy, fastEnemy];

        // Simulate 1 second of movement
        const dt = 1.0;
        // Note: engine might not use dt directly if it clamps it, but updateGame calls moveEnemies with dt.
        // Let's call moveEnemies directly to avoid potential clamping in updateGame loop if we want raw logic test,
        // but updateGame is what we want to test for "real" behavior. 
        // However, updateGame might have other side effects. moveEnemies is pure enough.

        const nextState = moveEnemies(state, map, dt);

        const newBasic = nextState.enemies.find(e => e.id === 'basic-1')!;
        const newFast = nextState.enemies.find(e => e.id === 'fast-1')!;

        console.log(`Basic Progress: ${newBasic.pathProgress}`);
        console.log(`Fast Progress: ${newFast.pathProgress}`);

        expect(newFast.pathProgress).toBeGreaterThan(newBasic.pathProgress);
        expect(newFast.pathProgress).toBeCloseTo(newBasic.pathProgress * 2, 1);
    });
});
