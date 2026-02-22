// ---- Game Engine: Core Loop & State Machine ----

import type { GameState, Enemy, Tower, Projectile, EnemyType, ActiveEffect } from './types';
import { ENEMY_STATS } from './types';
import { MAP_DEFINITIONS } from './map';
import { CARD_DEFINITIONS } from '../data/cardDefinitions';
import { sampleSmoothPath } from './pathUtils';

// ---- Path Utilities ----

function getPathLength(points: { x: number; y: number }[]): number {
    const sampled = sampleSmoothPath(points);
    let len = 0;
    for (let i = 1; i < sampled.length; i++) {
        const dx = sampled[i].x - sampled[i - 1].x;
        const dy = sampled[i].y - sampled[i - 1].y;
        len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
}

function getPositionOnPath(points: { x: number; y: number }[], progress: number): { x: number; y: number; nx: number; ny: number } {
    const sampled = sampleSmoothPath(points);
    const totalLen = getPathLength(points);
    let targetDist = progress * totalLen;

    for (let i = 1; i < sampled.length; i++) {
        const dx = sampled[i].x - sampled[i - 1].x;
        const dy = sampled[i].y - sampled[i - 1].y;
        const segLen = Math.sqrt(dx * dx + dy * dy);

        if (targetDist <= segLen) {
            const t = segLen > 0 ? targetDist / segLen : 0;
            const nx = segLen > 0 ? -dy / segLen : 0;
            const ny = segLen > 0 ? dx / segLen : 0;
            return {
                x: sampled[i - 1].x + dx * t,
                y: sampled[i - 1].y + dy * t,
                nx,
                ny
            };
        }
        targetDist -= segLen;
    }

    let nx = 0, ny = 0;
    if (sampled.length > 1) {
        const lastDx = sampled[sampled.length - 1].x - sampled[sampled.length - 2].x;
        const lastDy = sampled[sampled.length - 1].y - sampled[sampled.length - 2].y;
        const lastLen = Math.sqrt(lastDx * lastDx + lastDy * lastDy);
        if (lastLen > 0) {
            nx = -lastDy / lastLen;
            ny = lastDx / lastLen;
        }
    }

    return { ...sampled[sampled.length - 1], nx, ny };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ---- Card Tags (archetype tagging for synergy cards) ----

// Card name/id → tags mapping for tribe synergies
const CARD_TAG_MAP: Record<string, string[]> = {
    'c01': ['robot'],       // B.O.B. (Bumbling Ordnance Bot)
    'c14': ['yellow_shirt'],// Yellow Shirt crew
    'c15': ['yellow_shirt'],// Yellow Shirt crew
    'c16': ['yellow_shirt'],// Yellow Shirt crew (Confuse Ring)
    'u05': ['organic'],     // Organic unit synergy
    'r03': ['robot'],       // Sparky
    'l03': ['alien'],       // Alien unit
    'l08': ['alien'],       // Alien unit (Hypnotizer)
};

export function getCardTags(cardId: string): string[] {
    return CARD_TAG_MAP[cardId] || [];
}

// ---- Initialize Game State ----

export function createGameState(mapId: string, deckCardDefIds: string[], upgrades: Record<string, number> = {}): GameState {
    const map = MAP_DEFINITIONS.find(m => m.id === mapId)!;

    // Find Leader in the deck
    const leaderCardId = deckCardDefIds.find(id => {
        const c = CARD_DEFINITIONS.find(def => def.id === id);
        return c?.type === 'leader';
    });

    // Remove Leader from the draw pile and shuffle
    const drawPileIds = leaderCardId ? deckCardDefIds.filter(id => id !== leaderCardId) : deckCardDefIds;
    const shuffled = [...drawPileIds].sort(() => Math.random() - 0.5);

    // Auto-spawn the Leader tower
    const towers: Tower[] = [];
    if (leaderCardId && map.placementZones && map.placementZones.length > 0) {
        const leaderDef = CARD_DEFINITIONS.find(c => c.id === leaderCardId);
        const coreZone = map.placementZones.find(z => z.id === 'base') || map.placementZones[0]; // Assuming 'base' or first zone

        if (leaderDef && coreZone) {
            towers.push({
                id: crypto.randomUUID(),
                x: coreZone.center.x,
                y: coreZone.center.y,
                zoneId: coreZone.id,
                primeCardDefId: leaderCardId,
                supportCardDefIds: [],
                damageType: leaderDef.primeEffect.damageType,
                damage: leaderDef.primeEffect.baseDamage,
                range: leaderDef.primeEffect.range,
                fireRate: leaderDef.primeEffect.fireRate,
                special: leaderDef.primeEffect.special,
                specialPower: leaderDef.primeEffect.specialPower,
                multishot: leaderDef.primeEffect.multishot,
                knockback: leaderDef.primeEffect.knockback,
                homing: leaderDef.primeEffect.homing,
                targetStrategy: leaderDef.primeEffect.targetStrategy,
                cooldown: 0,
                targetId: null,
                angle: 0,
                killCount: 0,
                disabled: false,
                tags: getCardTags(leaderCardId),
            });
        }
    }

    // Apply Upgrades
    const hullLevel = upgrades['hull_plating'] || 0;
    const reactorLevel = upgrades['reactor_core'] || 0;

    // Hull Plating: +10 HP per level
    const bonusHp = hullLevel * 10;
    const finalHp = map.startHP + bonusHp;

    // Reactor Core: +1 Energy per level
    const bonusEnergy = reactorLevel * 1;
    const finalEnergy = map.startEnergy + bonusEnergy;

    return {
        phase: 'DRAW_PHASE',
        mapId,
        deckId: '',
        currentWave: 0,
        totalWaves: Infinity,
        energy: finalEnergy,
        maxEnergy: finalEnergy,
        hp: finalHp,
        maxHp: finalHp,
        score: 0,
        enemies: [],
        towers,
        projectiles: [],
        hand: [],
        drawPile: shuffled,
        discardPile: [],
        selectedCardDefId: null,
        enemiesSpawned: 0,
        spawnTimer: 0,
        waveEnemies: [],
        waveEnergyYield: 0,
        waveComplete: false,
        unitCostDiscount: 0,
        firstActionThisWave: false,
    };
}

// ---- Phase Transitions ----

export function drawCards(state: GameState, targetHandSize: number = 3): GameState {
    const newState = { ...state };
    const currentHandSize = newState.hand.length;

    if (currentHandSize >= targetHandSize) return newState;

    const countToDraw = targetHandSize - currentHandSize;
    const toDraw = Math.min(countToDraw, newState.drawPile.length + newState.discardPile.length);

    for (let i = 0; i < toDraw; i++) {
        if (newState.drawPile.length === 0) {
            // Reshuffle discard into draw
            newState.drawPile = [...newState.discardPile].sort(() => Math.random() - 0.5);
            newState.discardPile = [];
        }
        if (newState.drawPile.length > 0) {
            newState.hand.push(newState.drawPile.pop()!);
        }
    }

    return { ...newState, phase: 'PLACEMENT_PHASE' };
}

export function startCombat(state: GameState): GameState {
    const map = MAP_DEFINITIONS.find(m => m.id === state.mapId)!;
    let waveGroups = map.waves[state.currentWave]?.enemies;

    // Endless Mode: Generate procedural wave if out of defined waves
    if (!waveGroups) {
        waveGroups = generateProceduralWave(state.currentWave);
    }

    // Expand wave enemies into a flat spawn list
    const waveEnemies: { type: EnemyType; delay: number }[] = [];
    for (const group of waveGroups) {
        for (let i = 0; i < group.count; i++) {
            waveEnemies.push({ type: group.type, delay: group.delay });
        }
    }

    const waveEnergyYield = waveEnemies.length > 0 ? 2.0 / waveEnemies.length : 0;

    // Keep the hand!
    // const discardPile = [...state.discardPile, ...state.hand];

    return {
        ...state,
        phase: 'COMBAT_PHASE',
        // hand: [], // Hand preserved
        discardPile: state.discardPile,
        selectedCardDefId: null,
        enemiesSpawned: 0,
        spawnTimer: 0,
        waveEnemies,
        waveEnergyYield,
        waveComplete: false,
    };
}

export function endWave(state: GameState): GameState {
    const map = MAP_DEFINITIONS.find(m => m.id === state.mapId)!;
    const nextWave = state.currentWave + 1;

    let towers = [...state.towers];
    let newEnergy = state.energy + map.energyPerWave;
    let newMaxEnergy = state.maxEnergy + map.energyPerWave;
    let newHp = state.hp;
    let newMaxHp = state.maxHp;

    // r10 Over-Volt: Disable towers that were overvolted this wave
    towers = towers.map(t => {
        if (t.tags.includes('overvolted')) {
            return { ...t, disabled: true, tags: t.tags.filter(tag => tag !== 'overvolted') };
        }
        // Re-enable previously disabled towers
        if (t.disabled) {
            return { ...t, disabled: false };
        }
        return t;
    });

    // l05 (Legendary Augment): Leaps to a random different unit each wave
    const l05Holders = towers.filter(t => t.supportCardDefIds.includes('l05'));
    for (const holder of l05Holders) {
        // Remove l05 from current holder
        const newSupportIds = holder.supportCardDefIds.filter(id => id !== 'l05');
        const updatedHolder = computeTowerStats({ ...holder, supportCardDefIds: newSupportIds });

        // Find a different non-leader tower to leap to
        const candidates = towers.filter(t =>
            t.id !== holder.id &&
            CARD_DEFINITIONS.find(c => c.id === t.primeCardDefId)?.type !== 'leader'
        );
        if (candidates.length > 0) {
            const newHost = candidates[Math.floor(Math.random() * candidates.length)];
            const updatedHost = computeTowerStats({
                ...newHost,
                supportCardDefIds: [...newHost.supportCardDefIds, 'l05'],
            });
            towers = towers.map(t => {
                if (t.id === holder.id) return updatedHolder;
                if (t.id === newHost.id) return updatedHost;
                return t;
            });
        }
    }

    // l02 Leader: HP resets to 1, gains are handled by kill tracking in updateEffects
    const hasL02 = towers.some(t => t.primeCardDefId === 'l02');
    if (hasL02) {
        newHp = 1;
        newMaxHp = 1; // Starts at 1, grows via kills
    }

    // c04: If placed adjacent to Leader, generate +1 energy per wave
    const leaderTower = towers.find(t => {
        const def = CARD_DEFINITIONS.find(c => c.id === t.primeCardDefId);
        return def?.type === 'leader';
    });
    if (leaderTower) {
        const c04Towers = towers.filter(t => t.primeCardDefId === 'c04');
        for (const c04 of c04Towers) {
            const d = dist(leaderTower, c04);
            if (d <= 150) { // Adjacent = within 150px
                newEnergy += 1;
            }
        }
    }

    // Reset wave-specific kill counts for non-persistent effects
    towers = towers.map(t => ({ ...t }));

    return {
        ...state,
        phase: 'DRAW_PHASE',
        currentWave: nextWave,
        energy: newEnergy,
        maxEnergy: newMaxEnergy,
        hp: newHp,
        maxHp: newMaxHp,
        towers,
        projectiles: [],
        unitCostDiscount: 0,
        firstActionThisWave: false,
    };
}

// ---- Place Tower ----

export function placeCard(state: GameState, cardDefId: string, targetId: string): GameState {
    const cardDef = CARD_DEFINITIONS.find(c => c.id === cardDefId);
    if (!cardDef) return state;

    // Leader Passives for Cost
    let actualCost = cardDef.energyCost;
    const hasZapmore = state.towers.some(t => t.primeCardDefId === 'u01');
    if (hasZapmore && cardDef.primeEffect.damageType === 'electric') {
        actualCost = Math.max(0, actualCost - 1);
    }

    // r15 (Augment cost reduction): While on board, all augments cost 1 less
    if (cardDef.type === 'augment') {
        const hasR15 = state.towers.some(t => t.primeCardDefId === 'r15');
        if (hasR15) {
            actualCost = Math.max(0, actualCost - 1);
        }
    }

    // u10 discount (next unit costs 1 less)
    if (cardDef.type === 'unit' && state.unitCostDiscount > 0) {
        actualCost = Math.max(0, actualCost - state.unitCostDiscount);
    }

    if (state.energy < actualCost) return state;

    let newTowers = [...state.towers];
    let newEnemies = [...state.enemies];
    let newHp = state.hp;
    let newEnergy = state.energy - actualCost;
    let newHand = [...state.hand];
    let newDrawPile = [...state.drawPile];
    let newDiscardPile = [...state.discardPile];
    let newUnitCostDiscount = state.unitCostDiscount;
    let newFirstActionThisWave = state.firstActionThisWave;

    if (cardDef.type === 'action') {
        // l07 double-cast: First action each wave is cast twice
        const hasL07 = state.towers.some(t => t.primeCardDefId === 'l07');
        const shouldDoubleCast = hasL07 && !state.firstActionThisWave;
        newFirstActionThisWave = true;

        const castCount = shouldDoubleCast ? 2 : 1;
        for (let cast = 0; cast < castCount; cast++) {
            // ---- Card-specific action handlers ----

            if (cardDef.id === 'c09' || cardDef.id === 'c10' || cardDef.id === 'c11') {
                // Target Override actions: apply to targeted tower
                let targetTower = newTowers.find(t => t.id === targetId);
                if (!targetTower) targetTower = newTowers.find(t => t.zoneId === targetId);
                if (targetTower) {
                    const updatedTower = { ...targetTower };
                    updatedTower.targetStrategy = cardDef.primeEffect.targetStrategy;
                    if (cardDef.id === 'c09') updatedTower.damage = Math.round(updatedTower.damage * 1.15); // +15% dmg
                    if (cardDef.id === 'c10') updatedTower.fireRate *= 1.15; // +15% fire rate
                    if (cardDef.id === 'c11') updatedTower.range += 10; // +10 range
                    newTowers = newTowers.map(t => t.id === updatedTower.id ? updatedTower : t);
                }
            } else if (cardDef.id === 'c19') {
                // "Peace, Man!" — Heal base for 10, draw 1 card
                newHp = Math.min(state.maxHp, newHp + 10);
                if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
                    newDrawPile = [...newDiscardPile].sort(() => Math.random() - 0.5);
                    newDiscardPile = [];
                }
                if (newDrawPile.length > 0) {
                    newHand.push(newDrawPile.pop()!);
                }
            } else if (cardDef.id === 'u09') {
                // Draw 2 cards, discard 1 (auto-discard oldest card in hand)
                for (let i = 0; i < 2; i++) {
                    if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
                        newDrawPile = [...newDiscardPile].sort(() => Math.random() - 0.5);
                        newDiscardPile = [];
                    }
                    if (newDrawPile.length > 0) {
                        newHand.push(newDrawPile.pop()!);
                    }
                }
                // Auto-discard one card (the first card in hand)
                if (newHand.length > 0) {
                    newDiscardPile.push(newHand.shift()!);
                }
            } else if (cardDef.id === 'u10') {
                // Next unit costs 1 less this wave
                newUnitCostDiscount += 1;
            } else if (cardDef.id === 'u20') {
                // Randomize all enemy HP
                newEnemies = newEnemies.map(e => {
                    if (!e.alive) return e;
                    const randomHp = Math.max(1, Math.floor(Math.random() * e.maxHp));
                    return { ...e, hp: randomHp };
                });
            } else if (cardDef.id === 'r10') {
                // Over-Volting: Target tower gets +100% fire rate this wave, disabled next wave
                let targetTower = newTowers.find(t => t.id === targetId);
                if (!targetTower) targetTower = newTowers.find(t => t.zoneId === targetId);
                if (targetTower) {
                    const updatedTower = { ...targetTower, fireRate: targetTower.fireRate * 2, disabled: false };
                    // Mark with a special tag so endWave knows to disable it
                    updatedTower.tags = [...updatedTower.tags, 'overvolted'];
                    newTowers = newTowers.map(t => t.id === updatedTower.id ? updatedTower : t);
                }
            } else if (cardDef.id === 'r12') {
                // Return a random Augment from discard pile to hand
                const augmentIndices = newDiscardPile
                    .map((id, idx) => ({ id, idx }))
                    .filter(({ id }) => {
                        const def = CARD_DEFINITIONS.find(c => c.id === id);
                        return def?.type === 'augment';
                    });
                if (augmentIndices.length > 0) {
                    const pick = augmentIndices[Math.floor(Math.random() * augmentIndices.length)];
                    newDiscardPile.splice(pick.idx, 1);
                    newHand.push(pick.id);
                }
            } else if (cardDef.id === 'r19') {
                // Copy augments from one tower to another
                // targetId = "sourceId:destId" format, or just apply to targeted tower
                // Simplified: copy all augments from the first tower with augments to the targeted tower
                const destTower = newTowers.find(t => t.id === targetId || t.zoneId === targetId);
                if (destTower) {
                    const sourceTower = newTowers.find(t => t.id !== destTower.id && t.supportCardDefIds.length > 0);
                    if (sourceTower) {
                        const updatedDest = computeTowerStats({
                            ...destTower,
                            supportCardDefIds: [...destTower.supportCardDefIds, ...sourceTower.supportCardDefIds],
                        });
                        newTowers = newTowers.map(t => t.id === updatedDest.id ? updatedDest : t);
                    }
                }
            } else if (cardDef.id === 'r20') {
                // Drop highest HP non-boss enemy out of dimension
                const nonBossEnemies = newEnemies.filter(e => e.alive && e.type !== 'boss');
                if (nonBossEnemies.length > 0) {
                    const highest = nonBossEnemies.reduce((a, b) => a.hp > b.hp ? a : b);
                    newEnemies = newEnemies.map(e => e.id === highest.id ? { ...e, hp: 0, alive: false } : e);
                }
            } else if (cardDef.id === 'l06') {
                // Obliterate enemies near target, scorch mark damages walkers for 10s
                const targetEnemy = newEnemies.find(e => e.id === targetId);
                if (targetEnemy) {
                    newEnemies = newEnemies.map(e => {
                        if (!e.alive) return e;
                        const d = dist(e, targetEnemy);
                        if (d <= 150) {
                            const newHpVal = e.hp - 100; // massive damage
                            if (newHpVal <= 0) return { ...e, hp: 0, alive: false, effects: [] };
                            // Apply a long DoT (scorch mark)
                            return {
                                ...e,
                                hp: newHpVal,
                                effects: [...e.effects, { type: 'dot' as const, power: 5, duration: 10, remaining: 10 }]
                            };
                        }
                        return e;
                    });
                } else {
                    // Global damage
                    newEnemies = newEnemies.map(e => {
                        if (!e.alive) return e;
                        const newHpVal = e.hp - 100;
                        if (newHpVal <= 0) return { ...e, hp: 0, alive: false, effects: [] };
                        return { ...e, hp: newHpVal, effects: [...e.effects, { type: 'dot' as const, power: 5, duration: 10, remaining: 10 }] };
                    });
                }
            } else if (cardDef.id === 'l10') {
                // Stun all bosses permanently until attacked, +2 energy
                newEnemies = newEnemies.map(e => {
                    if (e.alive && e.type === 'boss') {
                        return { ...e, effects: [...e.effects, { type: 'stun' as const, power: 0, duration: 999, remaining: 999 }] };
                    }
                    return e;
                });
                newEnergy += 2;
            } else if (cardDef.id === 'u19') {
                // Zone slow + armor strip: enemies near target slowed 50%, lose armor
                const targetEnemy = newEnemies.find(e => e.id === targetId);
                const center = targetEnemy ? { x: targetEnemy.x, y: targetEnemy.y } : { x: 0, y: 0 };
                newEnemies = newEnemies.map(e => {
                    if (!e.alive) return e;
                    const d = dist(e, center);
                    if (d <= 150) {
                        return {
                            ...e,
                            armor: 0,
                            effects: [...e.effects, { type: 'slow' as const, power: 50, duration: 5, remaining: 5 }]
                        };
                    }
                    return e;
                });
            } else if (cardDef.primeEffect.special === 'aoe') {
                // Generic AoE damage
                const target = newEnemies.find(e => e.id === targetId);
                if (target) {
                    newEnemies = newEnemies.map(e => {
                        if (!e.alive) return e;
                        const d = dist(e, target);
                        if (d <= cardDef.primeEffect.specialPower) {
                            const newHpVal = e.hp - cardDef.primeEffect.baseDamage;
                            return { ...e, hp: newHpVal, alive: newHpVal > 0 };
                        }
                        return e;
                    });
                } else {
                    newEnemies = newEnemies.map(e => ({
                        ...e,
                        hp: e.hp - cardDef.primeEffect.baseDamage,
                        alive: e.hp - cardDef.primeEffect.baseDamage > 0
                    }));
                }
            } else if (cardDef.primeEffect.special === 'stun') {
                newEnemies = newEnemies.map(e => ({
                    ...e,
                    effects: [...e.effects, { type: 'stun' as const, power: 0, duration: cardDef.primeEffect.specialPower, remaining: cardDef.primeEffect.specialPower }]
                }));
            } else if (cardDef.primeEffect.damageType === 'kinetic' && cardDef.primeEffect.baseDamage < 0) {
                const healAmount = Math.abs(cardDef.primeEffect.baseDamage);
                newHp = Math.min(state.maxHp, newHp + healAmount);
            } else if (cardDef.primeEffect.special === 'buff_firerate') {
                newTowers = newTowers.map(t => ({ ...t, fireRate: t.fireRate * 1.2 }));
            } else if (cardDef.primeEffect.special === 'draw_card') {
                if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
                    newDrawPile = [...newDiscardPile].sort(() => Math.random() - 0.5);
                    newDiscardPile = [];
                }
                if (newDrawPile.length > 0) {
                    newHand.push(newDrawPile.pop()!);
                }
                newEnergy += 1;
            } else if (cardDef.primeEffect.special === 'global_knockback') {
                newEnemies = newEnemies.map(e => ({ ...e, pathProgress: Math.max(0, e.pathProgress - 0.05) }));
            } else if (cardDef.primeEffect.special === 'refresh_cooldowns') {
                newTowers = newTowers.map(t => ({ ...t, cooldown: 0 }));
            } else {
                // Default: deal direct damage to targeted enemy
                const targetIdx = newEnemies.findIndex(e => e.id === targetId);
                if (targetIdx >= 0) {
                    const newHpVal = newEnemies[targetIdx].hp - cardDef.primeEffect.baseDamage;
                    newEnemies[targetIdx] = { ...newEnemies[targetIdx], hp: newHpVal, alive: newHpVal > 0 };
                }
            }
        } // end cast loop
    }
    else if (cardDef.type === 'augment') {
        // targetId could be a tower ID or a zone ID
        let targetTower = newTowers.find(t => t.id === targetId);
        if (!targetTower) {
            targetTower = newTowers.find(t => t.zoneId === targetId);
        }
        if (!targetTower) return state; // Invalid target for augment

        // Add as support card
        const supportDefs = [...targetTower.supportCardDefIds, cardDefId];
        const updatedTower = computeTowerStats({
            ...targetTower,
            supportCardDefIds: supportDefs,
        });
        newTowers = newTowers.map(t => t.id === targetTower.id ? updatedTower : t);
    }
    else if (cardDef.type === 'unit') {
        const map = MAP_DEFINITIONS.find(m => m.id === state.mapId)!;
        const zone = map.placementZones.find(z => z.id === targetId);
        if (!zone) return state;

        // Check if tower already exists in this zone
        const existingTower = newTowers.find(t => t.zoneId === targetId);
        if (existingTower) return state; // Cannot place unit on occupied zone

        const tower: Tower = {
            id: crypto.randomUUID(),
            x: zone.center.x,
            y: zone.center.y,
            zoneId: targetId,
            primeCardDefId: cardDefId,
            supportCardDefIds: [],
            damageType: cardDef.primeEffect.damageType,
            damage: cardDef.primeEffect.baseDamage,
            range: cardDef.primeEffect.range,
            fireRate: cardDef.primeEffect.fireRate,
            special: cardDef.primeEffect.special,
            specialPower: cardDef.primeEffect.specialPower,
            multishot: cardDef.primeEffect.multishot,
            knockback: cardDef.primeEffect.knockback,
            homing: cardDef.primeEffect.homing,
            targetStrategy: cardDef.primeEffect.targetStrategy,
            cooldown: 0,
            targetId: null,
            angle: 0,
            killCount: 0,
            disabled: false,
            tags: getCardTags(cardDefId),
        };
        newTowers.push(tower);

        // Reset unit cost discount after placing unit
        newUnitCostDiscount = 0;
    }
    else {
        // type === 'leader' cannot be played dynamically
        return state;
    }

    // Remove card from hand
    const handIdx = newHand.indexOf(cardDefId);
    if (handIdx >= 0) newHand.splice(handIdx, 1);

    return {
        ...state,
        towers: newTowers,
        enemies: newEnemies,
        hand: newHand,
        drawPile: newDrawPile,
        discardPile: newDiscardPile,
        energy: newEnergy,
        hp: newHp,
        selectedCardDefId: null,
        unitCostDiscount: newUnitCostDiscount,
        firstActionThisWave: newFirstActionThisWave,
    };
}

function computeTowerStats(tower: Tower): Tower {
    const primeDef = CARD_DEFINITIONS.find(c => c.id === tower.primeCardDefId);
    if (!primeDef) return tower;

    let damage = primeDef.primeEffect.baseDamage;
    let range = primeDef.primeEffect.range;
    let fireRate = primeDef.primeEffect.fireRate;
    let special = primeDef.primeEffect.special;
    let specialPower = primeDef.primeEffect.specialPower;
    let damageType = primeDef.primeEffect.damageType;

    let multishot = 0;
    let knockback = 0;
    let homing = primeDef.primeEffect.homing;
    let targetStrategy = primeDef.primeEffect.targetStrategy;

    for (const supportId of tower.supportCardDefIds) {
        const sDef = CARD_DEFINITIONS.find(c => c.id === supportId);
        if (sDef) {
            damage += sDef.supportEffect.baseDamage;
            range += sDef.supportEffect.range;
            fireRate += sDef.supportEffect.fireRate;

            multishot += sDef.supportEffect.multishot;
            knockback += sDef.supportEffect.knockback;

            // Augment special override: if augment has a non-none special, it overrides tower special
            // This lets c06 add chain, u08 add bounce, u18 add dot, c18 add pierce_armor etc.
            if (sDef.supportEffect.special !== 'none') {
                special = sDef.supportEffect.special;
                specialPower = sDef.supportEffect.specialPower || specialPower;
            } else {
                specialPower += sDef.supportEffect.specialPower;
            }

            // Override damage type if augment specifies one (e.g., u18 thermal, r07 void)
            if (sDef.supportEffect.damageType !== 'kinetic') {
                damageType = sDef.supportEffect.damageType;
            }

            // Override homing: augment can grant homing (r06)
            if (sDef.supportEffect.homing === true) homing = true;

            // Override strategy if not default
            if (sDef.supportEffect.targetStrategy !== 'nearest') {
                targetStrategy = sDef.supportEffect.targetStrategy;
            }
        }
    }

    // r17: -50% fire rate tradeoff
    if (tower.supportCardDefIds.includes('r17')) {
        fireRate *= 0.5;
    }

    return {
        ...tower,
        damageType,
        damage,
        range,
        fireRate,
        special,
        specialPower,
        multishot: multishot + primeDef.primeEffect.multishot,
        knockback: knockback + primeDef.primeEffect.knockback,
        homing,
        targetStrategy,
        angle: tower.angle
    };
}

// ---- Main Update Tick ----

export function updateGame(state: GameState, dt: number): GameState {
    if (state.phase !== 'COMBAT_PHASE') return state;

    let s = { ...state, enemies: [...state.enemies], projectiles: [...state.projectiles] };
    const map = MAP_DEFINITIONS.find(m => m.id === s.mapId)!;

    // 1. Spawn enemies
    s = spawnEnemies(s, map, dt);

    // 2. Move enemies
    s = moveEnemies(s, map, dt);

    // 3. Update effects on enemies
    s = updateEffects(s, dt);

    // 4. Tower targeting & shooting
    s = updateTowers(s, dt);

    // 5. Move projectiles
    s = moveProjectiles(s, dt);

    // 6. Check wave end
    if (s.waveEnemies.length === 0 && s.enemiesSpawned > 0 && s.enemies.every(e => !e.alive)) {
        s.waveComplete = true;
    }

    // 7. Check game over
    if (s.hp <= 0) {
        s.phase = 'GAME_OVER';
        s.hp = 0;
    }

    return s;
}

export function spawnEnemies(state: GameState, map: ReturnType<typeof MAP_DEFINITIONS.find> & object, dt: number): GameState {
    if (!map) return state;
    if (state.waveEnemies.length === 0) return state;

    let s = { ...state };
    s.spawnTimer -= dt;

    while (s.spawnTimer <= 0 && s.waveEnemies.length > 0) {
        const spawn = s.waveEnemies[0];
        s.waveEnemies = s.waveEnemies.slice(1);

        const stats = ENEMY_STATS[spawn.type];
        // Scale stats with wave number
        const waveScale = 1 + (s.currentWave * 0.15);

        const pathIdx = s.enemiesSpawned % map.paths.length;
        const path = map.paths[pathIdx];

        const enemy: Enemy = {
            id: crypto.randomUUID(),
            type: spawn.type,
            hp: Math.round(stats.hp * waveScale),
            maxHp: Math.round(stats.hp * waveScale),
            speed: stats.speed,
            armor: stats.armor,
            pathId: path.id,
            pathProgress: 0,
            x: path.points[0].x,
            y: path.points[0].y,
            alive: true,
            effects: [],
            value: stats.value,
            totalPathLength: getPathLength(path.points),
            wanderPhase: Math.random() * 2 * Math.PI,
            wanderAmplitude: 3 + Math.random() * 5
        };

        s.enemies = [...s.enemies, enemy];
        s.enemiesSpawned++;
        s.spawnTimer = spawn.delay;
    }

    return s;
}

export function moveEnemies(state: GameState, map: ReturnType<typeof MAP_DEFINITIONS.find> & object, dt: number): GameState {
    if (!map) return state;
    let hp = state.hp;

    const enemies = state.enemies.map(enemy => {
        if (!enemy.alive) return enemy;

        // Check for stun
        const stunned = enemy.effects.some(e => e.type === 'stun' && e.remaining > 0);
        if (stunned) return enemy;

        const path = map.paths.find(p => p.id === enemy.pathId);
        if (!path) return enemy;

        const pathLen = getPathLength(path.points);
        let speed = enemy.speed;

        // Apply slow effects
        const slowEffect = enemy.effects.find(e => e.type === 'slow' && e.remaining > 0);
        if (slowEffect) {
            speed *= (1 - slowEffect.power / 100);
        }

        const snareEffect = enemy.effects.find(e => e.type === 'snare' && e.remaining > 0);
        if (snareEffect) {
            speed *= (1 - snareEffect.power / 100);
        }

        const progressDelta = (speed * dt) / pathLen;
        const newProgress = enemy.pathProgress + progressDelta;

        if (newProgress >= 1) {
            // Enemy reached the end
            hp--;
            return { ...enemy, alive: false, pathProgress: 1 };
        }

        const pos = getPositionOnPath(path.points, newProgress);
        const offset = enemy.wanderAmplitude * Math.sin(newProgress * 10 * Math.PI + enemy.wanderPhase);

        return {
            ...enemy,
            pathProgress: newProgress,
            x: pos.x + pos.nx * offset,
            y: pos.y + pos.ny * offset
        };
    });

    return { ...state, enemies, hp };
}

export function updateEffects(state: GameState, dt: number): GameState {
    const enemies = state.enemies.map(enemy => {
        if (!enemy.alive) return enemy;

        let hp = enemy.hp;
        const effects: ActiveEffect[] = [];

        for (const effect of enemy.effects) {
            // Apply DOT damage every frame if active
            if (effect.type === 'dot') {
                hp -= effect.power * dt;
            }

            const remaining = effect.remaining - dt;
            if (remaining > 0) {
                effects.push({ ...effect, remaining });
            }
        }

        if (hp <= 0) {
            return { ...enemy, hp: 0, alive: false, effects: [] };
        }

        return { ...enemy, hp, effects };
    });

    // Add score and energy for killed enemies
    let score = state.score;
    let energy = state.energy;

    for (let i = 0; i < enemies.length; i++) {
        if (!enemies[i].alive && state.enemies[i].alive && enemies[i].hp <= 0) {
            score += enemies[i].value;
            energy += state.waveEnergyYield || 0;
        }
    }

    // Cap energy? Maybe not.
    return { ...state, enemies, score, energy };
}

export function updateTowers(state: GameState, dt: number): GameState {
    const towers = [...state.towers];
    let projectiles = [...state.projectiles];
    let enemies = [...state.enemies];
    let energy = state.energy;
    let hp = state.hp;

    // Pre-compute global passives
    const hasR13 = towers.some(t => t.primeCardDefId === 'r13'); // Global +15 range, +1 pierce
    const robotCount = towers.filter(t => (t.tags || []).includes('robot')).length;
    const yellowShirtCount = towers.filter(t => (t.tags || []).includes('yellow_shirt')).length;

    // u04 Aura Slow: Apply slow aura each tick to enemies in range
    for (const tower of towers) {
        if (tower.primeCardDefId === 'u04' && !tower.disabled) {
            enemies = enemies.map(e => {
                if (!e.alive) return e;
                const d = dist(tower, e);
                if (d <= tower.range) {
                    // Apply/refresh aura slow
                    const existingSlow = e.effects.find(ef => ef.type === 'slow');
                    if (!existingSlow) {
                        return { ...e, effects: [...e.effects, { type: 'slow' as const, power: 20, duration: 0.5, remaining: 0.5 }] };
                    }
                }
                return e;
            });
        }
    }

    for (let i = 0; i < towers.length; i++) {
        const tower = { ...towers[i] };

        // Skip disabled towers
        if (tower.disabled) {
            towers[i] = tower;
            continue;
        }

        tower.cooldown = Math.max(0, tower.cooldown - dt);

        // Economy Mechanics
        if (tower.special === 'generate_energy') {
            if (tower.cooldown <= 0) {
                energy += tower.specialPower;
                tower.cooldown = 1 / tower.fireRate;
            }
            towers[i] = tower;
            continue;
        }
        if (tower.special === 'draw_card') {
            if (tower.cooldown <= 0) {
                if (state.drawPile.length > 0 || state.discardPile.length > 0) {
                    const drawCount = Math.floor(tower.specialPower) || 1;
                    for (let k = 0; k < drawCount; k++) {
                        if (state.drawPile.length === 0 && state.discardPile.length > 0) {
                            state.drawPile = [...state.discardPile].sort(() => Math.random() - 0.5);
                            state.discardPile = [];
                        }
                        if (state.drawPile.length > 0) {
                            state.hand.push(state.drawPile.pop()!);
                        }
                    }
                }
                tower.cooldown = 1 / tower.fireRate;
            }
            towers[i] = tower;
            continue;
        }

        // c15: Self-destruct unit (dies when enemy reaches it, grants 2 energy)
        if (tower.primeCardDefId === 'c15') {
            const nearbyEnemy = enemies.find(e => e.alive && dist(tower, e) <= 30);
            if (nearbyEnemy) {
                energy += 2;
                // Remove tower by marking it (we can't splice during iteration)
                tower.disabled = true; // Effectively remove
                towers[i] = tower;
                continue;
            }
        }

        // Compute effective stats with unit passives
        let effectiveDamage = tower.damage;
        let effectiveRange = tower.range;
        let effectiveFireRate = tower.fireRate;
        let effectivePierceCount = tower.special === 'pierce' ? tower.specialPower : 0;

        // r13 Leader: All units +15 range, +1 pierce
        if (hasR13) {
            effectiveRange += 15;
            effectivePierceCount += 1;
        }

        // c01 Robot Synergy: +15% Fire Rate per OTHER robot
        if (tower.primeCardDefId === 'c01') {
            const otherRobots = robotCount - 1; // Don't count itself
            if (otherRobots > 0) {
                effectiveFireRate *= (1 + 0.15 * otherRobots);
            }
        }

        // u02 No-Augment Bonus: 2x damage if no augments attached
        if (tower.primeCardDefId === 'u02' && tower.supportCardDefIds.length === 0) {
            effectiveDamage *= 2;
        }

        // c14 Yellow Shirt Synergy: +10 dmg if 3+ yellow shirts
        if ((tower.tags || []).includes('yellow_shirt') && yellowShirtCount >= 3) {
            effectiveDamage += 10;
        }

        // c17 Random Damage: Fluctuates 1-20 each shot (applied at fire time)
        const hasC17 = tower.supportCardDefIds.includes('c17');

        // r16 Fire-Rate Aura: Boost adjacent towers
        if (tower.primeCardDefId === 'r16') {
            for (let j = 0; j < towers.length; j++) {
                if (i !== j && dist(tower, towers[j]) <= 150) {
                    // Apply fire rate boost (10% per tick is too much, apply as multiplier)
                    // This is computed every frame but the tower stats are recomputed, so it's applied once
                    // We'll just check this when firing
                }
            }
        }
        // Check if adjacent to r16 for fire rate boost
        const adjacentR16 = towers.some(t => t.primeCardDefId === 'r16' && t.id !== tower.id && !t.disabled && dist(tower, t) <= 150);
        if (adjacentR16) {
            effectiveFireRate *= 1.5; // Massive fire rate boost from r16 aura
        }

        // Find target based on Strategy
        const candidates = enemies.filter(e => e.alive && dist(tower, e) <= effectiveRange);
        let target: Enemy | undefined;

        if (candidates.length > 0) {
            if (tower.targetStrategy === 'strongest') {
                target = candidates.reduce((a, b) => a.hp > b.hp ? a : b);
            } else if (tower.targetStrategy === 'weakest') {
                target = candidates.reduce((a, b) => a.hp < b.hp ? a : b);
            } else if (tower.targetStrategy === 'furthest') {
                target = candidates.reduce((a, b) => a.pathProgress > b.pathProgress ? a : b);
            } else {
                // Nearest (default)
                let minDist = Infinity;
                for (const c of candidates) {
                    const d = dist(tower, c);
                    if (d < minDist) { minDist = d; target = c; }
                }
            }
        }

        tower.targetId = target?.id ?? null;

        if (target) {
            // Calculate angle to target
            const baseAngle = Math.atan2(target.y - tower.y, target.x - tower.x);
            tower.angle = baseAngle;

            if (tower.cooldown <= 0) {
                // Fire! (Multishot Loop)
                const shotCount = 1 + tower.multishot;
                const spread = Math.PI / 12; // 15 degrees spread

                for (let j = 0; j < shotCount; j++) {
                    let angle = baseAngle;
                    if (shotCount > 1) {
                        angle += (j - (shotCount - 1) / 2) * spread;
                    }

                    // c17 random damage
                    const shotDamage = hasC17 ? Math.floor(Math.random() * 20) + 1 : effectiveDamage;

                    const proj: Projectile = {
                        id: crypto.randomUUID(),
                        x: tower.x,
                        y: tower.y,
                        targetId: target.id,
                        speed: 350,
                        damage: shotDamage,
                        damageType: tower.damageType,
                        special: tower.special,
                        specialPower: tower.specialPower,
                        towerId: tower.id,
                        pierceCount: effectivePierceCount,
                        pierced: [],
                        knockback: tower.knockback,
                        homing: tower.homing,
                        angle: angle
                    };
                    projectiles.push(proj);
                }

                tower.cooldown = 1 / effectiveFireRate;
            }
        }

        towers[i] = tower;
    }

    return { ...state, towers, projectiles, enemies, energy, hp };
}

export function moveProjectiles(state: GameState, dt: number): GameState {
    let enemies = [...state.enemies];
    let score = state.score;
    let energy = state.energy || 0;
    let hp = state.hp || 0;
    let towers = [...(state.towers || [])];
    let hand = [...(state.hand || [])];
    let drawPile = [...(state.drawPile || [])];
    let discardPile = [...(state.discardPile || [])];
    let waveComplete = state.waveComplete || false;
    const remaining: Projectile[] = [];
    const newProjectiles: Projectile[] = [];

    for (const proj of state.projectiles) {
        // If target is dead or invalid, try to find a new one if it's a homing projectile
        let target = enemies.find(e => e.id === proj.targetId);

        // If target lost (dead or finished path), and we have pierce/chain potential, try re-target
        if (!target || !target.alive) {
            let minDist = Infinity;
            let newTarget: Enemy | undefined;

            for (const enemy of enemies) {
                if (!enemy.alive) continue;
                if (proj.pierced.includes(enemy.id)) continue;
                const d = dist(proj, enemy);
                if (d < minDist && d <= 300) {
                    minDist = d;
                    newTarget = enemy;
                }
            }

            if (newTarget) {
                target = newTarget;
            } else {
                continue;
            }
        }

        let dx: number, dy: number, d: number;

        if (proj.homing && target) {
            dx = target.x - proj.x;
            dy = target.y - proj.y;
            d = Math.sqrt(dx * dx + dy * dy);
            proj.angle = Math.atan2(dy, dx);
        } else {
            const angle = proj.angle ?? 0;
            dx = Math.cos(angle) * 100;
            dy = Math.sin(angle) * 100;
            if (target) {
                d = dist(target, proj);
            } else {
                d = Infinity;
            }
        }

        const move = proj.speed * dt;

        if (d < 10 || d <= move) {
            // Hit!
            // r02 bonus: 3x damage against recently knocked-back enemies
            let effectiveProj = proj;
            const firingTower = towers.find(t => t.id === proj.towerId);
            if (firingTower?.primeCardDefId === 'r02' && target.pathProgress < (target as any)._lastPathProgress) {
                // Enemy was knocked back (progress decreased = knockbacked)
                effectiveProj = { ...proj, damage: proj.damage * 3 };
            }

            const beforeHp = target.hp;
            enemies = applyDamage(enemies, target.id, effectiveProj);
            const afterEnemy = enemies.find(e => e.id === target.id);

            // Check for kill
            if (afterEnemy && !afterEnemy.alive && beforeHp > 0) {
                let killScore = afterEnemy.value;
                let killEnergy = 0;

                // Find the tower that fired this projectile
                const towerIdx = towers.findIndex(t => t.id === proj.towerId);
                if (towerIdx >= 0) {
                    const tower = { ...towers[towerIdx] };
                    tower.killCount++;

                    // r05: 20% chance to generate 1 energy on kill
                    if (tower.primeCardDefId === 'r05' && Math.random() < 0.2) {
                        killEnergy += 1;
                    }

                    // r08: Kill = permanent +1 damage
                    if (tower.supportCardDefIds.includes('r08')) {
                        tower.damage += 1;
                    }

                    // u05: Organic unit kill = heal base 1
                    if (tower.tags.includes('organic')) {
                        hp = Math.min(state.maxHp, hp + 1);
                    }

                    // r17: 2x score/energy on kills from this tower
                    if (tower.supportCardDefIds.includes('r17')) {
                        killScore *= 2;
                        killEnergy *= 2;
                    }

                    // l01: Every 10 kills, get a random augment
                    if (tower.primeCardDefId === 'l01' && tower.killCount % 10 === 0) {
                        const augmentCards = CARD_DEFINITIONS.filter(c => c.type === 'augment');
                        if (augmentCards.length > 0) {
                            const randomAugment = augmentCards[Math.floor(Math.random() * augmentCards.length)];
                            hand.push(randomAugment.id);
                        }
                    }

                    // l09: 100 kills on unit = instant wave win
                    if (tower.supportCardDefIds.includes('l09') && tower.killCount >= 100) {
                        waveComplete = true;
                    }

                    towers[towerIdx] = tower;
                }

                score += killScore;
                energy += killEnergy;
            }

            // Handle Chain
            if (proj.special === 'chain' && proj.specialPower > 0) {
                const chainRadius = 150;
                let chainTarget: Enemy | undefined;
                let minChainDist = Infinity;

                for (const enemy of enemies) {
                    if (!enemy.alive || enemy.id === target.id || proj.pierced.includes(enemy.id)) continue;
                    const cd = dist(target, enemy);
                    if (cd <= chainRadius && cd < minChainDist) {
                        minChainDist = cd;
                        chainTarget = enemy;
                    }
                }

                if (chainTarget) {
                    newProjectiles.push({
                        ...proj,
                        id: crypto.randomUUID(),
                        x: target.x,
                        y: target.y,
                        targetId: chainTarget.id,
                        damage: Math.max(1, proj.damage * 0.8),
                        specialPower: proj.specialPower - 1,
                        pierced: [],
                    });
                }
            }

            // Handle Bounce (Ricochet)
            if (proj.special === 'bounce' && proj.specialPower > 0) {
                const bounceRadius = 200;
                let bounceTarget: Enemy | undefined;
                let minBounceDist = Infinity;

                for (const enemy of enemies) {
                    if (!enemy.alive || enemy.id === target.id || proj.pierced.includes(enemy.id)) continue;
                    const cd = dist(target, enemy);
                    if (cd <= bounceRadius && cd < minBounceDist) {
                        minBounceDist = cd;
                        bounceTarget = enemy;
                    }
                }

                if (bounceTarget) {
                    const newAngle = Math.atan2(bounceTarget.y - target.y, bounceTarget.x - target.x);
                    newProjectiles.push({
                        ...proj,
                        id: crypto.randomUUID(),
                        x: target.x,
                        y: target.y,
                        targetId: bounceTarget.id,
                        specialPower: proj.specialPower - 1,
                        pierced: [...proj.pierced, target.id],
                        angle: newAngle
                    });
                }
            }

            // Handle Pierce
            if (proj.pierceCount > 0) {
                const newProj = {
                    ...proj,
                    x: target.x,
                    y: target.y,
                    pierceCount: proj.pierceCount - 1,
                    pierced: [...proj.pierced, target.id],
                    targetId: ''
                };
                remaining.push(newProj);
            }

        } else {
            remaining.push({
                ...proj,
                targetId: target.id,
                x: proj.x + (dx / Math.sqrt(dx * dx + dy * dy)) * move,
                y: proj.y + (dy / Math.sqrt(dx * dx + dy * dy)) * move,
            });
        }
    }

    return { ...state, projectiles: [...remaining, ...newProjectiles], enemies, score, energy, hp, towers, hand, drawPile, discardPile, waveComplete };
}

export function applyDamage(enemies: Enemy[], targetId: string, proj: Projectile): Enemy[] {
    return enemies.map(enemy => {
        if (enemy.id !== targetId) {
            // AoE check
            if (proj.special === 'aoe' || proj.special === 'aoe_slow') {
                const target = enemies.find(e => e.id === targetId);
                if (target && dist(enemy, target) <= proj.specialPower && enemy.alive) {
                    const aoeDmg = Math.max(1, proj.damage * 0.5 - enemy.armor);
                    let effects = [...enemy.effects];
                    // aoe_slow: also apply slow to AoE targets
                    if (proj.special === 'aoe_slow') {
                        effects = effects.filter(e => e.type !== 'slow');
                        effects.push({ type: 'slow', power: 30, duration: 3, remaining: 3 });
                    }
                    const newHp = enemy.hp - aoeDmg;
                    return { ...enemy, hp: newHp, alive: newHp > 0, effects };
                }
            }
            return enemy;
        }

        // Direct hit
        let armor = enemy.armor;

        // pierce_armor (c18): Ignore armor entirely
        if (proj.special === 'pierce_armor') {
            armor = 0;
        }

        let dmg = Math.max(1, proj.damage - armor);

        // Percent Damage
        if (proj.special === 'percent') {
            dmg += enemy.maxHp * (proj.specialPower / 100);
        }

        // Vulnerable Multiplier
        const vulnerable = enemy.effects.find(e => e.type === 'vulnerable');
        if (vulnerable) {
            dmg *= (1 + vulnerable.power / 100);
        }

        let newHp = enemy.hp - dmg;
        let effects = [...enemy.effects];

        // r07 Void Execute: Instantly kill non-boss enemies under 20% HP
        if (proj.damageType === 'void' && enemy.type !== 'boss' && newHp > 0 && newHp < enemy.maxHp * 0.2) {
            newHp = 0;
        }

        // Knockback
        let pathProgress = enemy.pathProgress;
        if (proj.knockback > 0 && enemy.totalPathLength > 0) {
            pathProgress = Math.max(0, pathProgress - (proj.knockback / enemy.totalPathLength));
        }

        // Apply special effects
        if ((proj.special === 'slow' || proj.special === 'aoe_slow') && proj.specialPower > 0) {
            effects = effects.filter(e => e.type !== 'slow');
            effects.push({ type: 'slow', power: proj.special === 'aoe_slow' ? 30 : proj.specialPower, duration: 2, remaining: 2 });
        }
        if (proj.special === 'dot' && proj.specialPower > 0) {
            const existingDot = effects.find(e => e.type === 'dot' && e.damageType === proj.damageType);
            if (existingDot) {
                if (proj.damageType === 'corrosive') {
                    existingDot.duration += 3;
                    existingDot.remaining += 3;
                } else if (proj.damageType === 'thermal') {
                    existingDot.power += proj.specialPower;
                    existingDot.duration = 3;
                    existingDot.remaining = 3;
                } else {
                    existingDot.duration += 3;
                    existingDot.remaining += 3;
                }
            } else {
                effects.push({
                    type: 'dot',
                    damageType: proj.damageType,
                    power: proj.specialPower,
                    duration: 3,
                    remaining: 3
                });
            }
        }

        // Snare
        if (proj.special === 'snare' && proj.specialPower > 0) {
            const existingSnare = effects.find(e => e.type === 'snare');
            if (!existingSnare) {
                effects.push({ type: 'snare', power: proj.specialPower, duration: 2, remaining: 2 });
            }
        }
        // Vulnerable
        if (proj.special === 'vulnerable' && proj.specialPower > 0) {
            const existingVuln = effects.find(e => e.type === 'vulnerable');
            if (!existingVuln) {
                effects.push({ type: 'vulnerable', power: proj.specialPower, duration: 4, remaining: 4 });
            }
        }

        if (newHp <= 0) {
            return { ...enemy, hp: 0, alive: false, effects: [] };
        }

        return {
            ...enemy,
            hp: newHp,
            pathProgress,
            alive: newHp > 0,
            effects,
        };
    });
}

function generateProceduralWave(waveIndex: number): { type: EnemyType; count: number; delay: number }[] {
    const waveNum = waveIndex + 1;
    const groups: { type: EnemyType; count: number; delay: number }[] = [];

    // Difficulty Scalar
    // Every 10 waves is a "Cycle"
    // Wave 1-10: Basic mix
    // Wave 11-20: More armored/fast
    // Wave 21+: Swarms and Bosses regularly

    // Base count increases with wave
    const baseCount = 10 + Math.floor(waveNum * 1.5);

    if (waveNum % 10 === 0) {
        // Boss Wave!
        const bossCount = Math.max(1, Math.floor(waveNum / 10));
        groups.push({ type: 'boss', count: bossCount, delay: 2.0 });
        groups.push({ type: 'fast', count: baseCount, delay: 0.2 });
    } else if (waveNum % 5 === 0) {
        // Swarm Wave
        groups.push({ type: 'swarm', count: baseCount * 3, delay: 0.1 });
        groups.push({ type: 'armored', count: Math.floor(baseCount / 2), delay: 0.5 });
    } else {
        // Mixed Wave
        groups.push({ type: 'basic', count: baseCount, delay: 0.6 });
        if (waveNum > 5) {
            groups.push({ type: 'fast', count: Math.floor(baseCount / 2), delay: 0.4 });
        }
        if (waveNum > 8) {
            groups.push({ type: 'armored', count: Math.floor(baseCount / 4), delay: 1.0 });
        }
    }

    return groups;
}
