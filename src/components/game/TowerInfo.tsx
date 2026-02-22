import { memo } from 'react';
import type { Tower } from '../../game/types';
import { CARD_DEFINITIONS } from '../../data/cardDefinitions';
import './TowerInfo.css';

interface Props {
    tower: Tower;
    onClose: () => void;
}

function TowerInfo({ tower, onClose }: Props) {
    const primeCard = CARD_DEFINITIONS.find(c => c.id === tower.primeCardDefId);

    return (
        <div className="tower-info-panel">
            <div className="tower-info-header">
                <span className="tower-info-title">TOWER INFO</span>
                <button className="tower-info-close" onClick={onClose}>×</button>
            </div>

            <div className="tower-info-content">
                <div className="tower-info-section">
                    <div className="tower-name" style={{ color: `var(--rarity-${primeCard?.rarity || 'common'})` }}>
                        {primeCard?.name || 'Unknown Tower'}
                    </div>
                    <div className="tower-type">{tower.damageType.toUpperCase()}</div>
                </div>

                <div className="tower-info-stats">
                    <div className="tower-info-row">
                        <span className="label">DMG</span>
                        <span className="value">{Math.round(tower.damage)}</span>
                    </div>
                    <div className="tower-info-row">
                        <span className="label">SPD</span>
                        <span className="value">{tower.fireRate.toFixed(2)}/s</span>
                    </div>
                    <div className="tower-info-row">
                        <span className="label">RNG</span>
                        <span className="value">{Math.round(tower.range)}</span>
                    </div>
                    <div className="tower-info-row">
                        <span className="label">AIM</span>
                        <span className="value" style={{ fontSize: 10, textTransform: 'uppercase' }}>{tower.targetStrategy}</span>
                    </div>
                </div>

                {tower.supportCardDefIds.length > 0 && (
                    <div className="tower-info-support">
                        <div className="section-label">SUPPORT MODULES</div>
                        <div className="support-list">
                            {tower.supportCardDefIds.map((id, i) => {
                                const card = CARD_DEFINITIONS.find(c => c.id === id);
                                return (
                                    <div key={i} className="support-item" style={{ borderColor: `var(--rarity-${card?.rarity || 'common'})` }}>
                                        {card?.name}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(TowerInfo);
