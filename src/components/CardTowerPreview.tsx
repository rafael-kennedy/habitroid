import { useMemo } from 'react';
import type { CardDefinition } from '../data/cardDefinitions';
import type { Tower } from '../game/types';
import TowerSprite from './game/TowerSprite';

interface Props {
    card: CardDefinition;
    size?: number;
    showGlow?: boolean;
}

export default function CardTowerPreview({ card, size = 64, showGlow: _showGlow = true }: Props) {
    // Construct a dummy tower object for the sprite to render
    const dummyTower: Tower = useMemo(() => ({
        id: 'preview',
        x: 0,
        y: 0,
        zoneId: 'preview',
        primeCardDefId: card.id,
        supportCardDefIds: [],
        damageType: card.primeEffect.damageType,
        damage: card.primeEffect.baseDamage,
        range: 0, // Hide range circle
        fireRate: card.primeEffect.fireRate,
        special: 'none',
        specialPower: 0,
        multishot: 0,
        knockback: 0,
        homing: true,
        targetStrategy: 'nearest',
        cooldown: 0,
        targetId: null,
        angle: -Math.PI / 2, // Point up
        killCount: 0,
        disabled: false,
        tags: [],
    }), [card]);

    // Calculate view box to center the tower (which is at 0,0)
    // Towers assume a ~20px radius visual, typically.
    const viewBoxSize = 40;

    return (
        <div className="card-tower-preview" style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
                width={size}
                height={size}
                viewBox={`${-viewBoxSize / 2} ${-viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`}
                style={{ overflow: 'visible' }}
            >
                {card.visualPath ? (
                    <image
                        href={card.visualPath}
                        x={-20} y={-20}
                        width={40} height={40}
                    />
                ) : (
                    <TowerSprite tower={dummyTower} />
                )}
            </svg>
        </div>
    );
}
