import { useEffect, useRef, useState, memo } from 'react';
import type { GameState } from '../../game/types';

interface VFX {
    id: string;
    type: 'hit' | 'death';
    x: number;
    y: number;
    color: string;
    born: number;          // performance.now() when created
    duration: number;      // ms
}

const ENEMY_COLORS: Record<string, string> = {
    basic: '#ff2d95',
    fast: '#ffea00',
    armored: '#ff6b35',
    swarm: '#bf5af2',
    boss: '#ff3b30',
};

const HIT_DURATION = 350;   // ms
const DEATH_DURATION = 600; // ms
const PARTICLE_COUNT = 8;   // death particles

interface Props {
    state: GameState;
}

let vfxIdCounter = 0;

function VFXLayer({ state }: Props) {
    const [effects, setEffects] = useState<VFX[]>([]);
    const prevRef = useRef<{ enemies: Map<string, { hp: number; alive: boolean; x: number; y: number; type: string }> }>({
        enemies: new Map(),
    });

    // Diff detection: compare current vs. previous enemy state
    useEffect(() => {
        const prev = prevRef.current.enemies;
        const now = performance.now();
        const newVfx: VFX[] = [];

        for (const enemy of state.enemies) {
            const old = prev.get(enemy.id);
            if (!old) continue;

            const color = ENEMY_COLORS[enemy.type] || '#fff';

            // Hit flash: HP decreased but still alive
            if (enemy.alive && enemy.hp < old.hp) {
                newVfx.push({
                    id: `vfx-${++vfxIdCounter}`,
                    type: 'hit',
                    x: enemy.x,
                    y: enemy.y,
                    color,
                    born: now,
                    duration: HIT_DURATION,
                });
            }

            // Death: was alive, now dead
            if (old.alive && !enemy.alive) {
                newVfx.push({
                    id: `vfx-${++vfxIdCounter}`,
                    type: 'death',
                    x: old.x,
                    y: old.y,
                    color,
                    born: now,
                    duration: DEATH_DURATION,
                });
            }
        }

        // Store current as prev
        const nextMap = new Map<string, { hp: number; alive: boolean; x: number; y: number; type: string }>();
        for (const e of state.enemies) {
            nextMap.set(e.id, { hp: e.hp, alive: e.alive, x: e.x, y: e.y, type: e.type });
        }
        prevRef.current.enemies = nextMap;

        if (newVfx.length > 0) {
            setEffects(prev => [...prev, ...newVfx]);
        }
    }, [state.enemies]);

    // Auto-cleanup expired effects
    useEffect(() => {
        if (effects.length === 0) return;
        const timer = setTimeout(() => {
            const now = performance.now();
            setEffects(prev => prev.filter(e => now - e.born < e.duration));
        }, 100);
        return () => clearTimeout(timer);
    }, [effects]);

    return (
        <g className="vfx-layer">
            {effects.map(vfx => {
                const age = (performance.now() - vfx.born) / vfx.duration; // 0→1
                if (age > 1) return null;

                if (vfx.type === 'hit') {
                    return <HitFlash key={vfx.id} vfx={vfx} age={age} />;
                }
                if (vfx.type === 'death') {
                    return <DeathBurst key={vfx.id} vfx={vfx} age={age} />;
                }
                return null;
            })}
        </g>
    );
}

function HitFlash({ vfx, age }: { vfx: VFX; age: number }) {
    const radius = 6 + age * 16;
    const opacity = (1 - age) * 0.7;

    return (
        <g transform={`translate(${vfx.x}, ${vfx.y})`}>
            {/* Expanding ring */}
            <circle
                cx={0} cy={0} r={radius}
                fill="none"
                stroke="#ffffff"
                strokeWidth={2 - age * 1.5}
                opacity={opacity}
            />
            {/* Inner flash */}
            <circle
                cx={0} cy={0} r={4 * (1 - age)}
                fill="#ffffff"
                opacity={opacity}
            />
        </g>
    );
}

function DeathBurst({ vfx, age }: { vfx: VFX; age: number }) {
    const opacity = Math.max(0, 1 - age * 1.2);

    // Expanding shockwave
    const ringRadius = age * 30;
    const ringOpacity = (1 - age) * 0.6;

    return (
        <g transform={`translate(${vfx.x}, ${vfx.y})`}>
            {/* Central flash */}
            <circle
                cx={0} cy={0}
                r={8 * (1 - age * 0.5)}
                fill={vfx.color}
                opacity={opacity * 0.8}
            />
            <circle
                cx={0} cy={0}
                r={5 * (1 - age)}
                fill="#ffffff"
                opacity={opacity}
            />

            {/* Shockwave ring */}
            <circle
                cx={0} cy={0} r={ringRadius}
                fill="none"
                stroke={vfx.color}
                strokeWidth={2.5 - age * 2}
                opacity={ringOpacity}
            />

            {/* Flying particles */}
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
                const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
                const dist = age * 25 + Math.sin(i * 1.7) * 5;
                const px = Math.cos(angle) * dist;
                const py = Math.sin(angle) * dist;
                const pSize = 2.5 * (1 - age);
                return (
                    <circle
                        key={i}
                        cx={px} cy={py}
                        r={pSize}
                        fill={i % 2 === 0 ? vfx.color : '#ffffff'}
                        opacity={opacity}
                    />
                );
            })}
        </g>
    );
}

export default memo(VFXLayer);
