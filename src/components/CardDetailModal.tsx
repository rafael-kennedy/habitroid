import type { CardDefinition, TowerEffect, SpecialEffect, DamageType } from '../data/cardDefinitions';
import RetroIcon, { type IconName } from './RetroIcon';
import CardTowerPreview from './CardTowerPreview';
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
};

const DMG_TYPE_ICONS: Record<DamageType, IconName> = {
    kinetic: 'cross',
    thermal: 'sun',
    electric: 'bolt',
    corrosive: 'skull',
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
    if (!card) return null;

    const rarityColor = `var(--rarity-${card.rarity})`;
    const typeColor = DMG_TYPE_COLORS[card.primeEffect.damageType];
    const typeIcon = DMG_TYPE_ICONS[card.primeEffect.damageType];

    return (
        <div className="modal-overlay cdm-overlay" onClick={onClose}>
            <div className="cdm-card" onClick={e => e.stopPropagation()} style={{ borderColor: rarityColor }}>
                {/* Header */}
                <div className="cdm-header">
                    <div className="cdm-header__left">
                        <span className={`rarity-badge rarity-badge--${card.rarity}`}>{card.rarity}</span>
                        <h2 className="cdm-name font-retro">{card.name}</h2>
                    </div>
                    <div className="cdm-cost">
                        <RetroIcon name="bolt" size={14} color="var(--retro-yellow)" />
                        <span>{card.energyCost}</span>
                    </div>
                </div>

                {/* Visual Preview Banner */}
                <div className="cdm-type-banner" style={{ borderColor: typeColor, color: typeColor, flexDirection: 'column', height: 'auto', padding: '16px 0' }}>
                    <div style={{ marginBottom: 8, transform: 'scale(1.5)' }}>
                        <CardTowerPreview card={card} size={64} />
                    </div>
                    <div className="flex items-center gap-2">
                        <RetroIcon name={typeIcon} size={16} color={typeColor} />
                        <span>{card.primeEffect.damageType.toUpperCase()}</span>
                    </div>
                </div>

                {/* Effects */}
                <div className="cdm-effects">
                    <EffectBlock label="Tower Stats" effect={card.primeEffect} />
                    <EffectBlock label="Support Bonus" effect={card.supportEffect} />
                </div>

                {/* Flavor Text */}
                <div className="cdm-flavor">"{card.flavorText}"</div>

                {/* Close */}
                <button className="retro-btn cdm-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
