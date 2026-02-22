import { useState } from 'react';
import type { CardDefinition, TowerEffect, SpecialEffect, DamageType } from '../data/cardDefinitions';
import RetroIcon, { type IconName } from './RetroIcon';
import Card from './Card';
import './CardDetailModal.css';

// ---- Human-readable helpers ----

function describeSpecial(special: SpecialEffect, power: number): string | null {
    switch (special) {
        case 'none': return null;
        case 'slow': return `Slow ${power}%`;
        case 'aoe': return `AoE ${power}px radius`;
        case 'chain': return `Chain ${power} target${power > 1 ? 's' : ''}`;
        case 'dot': return `DoT ${power} dps`;
        case 'pierce': return `Pierce ${power} enem${power > 1 ? 'ies' : 'y'}`;
        case 'stun': return `Stun ${power}%`;
        case 'snare': return `Snare ${power}%`;
        case 'bounce': return `Bounce ${power}×`;
        case 'percent': return `+${power}% max HP dmg`;
        case 'vulnerable': return `Vulnerable +${power}%`;
        case 'generate_energy': return `Generate ${power} energy`;
        case 'draw_card': return `Draw ${power} card${power > 1 ? 's' : ''}`;
        case 'leech': return `Leech ${power}%`;
        case 'amplify': return `Amplify +${power}%`;
        default: return String(special);
    }
}

const DMG_TYPE_COLORS: Record<DamageType, string> = {
    kinetic: 'var(--rarity-common)',
    thermal: 'var(--retro-red)',
    electric: 'var(--retro-cyan)',
    corrosive: 'var(--retro-green)',
    void: '#9900ff',
};

function EffectBlock({ label, effect }: { label: string; effect: TowerEffect }) {
    const specialDesc = describeSpecial(effect.special, effect.specialPower);
    const color = DMG_TYPE_COLORS[effect.damageType];

    return (
        <div className="cdm-effect">
            <div className="cdm-effect__label">{label}</div>
            <div className="cdm-effect__rows">
                <div className="cdm-stat-row">
                    <span className="cdm-stat-label">Damage</span>
                    <span className="cdm-stat-val">{effect.baseDamage}</span>
                </div>
                {effect.range > 0 && (
                    <div className="cdm-stat-row">
                        <span className="cdm-stat-label">Range</span>
                        <span className="cdm-stat-val">{effect.range}px</span>
                    </div>
                )}
                <div className="cdm-stat-row">
                    <span className="cdm-stat-label">Fire Rate</span>
                    <span className="cdm-stat-val">{effect.fireRate}/s</span>
                </div>
                <div className="cdm-stat-row">
                    <span className="cdm-stat-label">Type</span>
                    <span className="cdm-stat-val" style={{ color }}>{effect.damageType}</span>
                </div>
                {specialDesc && (
                    <div className="cdm-stat-row cdm-stat-row--special">
                        <span className="cdm-stat-label">Special</span>
                        <span className="cdm-stat-val cdm-stat-val--highlight">{specialDesc}</span>
                    </div>
                )}
                {effect.multishot > 0 && (
                    <div className="cdm-stat-row">
                        <span className="cdm-stat-label">Multishot</span>
                        <span className="cdm-stat-val">{effect.multishot + 1} shots</span>
                    </div>
                )}
                {effect.knockback > 0 && (
                    <div className="cdm-stat-row">
                        <span className="cdm-stat-label">Knockback</span>
                        <span className="cdm-stat-val">{effect.knockback}px</span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface CardDetailModalProps {
    card: CardDefinition | null;
    onClose: () => void;
}

export default function CardDetailModal({ card, onClose }: CardDetailModalProps) {
    const [showStats, setShowStats] = useState(false);

    if (!card) return null;

    const isAction = card.type === 'action';
    const isAugment = card.type === 'augment';
    const hasStats = !isAction; // Actions don't have tower stats

    return (
        <div className="modal-overlay cdm-overlay" onClick={onClose}>
            <div className={`cdm-container ${showStats ? 'cdm-container--show-stats' : ''}`} onClick={e => e.stopPropagation()}>

                {/* Left Side: The Actual Card Component */}
                <div className="cdm-card-display">
                    {/* The primary card view, scaled to fill the container */}
                    <div className="cdm-card-wrapper">
                        <Card card={card} />
                    </div>

                    {/* Stats Toggle Button */}
                    <div className="cdm-controls">
                        {hasStats && (
                            <button
                                className={`retro-btn cdm-stats-toggle ${showStats ? 'cdm-stats-toggle--active' : ''}`}
                                onClick={() => setShowStats(!showStats)}
                            >
                                <RetroIcon name="attack" size={14} />
                                {showStats ? 'Hide Stats' : 'Show Stats'}
                            </button>
                        )}
                        <button className="retro-btn cdm-close-btn" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>

                {/* Right Side: Collapsible Stats Panel */}
                {hasStats && (
                    <div className={`cdm-details ${showStats ? 'cdm-details--open' : ''}`}>
                        <div className="cdm-details-scroll">
                            <div className="cdm-effects">
                                {card.primeEffect.baseDamage > 0 && (
                                    <EffectBlock label={isAugment ? "Augment Base Stats" : "Unit Stats"} effect={card.primeEffect} />
                                )}
                                {card.supportEffect.baseDamage > 0 && (
                                    <EffectBlock label="Support Bonus / Aura" effect={card.supportEffect} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
