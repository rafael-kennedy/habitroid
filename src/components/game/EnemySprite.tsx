import { memo } from 'react';
import type { Enemy } from '../../game/types';

interface Props {
    enemy: Enemy;
}

const ENEMY_COLORS: Record<string, string> = {
    basic: '#ff2d95',
    fast: '#ffea00',
    armored: '#ff6b35',
    swarm: '#bf5af2',
    boss: '#ff3b30',
};

function EnemySprite({ enemy }: Props) {
    if (!enemy.alive) return null;

    const color = ENEMY_COLORS[enemy.type] || '#fff';
    const size = enemy.type === 'boss' ? 12 : 6;
    const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
    const stunned = enemy.effects.some(e => e.type === 'stun' && e.remaining > 0);
    const isWobbly = enemy.type === 'fast' || enemy.type === 'swarm';

    // Shape based on enemy type
    let shape: React.ReactNode;
    if (enemy.type === 'armored') {
        shape = (
            <rect
                className={`enemy-shape enemy-shape--${enemy.type}`}
                x={-size} y={-size}
                width={size * 2} height={size * 2}
            />
        );
    } else if (enemy.type === 'fast') {
        const points = `${size},0 ${-size},${size / 2} ${-size},${-size / 2}`;
        shape = (
            <polygon
                className={`enemy-shape enemy-shape--${enemy.type}`}
                points={points}
            />
        );
    } else {
        shape = (
            <circle
                className={`enemy-shape enemy-shape--${enemy.type}`}
                cx={0} cy={0} r={size}
            />
        );
    }

    const barW = size * 2.5;
    const barH = 2;
    const barY = size + 6;

    return (
        <g transform={`translate(${enemy.x}, ${enemy.y})`}>
            <g className={isWobbly ? 'enemy-wobble' : undefined}>
                {shape}

                {/* Inner white core */}
                <circle className="enemy-core" cx={0} cy={0} r={size / 2} />

                {/* Stun indicator */}
                {stunned && (
                    <g transform={`translate(0, ${-size - 12})`}>
                        <polygon
                            className="enemy-stun-icon"
                            points="1.2,-4 -2.8,0.8 -0.4,0.8 -0.8,4 3.2,-0.8 0.8,-0.8"
                        />
                    </g>
                )}
            </g>

            {/* Health bar (only when damaged) */}
            {hpPct < 1 && (
                <g>
                    <rect className="enemy-hp-bg" x={-barW / 2} y={barY} width={barW} height={barH} />
                    <rect
                        className="enemy-hp-fill"
                        x={-barW / 2} y={barY}
                        width={barW * hpPct} height={barH}
                        fill={color}
                    />
                </g>
            )}
        </g>
    );
}

export default memo(EnemySprite);
