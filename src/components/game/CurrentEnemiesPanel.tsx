import { memo, useMemo } from 'react';
import type { Enemy, EnemyType } from '../../game/types';
import './CurrentEnemiesPanel.css';

interface Props {
    enemies: Enemy[];
    onSelectEnemy: (enemyId: string) => void;
}

function CurrentEnemiesPanel({ enemies, onSelectEnemy }: Props) {
    // Group enemies by type
    const groups = useMemo(() => {
        const g = new Map<EnemyType, Enemy[]>();
        for (const e of enemies) {
            if (!e.alive) continue;
            if (!g.has(e.type)) g.set(e.type, []);
            g.get(e.type)!.push(e);
        }
        return g;
    }, [enemies]);

    if (groups.size === 0) return null;

    const sortedTypes = Array.from(groups.keys()).sort();

    return (
        <div className="current-enemies-panel">
            <div className="cep-header">
                THREATS
            </div>
            {sortedTypes.map(type => {
                const list = groups.get(type)!;
                const count = list.length;

                // Clicking selects the one furthest along the path (most dangerous)
                const handleClick = () => {
                    // Find max pathProgress
                    let maxProg = -1;
                    let target: Enemy | null = null;
                    for (const e of list) {
                        if (e.pathProgress > maxProg) {
                            maxProg = e.pathProgress;
                            target = e;
                        }
                    }
                    if (target) onSelectEnemy(target.id);
                };

                return (
                    <div key={type} className="cep-row" onClick={handleClick}>
                        <div className={`cep-icon cep-icon--${type}`} />
                        <div className="cep-info">
                            <span className="cep-name">{type.toUpperCase()}</span>
                            <span className="cep-count">x{count}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default memo(CurrentEnemiesPanel);
