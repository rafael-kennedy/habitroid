import { memo } from 'react';
import type { Enemy } from '../../game/types';
import './EnemyInfo.css';

interface Props {
    enemy: Enemy;
    onClose: () => void;
}

function EnemyInfo({ enemy, onClose }: Props) {
    return (
        <div className="enemy-info-panel">
            <div className="enemy-info-header">
                <span className="enemy-info-title">{enemy.type.toUpperCase()} UNIT</span>
                <button className="enemy-info-close" onClick={onClose}>×</button>
            </div>

            <div className="enemy-info-stats">
                <div className="enemy-info-row">
                    <span className="label">HP</span>
                    <div className="bar-container">
                        <div
                            className="bar-fill"
                            style={{
                                width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                                background: enemy.hp < enemy.maxHp * 0.3 ? 'var(--retro-red)' : 'var(--retro-green)'
                            }}
                        />
                        <span className="bar-text">{Math.ceil(enemy.hp)} / {enemy.maxHp}</span>
                    </div>
                </div>

                <div className="enemy-info-row">
                    <span className="label">SPD</span>
                    <span className="value">{enemy.speed}</span>
                </div>
                <div className="enemy-info-row">
                    <span className="label">ARM</span>
                    <span className="value">{enemy.armor}</span>
                </div>

                {enemy.effects.length > 0 && (
                    <div className="enemy-info-effects">
                        {enemy.effects.map((eff, i) => (
                            <div key={i} className="active-effect-pill">
                                {eff.type} ({Math.ceil(eff.remaining)}s)
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(EnemyInfo);
