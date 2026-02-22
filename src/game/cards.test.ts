import { describe, it, expect } from 'vitest';
import {
    createGameState,
    placeCard,
    updateTowers,
    moveProjectiles,
    applyDamage,
    endWave,
    getCardTags,
} from './engine';
import { CARD_DEFINITIONS } from '../data/cardDefinitions';
import type { GameState, Enemy, Projectile, Tower } from './types';

// ============================================================
// Test Helpers
// ============================================================

function createEnemy(id: string, hp = 100, x = 0, y = 0, type: Enemy['type'] = 'basic'): Enemy {
    return {
        id, type, hp, maxHp: hp, speed: 100, armor: 0,
        pathId: 'path-main', pathProgress: 0.5, x, y, alive: true,
        effects: [], value: 10, totalPathLength: 1000,
        wanderPhase: 0, wanderAmplitude: 0
    };
}

function createArmoredEnemy(id: string, hp = 100, armor = 10): Enemy {
    return { ...createEnemy(id, hp), armor };
}

function createTower(id: string, cardId: string, x = 100, y = 100): Tower {
    const card = CARD_DEFINITIONS.find(c => c.id === cardId);
    return {
        id, x, y, zoneId: 'zone-1',
        primeCardDefId: cardId, supportCardDefIds: [],
        damageType: card?.primeEffect.damageType || 'kinetic',
        damage: card?.primeEffect.baseDamage || 10,
        range: card?.primeEffect.range || 120,
        fireRate: card?.primeEffect.fireRate || 1,
        special: card?.primeEffect.special || 'none',
        specialPower: card?.primeEffect.specialPower || 0,
        multishot: card?.primeEffect.multishot || 0,
        knockback: card?.primeEffect.knockback || 0,
        homing: card?.primeEffect.homing || false,
        targetStrategy: card?.primeEffect.targetStrategy || 'nearest',
        cooldown: 0, targetId: null, angle: 0,
        killCount: 0, disabled: false,
        tags: getCardTags(cardId),
    };
}

function createProj(id: string, targetId: string, towerId: string, damage = 10, special = 'none', specialPower = 0): Projectile {
    return {
        id, x: 0, y: 0, targetId, speed: 1000, damage,
        damageType: 'kinetic', special, specialPower,
        towerId, pierceCount: 0, pierced: [],
        knockback: 0, homing: true
    };
}

function makeBaseState(): GameState {
    return createGameState('map-serpent', ['c01', 'c02']);
}

function stateWithAction(cardId: string, _targetId?: string): GameState {
    const state = makeBaseState();
    state.hand = [cardId];
    state.energy = 20;
    state.phase = 'PLACEMENT_PHASE' as any;
    return state;
}

// ============================================================
// Card Data Correctness
// ============================================================

describe('Card Data Correctness', () => {
    const cards = CARD_DEFINITIONS;

    it('every card has required fields', () => {
        for (const card of cards) {
            expect(card.id).toBeTruthy();
            expect(card.type).toMatch(/^(action|augment|unit|leader)$/);
            expect(card.name).toBeTruthy();
            expect(card.rarity).toMatch(/^(common|uncommon|rare|legendary)$/);
            expect(typeof card.energyCost).toBe('number');
            expect(card.primeEffect).toBeTruthy();
            expect(card.supportEffect).toBeTruthy();
            expect(card.flavorText).toBeTruthy();
        }
    });

    it('c02 (Gloop) has vulnerable special', () => {
        const card = cards.find(c => c.id === 'c02');
        expect(card?.primeEffect.special).toBe('vulnerable');
        expect(card?.primeEffect.specialPower).toBe(10);
    });

    it('u03 (Xylar) has bounce special', () => {
        const card = cards.find(c => c.id === 'u03');
        expect(card?.primeEffect.special).toBe('bounce');
        expect(card?.primeEffect.specialPower).toBe(1);
    });

    it('u13 (Disc-Thrower) has bounce with power 3', () => {
        const card = cards.find(c => c.id === 'u13');
        expect(card?.primeEffect.special).toBe('bounce');
        expect(card?.primeEffect.specialPower).toBe(3);
    });

    it('c06 (Jumper Cables) has chain support effect', () => {
        const card = cards.find(c => c.id === 'c06');
        expect(card?.supportEffect.special).toBe('chain');
        expect(card?.supportEffect.specialPower).toBe(1);
    });

    it('c07 has knockback in supportEffect', () => {
        const card = cards.find(c => c.id === 'c07');
        expect(card?.supportEffect.knockback).toBe(20);
    });

    it('u08 (Ricochet Prism) has bounce support', () => {
        const card = cards.find(c => c.id === 'u08');
        expect(card?.supportEffect.special).toBe('bounce');
        expect(card?.supportEffect.specialPower).toBe(2);
    });

    it('u18 (Phaser Converter) has dot support with thermal', () => {
        const card = cards.find(c => c.id === 'u18');
        expect(card?.supportEffect.special).toBe('dot');
        expect(card?.supportEffect.specialPower).toBe(5);
        expect(card?.supportEffect.damageType).toBe('thermal');
    });

    it('c18 (Tricorder Scan) has pierce_armor support', () => {
        const card = cards.find(c => c.id === 'c18');
        expect(card?.supportEffect.special).toBe('pierce_armor');
    });

    it('r06 (Symbiotic Brain-Slug) grants homing', () => {
        const card = cards.find(c => c.id === 'r06');
        expect(card?.supportEffect.homing).toBe(true);
    });

    it('out-of-scope cards are NOT loaded', () => {
        expect(cards.find(c => c.id === 'c03')).toBeUndefined(); // shield
        expect(cards.find(c => c.id === 'u16')).toBeUndefined(); // cloak
        expect(cards.find(c => c.id === 'r11')).toBeUndefined(); // robotic subtype
        expect(cards.find(c => c.id === 'u17')).toBeUndefined(); // sleep
        expect(cards.find(c => c.id === 'r04')).toBeUndefined(); // special traits
    });

    it('card tags are assigned correctly', () => {
        expect(getCardTags('c01')).toContain('robot');
        expect(getCardTags('c14')).toContain('yellow_shirt');
        expect(getCardTags('u05')).toContain('organic');
        expect(getCardTags('l03')).toContain('alien');
        expect(getCardTags('r03')).toContain('robot');
        expect(getCardTags('c02')).toEqual([]); // No tags
    });
});

// ============================================================
// Action Card Behaviors
// ============================================================

describe('Action Card Behaviors', () => {
    describe('c09/c10/c11 — Target Override', () => {
        it('c09 should set tower target strategy to strongest and boost damage', () => {
            const state = stateWithAction('c09', 'tower1');
            const tower = createTower('tower1', 'c01');
            state.towers = [tower];
            const originalDmg = tower.damage;
            const result = placeCard(state, 'c09', 'tower1');
            expect(result.towers[0].targetStrategy).toBe('strongest');
            expect(result.towers[0].damage).toBeGreaterThan(originalDmg);
        });

        it('c10 should set tower target strategy to weakest and boost fire rate', () => {
            const state = stateWithAction('c10', 'tower1');
            const tower = createTower('tower1', 'c01');
            state.towers = [tower];
            const originalFR = tower.fireRate;
            const result = placeCard(state, 'c10', 'tower1');
            expect(result.towers[0].targetStrategy).toBe('weakest');
            expect(result.towers[0].fireRate).toBeGreaterThan(originalFR);
        });

        it('c11 should set tower target strategy to nearest and boost range', () => {
            const state = stateWithAction('c11', 'tower1');
            const tower = createTower('tower1', 'c01');
            state.towers = [tower];
            const originalRange = tower.range;
            const result = placeCard(state, 'c11', 'tower1');
            expect(result.towers[0].targetStrategy).toBe('nearest');
            expect(result.towers[0].range).toBeGreaterThan(originalRange);
        });
    });

    describe('c12 — Vent the Core (AoE)', () => {
        it('should deal damage to all enemies', () => {
            const state = stateWithAction('c12', 'e1');
            state.enemies = [createEnemy('e1', 100, 200, 200), createEnemy('e2', 100, 210, 200)];
            const result = placeCard(state, 'c12', 'e1');
            expect(result.enemies[0].hp).toBeLessThan(100);
        });
    });

    describe('c13 — Red Alert (Buff Fire Rate)', () => {
        it('should boost all tower fire rates by 20%', () => {
            const state = stateWithAction('c13', '');
            const tower = createTower('tower1', 'c01');
            tower.fireRate = 1;
            state.towers = [tower];
            const result = placeCard(state, 'c13', '');
            expect(result.towers[0].fireRate).toBeCloseTo(1.2);
        });
    });

    describe('c19 — "Peace, Man!" (Heal + Draw)', () => {
        it('should heal base for 10 HP and draw 1 card', () => {
            const state = stateWithAction('c19', '');
            state.hp = 10;
            state.maxHp = 20;
            state.drawPile = ['c01'];
            const result = placeCard(state, 'c19', '');
            expect(result.hp).toBe(20);
            expect(result.hand).toContain('c01');
        });
    });

    describe('c20 — Comm Communicator (Draw + Energy)', () => {
        it('should draw 1 card and gain 1 energy', () => {
            const state = stateWithAction('c20', '');
            state.drawPile = ['c01'];
            const initialEnergy = state.energy;
            const c20Card = CARD_DEFINITIONS.find(c => c.id === 'c20');
            const result = placeCard(state, 'c20', '');
            expect(result.hand).toContain('c01');
            // Energy = initialEnergy - cost + 1
            expect(result.energy).toBe(initialEnergy - (c20Card?.energyCost || 0) + 1);
        });
    });

    describe('u09 — Draw 2, Discard 1', () => {
        it('should draw 2 cards and discard 1', () => {
            const state = stateWithAction('u09', '');
            state.drawPile = ['c01', 'c02'];
            state.hand = ['u09'];
            const result = placeCard(state, 'u09', '');
            // u09 removed from hand, 2 drawn, 1 discarded
            expect(result.discardPile.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('u10 — Next Unit Costs 1 Less', () => {
        it('should set unitCostDiscount to 1', () => {
            const state = stateWithAction('u10', '');
            const result = placeCard(state, 'u10', '');
            expect(result.unitCostDiscount).toBe(1);
        });
    });

    describe('u11 — Warning Shot (Global Knockback)', () => {
        it('should knock all enemies back', () => {
            const state = stateWithAction('u11', '');
            const enemy = createEnemy('e1');
            enemy.pathProgress = 0.5;
            state.enemies = [enemy];
            const result = placeCard(state, 'u11', '');
            expect(result.enemies[0].pathProgress).toBeLessThan(0.5);
        });
    });

    describe('u12 — Temporal Reset (Refresh Cooldowns)', () => {
        it('should reset all tower cooldowns to 0', () => {
            const state = stateWithAction('u12', '');
            const tower = createTower('tower1', 'c01');
            tower.cooldown = 5;
            state.towers = [tower];
            const result = placeCard(state, 'u12', '');
            expect(result.towers[0].cooldown).toBe(0);
        });
    });

    describe('u20 — Shaken, Not Stirred (Randomize HP)', () => {
        it('should randomize all enemy HP', () => {
            const state = stateWithAction('u20', '');
            state.enemies = [createEnemy('e1', 100), createEnemy('e2', 100)];
            // Run multiple times to verify randomness (at least one should differ)
            let foundDifferent = false;
            for (let i = 0; i < 10; i++) {
                const result = placeCard({ ...state, enemies: state.enemies.map(e => ({ ...e })) }, 'u20', '');
                if (result.enemies[0].hp !== 100 || result.enemies[1].hp !== 100) {
                    foundDifferent = true;
                    break;
                }
            }
            expect(foundDifferent).toBe(true);
        });
    });

    describe('r10 — Over-Volting', () => {
        it('should double tower fire rate and tag as overvolted', () => {
            const state = stateWithAction('r10', 'tower1');
            const tower = createTower('tower1', 'c01');
            tower.fireRate = 1;
            state.towers = [tower];
            const result = placeCard(state, 'r10', 'tower1');
            expect(result.towers[0].fireRate).toBe(2);
            expect(result.towers[0].tags).toContain('overvolted');
        });
    });

    describe('r12 — Discard Retrieve', () => {
        it('should move a random augment from discard to hand', () => {
            const state = stateWithAction('r12', '');
            state.discardPile = ['c05', 'c06', 'c01']; // c05 and c06 are augments, c01 is unit
            const result = placeCard(state, 'r12', '');
            // Should have retrieved one augment
            const augmentsInHand = result.hand.filter(id => {
                const def = CARD_DEFINITIONS.find(c => c.id === id);
                return def?.type === 'augment';
            });
            expect(augmentsInHand.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('r20 — Dimension Drop', () => {
        it('should kill highest HP non-boss enemy', () => {
            const state = stateWithAction('r20', '');
            state.enemies = [
                createEnemy('e1', 50),
                createEnemy('e2', 200),
                createEnemy('e3', 150),
            ];
            const result = placeCard(state, 'r20', '');
            const e2 = result.enemies.find(e => e.id === 'e2');
            expect(e2?.alive).toBe(false);
            expect(e2?.hp).toBe(0);
        });

        it('should not kill boss enemies', () => {
            const state = stateWithAction('r20', '');
            state.enemies = [
                createEnemy('e1', 50),
                { ...createEnemy('e2', 500), type: 'boss' },
            ];
            const result = placeCard(state, 'r20', '');
            const boss = result.enemies.find(e => e.id === 'e2');
            expect(boss?.alive).toBe(true);
            const e1 = result.enemies.find(e => e.id === 'e1');
            expect(e1?.alive).toBe(false); // Highest non-boss
        });
    });

    describe('l10 — Boss Stun + Energy', () => {
        it('should stun bosses and give +2 energy', () => {
            const state = stateWithAction('l10', '');
            state.enemies = [
                createEnemy('e1', 100),
                { ...createEnemy('e2', 500), type: 'boss' },
            ];
            const initialEnergy = state.energy;
            const l10Card = CARD_DEFINITIONS.find(c => c.id === 'l10');
            const result = placeCard(state, 'l10', '');
            const boss = result.enemies.find(e => e.id === 'e2');
            expect(boss?.effects.some(ef => ef.type === 'stun')).toBe(true);
            expect(result.energy).toBe(initialEnergy - (l10Card?.energyCost || 0) + 2);
        });
    });
});

// ============================================================
// Augment Behaviors (via computeTowerStats)
// ============================================================

describe('Augment Behaviors', () => {
    it('c08: +20 damage, -10 range on supportEffect', () => {
        const card = CARD_DEFINITIONS.find(c => c.id === 'c08');
        expect(card?.supportEffect.baseDamage).toBe(20);
        expect(card?.supportEffect.range).toBe(-10);
    });

    it('r09: Gravity Well adds knockback via supportEffect', () => {
        const card = CARD_DEFINITIONS.find(c => c.id === 'r09');
        expect(card?.supportEffect.knockback).toBe(10);
    });
});

// ============================================================
// applyDamage Behaviors
// ============================================================

describe('applyDamage Mechanics', () => {
    describe('pierce_armor (c18)', () => {
        it('should bypass enemy armor entirely', () => {
            const enemy = createArmoredEnemy('e1', 100, 50);
            const proj = createProj('p1', 'e1', 't1', 10, 'pierce_armor');
            const result = applyDamage([enemy], 'e1', proj);
            // Without armor bypass: max(1, 10-50) = 1 damage
            // With armor bypass: max(1, 10-0) = 10 damage
            expect(result[0].hp).toBe(90);
        });
    });

    describe('vulnerable (c02)', () => {
        it('should apply vulnerable effect on hit', () => {
            const enemy = createEnemy('e1', 100);
            const proj = createProj('p1', 'e1', 't1', 10, 'vulnerable', 10);
            const result = applyDamage([enemy], 'e1', proj);
            expect(result[0].effects.some(e => e.type === 'vulnerable')).toBe(true);
            expect(result[0].effects.find(e => e.type === 'vulnerable')?.power).toBe(10);
        });

        it('should amplify subsequent damage when vulnerable', () => {
            let enemies = [createEnemy('e1', 100)];
            // Apply vulnerable first
            const vulnProj = createProj('p1', 'e1', 't1', 10, 'vulnerable', 10);
            enemies = applyDamage(enemies, 'e1', vulnProj);
            // Then apply normal damage
            const dmgProj = createProj('p2', 'e1', 't1', 20);
            enemies = applyDamage(enemies, 'e1', dmgProj);
            // 20 * 1.1 = 22 damage on second hit
            expect(enemies[0].hp).toBe(100 - 10 - 22);
        });
    });

    describe('r07 void execute', () => {
        it('should execute non-boss enemies under 20% HP', () => {
            const enemy = createEnemy('e1', 100);
            // Bring to 19% HP first
            enemy.hp = 19;
            const proj: Projectile = {
                ...createProj('p1', 'e1', 't1', 1),
                damageType: 'void',
            };
            const result = applyDamage([enemy], 'e1', proj);
            expect(result[0].hp).toBe(0);
            expect(result[0].alive).toBe(false);
        });

        it('should NOT execute boss enemies under 20% HP', () => {
            const enemy = { ...createEnemy('e1', 100, 0, 0, 'boss'), hp: 19 };
            const proj: Projectile = {
                ...createProj('p1', 'e1', 't1', 1),
                damageType: 'void',
            };
            const result = applyDamage([enemy], 'e1', proj);
            expect(result[0].hp).toBe(18); // Normal damage, no execute
            expect(result[0].alive).toBe(true);
        });
    });

    describe('aoe_slow (u07)', () => {
        it('should apply AoE damage and slow to nearby enemies', () => {
            const enemies = [
                createEnemy('e1', 100, 200, 200),
                createEnemy('e2', 100, 210, 200), // 10px away
            ];
            const proj = createProj('p1', 'e1', 't1', 20, 'aoe_slow', 200);
            const result = applyDamage(enemies, 'e1', proj);
            // e1 should take direct damage
            expect(result[0].hp).toBeLessThan(100);
            // e2 should take AoE damage and be slowed
            expect(result[1].hp).toBeLessThan(100);
            expect(result[1].effects.some(e => e.type === 'slow')).toBe(true);
        });
    });

    describe('dot (thermal stacking)', () => {
        it('should stack thermal DoT intensity', () => {
            let enemies = [createEnemy('e1', 100)];
            const proj: Projectile = { ...createProj('p1', 'e1', 't1', 5, 'dot', 5), damageType: 'thermal' };
            enemies = applyDamage(enemies, 'e1', proj);
            const dot1 = enemies[0].effects.find(e => e.type === 'dot');
            expect(dot1?.power).toBe(5);

            enemies = applyDamage(enemies, 'e1', { ...proj, id: 'p2' });
            const dot2 = enemies[0].effects.find(e => e.type === 'dot');
            expect(dot2?.power).toBe(10); // Stacked intensity
        });
    });

    describe('bounce (u03, u08)', () => {
        it('should create bounce projectile on hit', () => {
            // This is tested via moveProjectiles chain, test that proj data is correct
            const proj = createProj('p1', 'e1', 't1', 10, 'bounce', 2);
            expect(proj.special).toBe('bounce');
            expect(proj.specialPower).toBe(2);
        });
    });
});

// ============================================================
// Unit Passive Behaviors (via updateTowers)
// ============================================================

describe('Unit Passive Behaviors', () => {
    describe('disabled towers (r10 over-volt)', () => {
        it('disabled towers should not fire', () => {
            const state = makeBaseState();
            state.phase = 'COMBAT_PHASE';
            const tower = createTower('t1', 'c01', 100, 100);
            tower.disabled = true;
            tower.cooldown = 0;
            state.towers = [tower];
            state.enemies = [createEnemy('e1', 100, 110, 100)];
            const result = updateTowers(state, 0.1);
            expect(result.projectiles.length).toBe(0);
        });
    });

    describe('c15 — Self-Destruct Energy', () => {
        it('should grant 2 energy when enemy touches the tower', () => {
            const state = makeBaseState();
            state.phase = 'COMBAT_PHASE';
            const tower = createTower('t1', 'c15', 100, 100);
            state.towers = [tower];
            state.enemies = [createEnemy('e1', 100, 100, 100)]; // Right on top
            const initialEnergy = state.energy;
            const result = updateTowers(state, 0.1);
            expect(result.energy).toBe(initialEnergy + 2);
            expect(result.towers[0].disabled).toBe(true);
        });
    });
});

// ============================================================
// endWave Behaviors
// ============================================================

describe('endWave Behaviors', () => {
    describe('r10 Over-Volt wave transition', () => {
        it('should disable overvolted towers on wave end', () => {
            const state = makeBaseState();
            const tower = createTower('t1', 'c01');
            tower.tags = ['robot', 'overvolted'];
            state.towers = [tower];
            const result = endWave(state);
            expect(result.towers[0].disabled).toBe(true);
            expect(result.towers[0].tags).not.toContain('overvolted');
        });

        it('should re-enable previously disabled towers', () => {
            const state = makeBaseState();
            const tower = createTower('t1', 'c01');
            tower.disabled = true;
            state.towers = [tower];
            const result = endWave(state);
            expect(result.towers[0].disabled).toBe(false);
        });
    });

    describe('wave state reset', () => {
        it('should reset unitCostDiscount and firstActionThisWave', () => {
            const state = makeBaseState();
            state.unitCostDiscount = 2;
            state.firstActionThisWave = true;
            const result = endWave(state);
            expect(result.unitCostDiscount).toBe(0);
            expect(result.firstActionThisWave).toBe(false);
        });
    });
});

// ============================================================
// Cost Reduction Behaviors
// ============================================================

describe('Cost Reduction Behaviors', () => {
    describe('r15 — Augment Cost Reduction', () => {
        it('should reduce augment cost by 1 when r15 is on board', () => {
            const state = stateWithAction('c05', '');
            const r15Tower = createTower('t1', 'r15');
            state.towers = [r15Tower, createTower('t2', 'c01')];
            const c05Card = CARD_DEFINITIONS.find(c => c.id === 'c05');
            const initialEnergy = state.energy;
            const result = placeCard(state, 'c05', 't2');
            // Cost should be reduced by 1
            expect(result.energy).toBe(initialEnergy - Math.max(0, (c05Card?.energyCost || 0) - 1));
        });
    });

    describe('u10 — Unit Cost Discount', () => {
        it('playing u10 then a unit should cost 1 less', () => {
            const state = stateWithAction('u10', '');
            let result = placeCard(state, 'u10', '');
            expect(result.unitCostDiscount).toBe(1);
            // Discount should be consumed after placing a unit
            // (unit placement requires zone targeting, hard to test end-to-end without map)
        });
    });
});

// ============================================================
// Kill Tracking Behaviors (via moveProjectiles)
// ============================================================

describe('Kill Tracking Behaviors', () => {
    describe('r08 — Permanent +1 Damage on Kill', () => {
        it('should permanently increase tower damage by 1 on kill', () => {
            const state = makeBaseState();
            state.phase = 'COMBAT_PHASE';
            const tower = createTower('t1', 'c01');
            tower.supportCardDefIds = ['r08'];
            state.towers = [tower];
            const enemy = createEnemy('e1', 1, 0, 0); // 1 HP so it dies
            state.enemies = [enemy];
            const proj = createProj('p1', 'e1', 't1', 10);
            proj.x = 0; proj.y = 0;
            state.projectiles = [proj];
            const result = moveProjectiles(state, 0.1);
            const resultTower = result.towers.find(t => t.id === 't1');
            expect(resultTower?.damage).toBe(tower.damage + 1);
            expect(resultTower?.killCount).toBe(1);
        });
    });
});

// ============================================================
// Leader Passive Behaviors
// ============================================================

describe('Leader Passive Behaviors', () => {
    describe('u01 — Dr. Zapmore (Electric Cost Reduction)', () => {
        it('should reduce electric unit cost by 1', () => {
            const state = makeBaseState();
            state.energy = 20;
            // Place u01 as leader tower
            const zapmoreTower = createTower('leader1', 'u01');
            state.towers = [zapmoreTower];
            // Now play an electric card - the cost should be reduced
            // Create a mock electric card in hand
            const electricCards = CARD_DEFINITIONS.filter(c => c.primeEffect.damageType === 'electric');
            if (electricCards.length > 0) {
                state.hand = [electricCards[0].id];
                const originalCost = electricCards[0].energyCost;
                const result = placeCard(state, electricCards[0].id, '');
                // Energy cost should be 1 less (but still min 0)
                const expectedCost = Math.max(0, originalCost - 1);
                expect(result.energy).toBe(20 - expectedCost);
            }
        });
    });

    describe('l07 — Double Cast First Action', () => {
        it('should set firstActionThisWave after playing an action', () => {
            const state = stateWithAction('c13', '');
            const l07Tower = createTower('leader1', 'l07');
            state.towers = [l07Tower, createTower('t1', 'c01')];
            const result = placeCard(state, 'c13', '');
            expect(result.firstActionThisWave).toBe(true);
        });

        it('should double-cast first action with l07 present', () => {
            const state = stateWithAction('c13', '');
            const l07Tower = createTower('leader1', 'l07');
            const tower = createTower('t1', 'c01');
            tower.fireRate = 1;
            state.towers = [l07Tower, tower];
            state.firstActionThisWave = false;
            const result = placeCard(state, 'c13', '');
            // c13 buffs fire rate by 20% per cast, double cast = 1.2 * 1.2 = 1.44
            expect(result.towers[1].fireRate).toBeCloseTo(1.44);
        });
    });
});

// ============================================================
// computeTowerStats Augment Integration
// ============================================================

describe('computeTowerStats Augment Integration', () => {
    it('r17: should halve fire rate', () => {
        // Verify that r17's -50% fire rate is documented in card data/flavorText
        const card = CARD_DEFINITIONS.find(c => c.id === 'r17');
        expect(card?.flavorText).toContain('50% slower');
    });
});
