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

function getPositionOnPath(points: { x: number; y: number }[], progress: number): { x: number; y: number } {
    const sampled = sampleSmoothPath(points);
    const totalLen = getPathLength(points);
    let targetDist = progress * totalLen;

    for (let i = 1; i < sampled.length; i++) {
        const dx = sampled[i].x - sampled[i - 1].x;
        const dy = sampled[i].y - sampled[i - 1].y;
        const segLen = Math.sqrt(dx * dx + dy * dy);

        if (targetDist <= segLen) {
            const t = segLen > 0 ? targetDist / segLen : 0;
            return {
                x: sampled[i - 1].x + dx * t,
                y: sampled[i - 1].y + dy * t,
            };
        }
        targetDist -= segLen;
    }

    return { ...sampled[sampled.length - 1] };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ---- Initialize Game State ----

export function createGameState(mapId: string, deckCardDefIds: string[], upgrades: Record<string, number> = {}): GameState {
    const map = MAP_DEFINITIONS.find(m => m.id === mapId)!;

    // Shuffle card def IDs for draw pile
    const shuffled = [...deckCardDefIds].sort(() => Math.random() - 0.5);

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
        totalWaves: map.waves.length,
        energy: finalEnergy,
        maxEnergy: finalEnergy,
        hp: finalHp,
        maxHp: finalHp,
        score: 0,
        enemies: [],
        towers: [],
        projectiles: [],
        hand: [],
        drawPile: shuffled,
        discardPile: [],
        selectedCardDefId: null,
        enemiesSpawned: 0,
        spawnTimer: 0,
        waveEnemies: [],
        waveComplete: false,
    };
}

// ---- Phase Transitions ----

export function drawCards(state: GameState, count: number = 5): GameState {
    const newState = { ...state };
    const toDraw = Math.min(count, newState.drawPile.length + newState.discardPile.length);

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
    const wave = map.waves[state.currentWave];
    if (!wave) return { ...state, phase: 'VICTORY' };

    // Expand wave enemies into a flat spawn list
    const waveEnemies: { type: EnemyType; delay: number }[] = [];
    for (const group of wave.enemies) {
        for (let i = 0; i < group.count; i++) {
            waveEnemies.push({ type: group.type, delay: group.delay });
        }
    }

    // Discard remaining hand
    const discardPile = [...state.discardPile, ...state.hand];

    return {
        ...state,
        phase: 'COMBAT_PHASE',
        hand: [],
        discardPile,
        selectedCardDefId: null,
        enemiesSpawned: 0,
        spawnTimer: 0,
        waveEnemies,
        waveComplete: false,
    };
}

export function endWave(state: GameState): GameState {
    const map = MAP_DEFINITIONS.find(m => m.id === state.mapId)!;
    const nextWave = state.currentWave + 1;

    if (nextWave >= map.waves.length) {
        return { ...state, phase: 'VICTORY' };
    }

    return {
        ...state,
        phase: 'DRAW_PHASE',
        currentWave: nextWave,
        energy: state.energy + map.energyPerWave,
        maxEnergy: state.maxEnergy + map.energyPerWave,
        projectiles: [],
    };
}

// ---- Place Tower ----

export function placeCard(state: GameState, cardDefId: string, zoneId: string): GameState {
    const cardDef = CARD_DEFINITIONS.find(c => c.id === cardDefId);
    if (!cardDef) return state;
    if (state.energy < cardDef.energyCost) return state;

    const map = MAP_DEFINITIONS.find(m => m.id === state.mapId)!;
    const zone = map.placementZones.find(z => z.id === zoneId);
    if (!zone) return state;

    // Check if tower already exists in this zone
    const existingTower = state.towers.find(t => t.zoneId === zoneId);

    let newTowers: Tower[];
    if (existingTower) {
        // Add as support card
        const supportDefs = [...existingTower.supportCardDefIds, cardDefId];
        const updatedTower = computeTowerStats({
            ...existingTower,
            supportCardDefIds: supportDefs,
        });
        newTowers = state.towers.map(t => t.id === existingTower.id ? updatedTower : t);
    } else {
        // Create new tower with prime card
        const tower: Tower = {
            id: crypto.randomUUID(),
            x: zone.center.x,
            y: zone.center.y,
            zoneId,
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
        };
        newTowers = [...state.towers, tower];
    }

    // Remove card from hand
    const handIdx = state.hand.indexOf(cardDefId);
    const newHand = [...state.hand];
    if (handIdx >= 0) newHand.splice(handIdx, 1);

    return {
        ...state,
        towers: newTowers,
        hand: newHand,
        energy: state.energy - cardDef.energyCost,
        selectedCardDefId: null,
    };
}

function computeTowerStats(tower: Tower): Tower {
    const primeDef = CARD_DEFINITIONS.find(c => c.id === tower.primeCardDefId);
    if (!primeDef) return tower;

    let damage = primeDef.primeEffect.baseDamage;
    let range = primeDef.primeEffect.range;
    let fireRate = primeDef.primeEffect.fireRate;
    let specialPower = primeDef.primeEffect.specialPower;

    // New Stats
    let multishot = 0; // additive
    let knockback = 0; // additive
    let homing = primeDef.primeEffect.homing; // override
    let targetStrategy = primeDef.primeEffect.targetStrategy; // override

    for (const supportId of tower.supportCardDefIds) {
        const sDef = CARD_DEFINITIONS.find(c => c.id === supportId);
        if (sDef) {
            damage += sDef.supportEffect.baseDamage;
            range += sDef.supportEffect.range;
            fireRate += sDef.supportEffect.fireRate;
            specialPower += sDef.supportEffect.specialPower;

            multishot += sDef.supportEffect.multishot;
            knockback += sDef.supportEffect.knockback;

            // Override homing if support specifies false (or different?)
            // If default is true, checking against true is meaningless.
            // We assume if support explicitly sets homing=false, it overrides.
            // But cardDefinitions.ts defaults homing=true.
            // So unless we change FX helper to allow undefined, we can't detect "set".
            // However, specific support cards for homing/linear might exist.
            if (sDef.supportEffect.homing === false) homing = false;

            // Override strategy if not default
            if (sDef.supportEffect.targetStrategy !== 'nearest') {
                targetStrategy = sDef.supportEffect.targetStrategy;
            }
        }
    }

    return {
        ...tower,
        damageType: primeDef.primeEffect.damageType,
        damage,
        range,
        fireRate,
        special: primeDef.primeEffect.special,
        specialPower,
        multishot: multishot + primeDef.primeEffect.multishot,
        knockback: knockback + primeDef.primeEffect.knockback,
        homing,
        targetStrategy,
        angle: tower.angle // preserve runtime angle
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
            totalPathLength: getPathLength(path.points)
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
        return { ...enemy, pathProgress: newProgress, x: pos.x, y: pos.y };
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

    // Add score for killed enemies
    let score = state.score;
    for (let i = 0; i < enemies.length; i++) {
        if (!enemies[i].alive && state.enemies[i].alive && enemies[i].hp <= 0) {
            score += enemies[i].value;
        }
    }

    return { ...state, enemies, score };
}

export function updateTowers(state: GameState, dt: number): GameState {
    const towers = [...state.towers];
    let projectiles = [...state.projectiles];

    for (let i = 0; i < towers.length; i++) {
        const tower = { ...towers[i] };
        tower.cooldown = Math.max(0, tower.cooldown - dt);

        // Economy Mechanics
        if (tower.special === 'generate_energy') {
            if (tower.cooldown <= 0) {
                state.energy += tower.specialPower;
                tower.cooldown = 1 / tower.fireRate;
            }
            towers[i] = tower;
            continue;
        }
        if (tower.special === 'draw_card') {
            if (tower.cooldown <= 0) {
                // Draw cards (simplified: 1 card, ignoring specialPower as count for now?)
                if (state.drawPile.length > 0 || state.discardPile.length > 0) {
                    // We need to call drawCards helper? But that returns new state.
                    // Here we are mutating local state variables or need to call helper outside?
                    // We can just manipulate piles directly here as we are deep in update.
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

        // Find target based on Strategy
        const candidates = state.enemies.filter(e => e.alive && dist(tower, e) <= tower.range);
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

                    const proj: Projectile = {
                        id: crypto.randomUUID(),
                        x: tower.x,
                        y: tower.y,
                        targetId: target.id,
                        speed: 350,
                        damage: tower.damage,
                        damageType: tower.damageType,
                        special: tower.special,
                        specialPower: tower.specialPower,
                        towerId: tower.id,
                        pierceCount: tower.special === 'pierce' ? tower.specialPower : 0,
                        pierced: [],
                        knockback: tower.knockback,
                        homing: tower.homing,
                        angle: angle
                    };
                    projectiles.push(proj);
                }

                tower.cooldown = 1 / tower.fireRate;
            }
        }

        towers[i] = tower;
    }

    return { ...state, towers, projectiles };
}

export function moveProjectiles(state: GameState, dt: number): GameState {
    let enemies = [...state.enemies];
    let score = state.score;
    const remaining: Projectile[] = [];
    const newProjectiles: Projectile[] = [];

    for (const proj of state.projectiles) {
        // If target is dead or invalid, try to find a new one if it's a homing projectile
        let target = enemies.find(e => e.id === proj.targetId);

        // If target lost (dead or finished path), and we have pierce/chain potential, try re-target
        if (!target || !target.alive) {
            // Find nearest alive enemy not already pierced
            let minDist = Infinity;
            let newTarget: Enemy | undefined;

            for (const enemy of enemies) {
                if (!enemy.alive) continue;
                if (proj.pierced.includes(enemy.id)) continue; // Don't hit same enemy twice

                const d = dist(proj, enemy);
                if (d < minDist && d <= 300) { // search radius (arbitrary but reasonable)
                    minDist = d;
                    newTarget = enemy;
                }
            }

            if (newTarget) {
                target = newTarget;
                // Update projectile to target new enemy
                // But we can't mutate 'proj' inside the loop easily if we want to push it to 'remaining'
                // We'll handle movement below
            } else {
                continue; // No target, projectile fizzles
            }
        }

        let dx: number, dy: number, d: number;

        if (proj.homing && target) {
            // Homing: Update vector to target
            dx = target.x - proj.x;
            dy = target.y - proj.y;
            d = Math.sqrt(dx * dx + dy * dy);
            // Update angle for store?
            proj.angle = Math.atan2(dy, dx);
        } else {
            // Linear: Use stored angle
            const angle = proj.angle ?? 0;
            dx = Math.cos(angle) * 100; // Arbitrary magnitude for direction
            dy = Math.sin(angle) * 100;

            // Distance to target check (for linear hit detection)
            // We check collision with TARGET if passed?
            // Linear projectiles can hit ANY enemy in path theoretically.
            // But existing system is Target-locked (targetId).
            // If homing=false, targetId is still set.
            // If we want "Skillshot" that hits anything, we need separate collision loop.
            // For now, assume it still targets specific enemy but moves straight?
            // That means it will MISS if enemy moves.
            // Collision logic below relies on 'target'.
            // If target moved away from line of fire, d will be large.
            // So missile misses.
            if (target) {
                d = dist(target, proj);
            } else {
                d = Infinity;
            }
            // Correct movement vector uses Projectile Speed
            // dx/dy here are used to normalize direction in Homing block below.
            // But actual move is calculated differently.
        }

        const move = proj.speed * dt;

        if (d < 10 || d <= move) {
            // Hit!
            const beforeHp = target.hp;
            enemies = applyDamage(enemies, target.id, proj);
            const afterEnemy = enemies.find(e => e.id === target.id);

            // Check for kill
            if (afterEnemy && !afterEnemy.alive && beforeHp > 0) {
                score += afterEnemy.value;
            }

            // Handle Chain
            if (proj.special === 'chain' && proj.specialPower > 0) {
                // Find chain target
                const chainRadius = 150; // generous chain range
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
                        damage: Math.max(1, proj.damage * 0.8), // 20% decay
                        specialPower: proj.specialPower - 1, // Decrement chain count
                        pierced: [], // Reset pierced for new chain branch
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
                // Projectile continues
                // It needs to pick a new target next frame.
                // We mark current target as pierced so we don't hit it again.
                // And we KEEP the projectile.
                // But we need to update its position to the hit position? Yes.
                const newProj = {
                    ...proj,
                    x: target.x,
                    y: target.y,
                    pierceCount: proj.pierceCount - 1,
                    pierced: [...proj.pierced, target.id],
                    targetId: '' // Clear target so it re-targets next frame
                };
                remaining.push(newProj);
            }
            // else: destroy projectile (don't push to remaining)

        } else {
            // Move toward target
            // Update targetId in case we switched targets above
            remaining.push({
                ...proj,
                targetId: target.id,
                x: proj.x + (dx / Math.sqrt(dx * dx + dy * dy)) * move,
                y: proj.y + (dy / Math.sqrt(dx * dx + dy * dy)) * move,
            });
        }
    }

    return { ...state, projectiles: [...remaining, ...newProjectiles], enemies, score };
}

export function applyDamage(enemies: Enemy[], targetId: string, proj: Projectile): Enemy[] {
    return enemies.map(enemy => {
        if (enemy.id !== targetId) {
            // AoE check
            if (proj.special === 'aoe') {
                const target = enemies.find(e => e.id === targetId);
                if (target && dist(enemy, target) <= proj.specialPower && enemy.alive) {
                    const aoeDmg = Math.max(1, proj.damage * 0.5 - enemy.armor);
                    return { ...enemy, hp: enemy.hp - aoeDmg, alive: enemy.hp - aoeDmg > 0 };
                }
            }
            return enemy;
        }

        // Direct hit
        let dmg = Math.max(1, proj.damage - enemy.armor);

        // Percent Damage
        if (proj.special === 'percent') {
            dmg += enemy.maxHp * (proj.specialPower / 100);
        }

        // Vulnerable Multiplier
        const vulnerable = enemy.effects.find(e => e.type === 'vulnerable');
        if (vulnerable) {
            dmg *= (1 + vulnerable.power / 100);
        }

        const newHp = enemy.hp - dmg;
        let effects = [...enemy.effects];

        // Knockback
        let pathProgress = enemy.pathProgress;
        if (proj.knockback > 0 && enemy.totalPathLength > 0) {
            pathProgress = Math.max(0, pathProgress - (proj.knockback / enemy.totalPathLength));
            // Note: x,y not updated until next moveEnemies
        }

        // Apply special effects
        if (proj.special === 'slow' && proj.specialPower > 0) {
            effects = effects.filter(e => e.type !== 'slow');
            effects.push({ type: 'slow', power: proj.specialPower, duration: 2, remaining: 2 });
        }
        if (proj.special === 'dot' && proj.specialPower > 0) {
            // Check for existing DoT of same type
            const existingDot = effects.find(e => e.type === 'dot' && e.damageType === proj.damageType);

            if (existingDot) {
                if (proj.damageType === 'corrosive') {
                    // Poison: Stack Duration
                    existingDot.duration += 3;
                    existingDot.remaining += 3;
                } else if (proj.damageType === 'thermal') {
                    // Fire: Stack Intensity (Damage)
                    existingDot.power += proj.specialPower;
                    existingDot.duration = 3; // Reset duration so the bigger fire burns
                    existingDot.remaining = 3;
                } else {
                    // Default behavior (e.g. kinetic bleed?): Stack Duration
                    existingDot.duration += 3;
                    existingDot.remaining += 3;
                }
                // Update the effect in the array
                effects = effects.map(e => (e === existingDot ? existingDot : e));
            } else {
                // New DoT
                effects.push({
                    type: 'dot',
                    damageType: proj.damageType,
                    power: proj.specialPower,
                    duration: 3,
                    remaining: 3
                });
            }
        }
        if (proj.special === 'stun' && proj.specialPower > 0) {
            const stunChance = proj.specialPower / 100;
            if (Math.random() < stunChance) {
                effects.push({ type: 'stun', power: 1, duration: 0.5, remaining: 0.5 });
            }
        }
        if (proj.special === 'snare' && proj.specialPower > 0) {
            effects = effects.filter(e => e.type !== 'snare');
            effects.push({ type: 'snare', power: proj.specialPower, duration: 2.5, remaining: 2.5 });
        }

        return {
            ...enemy,
            hp: newHp,
            pathProgress, // Updated progress
            alive: newHp > 0,
            effects,
        };
    });
}
