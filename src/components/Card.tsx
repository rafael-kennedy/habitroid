import { useState } from 'react';
import { type CardDefinition } from '../data/cardDefinitions';
import RetroIcon from './RetroIcon';
import CardTowerPreview from './CardTowerPreview';
import CardText from './CardText';
import './Card.css';

interface Props {
    card: CardDefinition;
    count?: number; // For collection view
    onClick?: () => void;
    actionLabel?: string; // e.g. "Add", "Remove"
    onAction?: () => void;
    showAction?: boolean;
    onInfo?: () => void;
}

export default function Card({ card, count, onClick, actionLabel, onAction, showAction, onInfo }: Props) {
    if (!card) return <div className="card-poster card-poster--empty"></div>;

    const rarityColor = `var(--rarity-${card.rarity})`;
    const [imgError, setImgError] = useState(false);

    // Determine the Expansion Set symbol based on ID prefix
    const setSymbol = card.id.startsWith('c') ? 'globe' : card.id.startsWith('r') ? 'atom' : null;

    // We can cast card to any to read visualPath if it exists (it was dynamically added)
    const visualPath = (card as any).visualPath;

    return (
        <div
            className={`card-poster card-poster--${card.rarity} card-poster--type-${card.type}`}
            onClick={onClick}
            data-type={card.type}
            data-rarity={card.rarity}
        >
            {/* Header: Name & Cost */}
            <div className="card-poster__header">
                <div className="card-poster__name">{card.name}</div>
                <div className="card-poster__cost" title="Energy Cost">
                    <span className="card-poster__cost-val">{card.energyCost}</span>
                </div>
            </div>

            {/* Visual Box */}
            <div className="card-poster__visual-container">
                {visualPath && !imgError ? (
                    <img
                        src={visualPath}
                        alt={card.name}
                        className="card-poster__img"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="card-poster__model">
                        <CardTowerPreview card={card} size={100} showGlow={false} />
                    </div>
                )}

                {/* Visual Vignette Overlay for blending */}
                <div className="card-poster__vignette"></div>
            </div>

            {/* Type Bar */}
            <div className="card-poster__type-bar">
                <span className="card-poster__type-name">{card.type.toUpperCase()}</span>
                {setSymbol && (
                    <span className="card-poster__set-symbol" title="Expansion Set">
                        <RetroIcon name={setSymbol as any} size={10} color="rgba(255, 255, 255, 0.4)" />
                    </span>
                )}
            </div>

            {/* Body: Description (Dynamic Keyword parsing) */}
            <div className={`card-poster__body card-poster__body--${card.type}`}>
                <div className="card-poster__desc">
                    <CardText text={card.flavorText} />
                </div>
            </div>

            {/* Stats Footer (Only for units and leaders) */}
            {(card.type === 'unit' || card.type === 'leader') && card.primeEffect.baseDamage > 0 && (
                <div className="card-poster__stats">
                    <div className="stat" title="Base Damage">
                        <RetroIcon name="attack" size={10} color="#ff3b30" />
                        <span>{card.primeEffect.baseDamage}</span>
                    </div>
                    <div className="stat" title="Fire Rate (shots/sec)">
                        <RetroIcon name="speed" size={10} color="#5ac8fa" />
                        <span>{card.primeEffect.fireRate}</span>
                    </div>
                    <div className="stat" title="Range">
                        <RetroIcon name="range" size={10} color="#34c759" />
                        <span>{card.primeEffect.range}</span>
                    </div>
                </div>
            )}

            {/* Action Footer for Non-Stat Cards to anchor rarity */}
            {(card.type === 'action' || card.type === 'augment') && (
                <div className="card-poster__flavor-area">
                    <span className="card-poster__flavor-placeholder"></span>
                </div>
            )}

            {showAction && onAction && (
                <button
                    className="retro-btn retro-btn--xs card-poster__action-btn"
                    onClick={(e) => { e.stopPropagation(); onAction(); }}
                >
                    {actionLabel || '+'}
                </button>
            )}

            {onInfo && (
                <button
                    className="retro-btn retro-btn--xs card-poster__info-btn"
                    onClick={(e) => { e.stopPropagation(); onInfo(); }}
                    title="View Info"
                >
                    i
                </button>
            )}

            {count !== undefined && count > 0 && (
                <div className="card-poster__count">
                    x{count}
                </div>
            )}

            {/* Rarity text for stat cards overlaid in the corner instead of footer */}
            {(card.type === 'unit' || card.type === 'leader') && (
                <span className="card-poster__rarity-overlay" style={{ color: rarityColor }}>{card.rarity.charAt(0).toUpperCase()}</span>
            )}
        </div>
    );
}
