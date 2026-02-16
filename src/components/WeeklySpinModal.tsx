import { useState, useEffect } from 'react';
import { useEconomyStore } from '../store/economyStore';
import RetroIcon from './RetroIcon';
import './DailySpinModal.css'; // Reusing base styles

interface WeeklySpinModalProps {
    onClose: () => void;
    streakLevel: number;
}

type GridItemType = 'mystery' | 'coin-jackpot' | 'card-legendary';

interface GridItem {
    type: GridItemType;
    icon?: string;
}

export default function WeeklySpinModal({ onClose, streakLevel }: WeeklySpinModalProps) {
    const { spinWeeklyGrid } = useEconomyStore();
    const [spinning, setSpinning] = useState(false);
    const [reward, setReward] = useState<{ type: 'coin' | 'card', value: string | number, rarity?: string } | null>(null);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const [gridItems, setGridItems] = useState<GridItem[]>([]);

    // Initialize 5x8 grid (40 items)
    useEffect(() => {
        const items: GridItem[] = Array(40).fill({ type: 'mystery' });

        // Weekly spin has WAY more yummy items visually
        for (let i = 0; i < 5; i++) {
            items[Math.floor(Math.random() * 40)] = { type: 'card-legendary' };
            items[Math.floor(Math.random() * 40)] = { type: 'coin-jackpot' };
        }

        setGridItems(items);
    }, []);

    const handleSpin = async () => {
        if (spinning) return;
        setSpinning(true);

        const interval = setInterval(() => {
            setHighlightIndex(prev => (prev + 1) % 40);
        }, 30); // Faster spin for intensity

        try {
            setTimeout(async () => {
                const result = await spinWeeklyGrid(streakLevel);
                clearInterval(interval);
                setReward(result);
                setHighlightIndex(Math.floor(Math.random() * 40));
                setSpinning(false);
            }, 3000); // Longer build up
        } catch (error) {
            console.error("Spin error:", error);
            clearInterval(interval);
            setSpinning(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'sepia(0.8) hue-rotate(240deg)' }}>
            <div className="modal-content daily-spin-modal" onClick={e => e.stopPropagation()} style={{ borderColor: 'var(--retro-magenta)', boxShadow: '0 0 40px var(--retro-magenta)' }}>
                <h2 className="font-retro text-center mb-4" style={{ fontSize: '20px', color: 'var(--retro-magenta)', textShadow: '0 0 10px var(--retro-magenta)' }}>
                    WEEKLY GRID: STREAK {streakLevel}
                </h2>
                <div className="text-center text-xs text-muted mb-4">
                    HIGH STAKES. NO COMMONS. LEGENDARY ODDS BOOSTED.
                </div>

                <div className="spin-grid">
                    {gridItems.map((item, i) => (
                        <div
                            key={i}
                            className={`spin-cell ${spinning && highlightIndex === i ? 'spin-cell--active' : ''} ${item.type !== 'mystery' ? 'spin-cell--teaser' : ''}`}
                            style={{ borderColor: spinning && highlightIndex === i ? 'var(--retro-magenta)' : 'var(--border-color)' }}
                        >
                            {item.type === 'mystery' && (
                                <RetroIcon name="star" size={54} className="spin-icon" color={spinning && highlightIndex === i ? 'var(--retro-magenta)' : 'var(--text-muted)'} />
                            )}
                            {item.type === 'coin-jackpot' && (
                                <RetroIcon name="coin" size={18} color="var(--retro-gold)" />
                            )}
                            {item.type === 'card-legendary' && (
                                <RetroIcon name="star" size={18} color="var(--retro-magenta)" />
                            )}
                        </div>
                    ))}

                    {/* Overlay Reward when done */}
                    {reward && (
                        <div className="reward-reveal animate-pop" style={{ border: '2px solid var(--retro-magenta)', background: 'rgba(20, 0, 20, 0.95)' }}>
                            <div className="reward-icon">
                                <RetroIcon
                                    name={reward.type === 'coin' ? 'coin' : 'cards'}
                                    size={80}
                                    color={reward.type === 'coin' ? 'var(--coin-gold)' : 'var(--retro-magenta)'}
                                />
                            </div>
                            <div className="reward-text font-retro" style={{ color: 'var(--retro-magenta)' }}>
                                {reward.type === 'coin' ? `+${reward.value} COINS` : reward.value}
                            </div>
                            {reward.rarity && (
                                <div className={`rarity-badge rarity-badge--${reward.rarity} mt-4`}>
                                    {reward.rarity.toUpperCase()}
                                </div>
                            )}
                            <button className="retro-btn retro-btn--primary mt-6"
                                onClick={onClose}
                                style={{ background: 'var(--retro-magenta)', borderColor: 'var(--retro-magenta)' }}>
                                COLLECT REWARD
                            </button>
                        </div>
                    )}
                </div>

                {!reward && (
                    <div className="modal-actions justify-center mt-6">
                        <button
                            className={`retro-btn ${spinning ? 'retro-btn--disabled' : ''}`}
                            onClick={handleSpin}
                            disabled={spinning}
                            style={{ minWidth: '200px', background: spinning ? '' : 'var(--retro-magenta)', borderColor: 'var(--retro-magenta)', color: 'white' }}
                        >
                            {spinning ? 'SPINNING...' : 'SPIN WEEKLY GRID'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
