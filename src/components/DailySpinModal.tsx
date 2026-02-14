import { useState, useEffect } from 'react';
import { useEconomyStore } from '../store/economyStore';
import RetroIcon from './RetroIcon';
import './DailySpinModal.css';

interface DailySpinModalProps {
    onClose: () => void;
    streakLevel: number;
}

type GridItemType = 'mystery' | 'coin-jackpot' | 'card-legendary';

interface GridItem {
    type: GridItemType;
    icon?: string;
}

export default function DailySpinModal({ onClose, streakLevel }: DailySpinModalProps) {
    const { spinDailyGrid } = useEconomyStore();
    const [spinning, setSpinning] = useState(false);
    const [reward, setReward] = useState<{ type: 'coin' | 'card', value: string | number, rarity?: string } | null>(null);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const [gridItems, setGridItems] = useState<GridItem[]>([]);

    // Initialize 5x8 grid (40 items) with some teasers
    useEffect(() => {
        const items: GridItem[] = Array(40).fill({ type: 'mystery' });

        // Place 1 Huge Coin Stack and 1 Legendary Card randomly as visual bait
        // (These are just visuals, the actual reward is determined by the RNG in the store)
        const coinIdx = Math.floor(Math.random() * 40);
        let cardIdx = Math.floor(Math.random() * 40);
        while (cardIdx === coinIdx) cardIdx = Math.floor(Math.random() * 40);

        items[coinIdx] = { type: 'coin-jackpot' };
        items[cardIdx] = { type: 'card-legendary' };

        setGridItems(items);
    }, []);

    const handleSpin = async () => {
        if (spinning) return;
        setSpinning(true);

        // Animation loop
        const interval = setInterval(() => {
            setHighlightIndex(prev => (prev + 1) % 40);
        }, 50); // Fast spin

        // Perform actual spin
        try {
            // Delay to simulate spinning
            setTimeout(async () => {
                const result = await spinDailyGrid(streakLevel);
                clearInterval(interval);
                setReward(result);
                // Set highlight to a random spot or center for effect, 
                // but effectively the reward overlay takes over.
                setHighlightIndex(Math.floor(Math.random() * 40));
                setSpinning(false);
            }, 2200);
        } catch (error) {
            console.error("Spin error:", error);
            clearInterval(interval);
            setSpinning(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content daily-spin-modal" onClick={e => e.stopPropagation()}>
                <h2 className="font-retro text-accent text-center mb-4" style={{ fontSize: '18px' }}>
                    DAILY GRID: LEVEL {streakLevel} <span className="text-muted text-xs ml-2">(STREAK {streakLevel})</span>
                </h2>
                <div className="text-center text-xs text-muted mb-4">
                    Complete daily habits to unlock. Higher streak = better rewards!
                </div>

                <div className="spin-grid">
                    {gridItems.map((item, i) => (
                        <div
                            key={i}
                            className={`spin-cell ${spinning && highlightIndex === i ? 'spin-cell--active' : ''} ${item.type !== 'mystery' ? 'spin-cell--teaser' : ''}`}
                        >
                            {item.type === 'mystery' && (
                                <RetroIcon name="star" size={54} className="spin-icon" />
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
                        <div className="reward-reveal animate-pop">
                            <div className="reward-icon">
                                <RetroIcon
                                    name={reward.type === 'coin' ? 'coin' : 'cards'}
                                    size={64}
                                    color={reward.type === 'coin' ? 'var(--coin-gold)' : 'var(--retro-magenta)'}
                                />
                            </div>
                            <div className="reward-text font-retro">
                                {reward.type === 'coin' ? `+${reward.value} COINS` : reward.value}
                            </div>
                            {reward.rarity && (
                                <div className={`rarity-badge rarity-badge--${reward.rarity} mt-4`}>
                                    {reward.rarity.toUpperCase()}
                                </div>
                            )}
                            <button className="retro-btn retro-btn--primary mt-6" onClick={onClose}>
                                COLLECT REWARD
                            </button>
                        </div>
                    )}
                </div>

                {!reward && (
                    <div className="modal-actions justify-center mt-6">
                        <button
                            className={`retro-btn ${spinning ? 'retro-btn--disabled' : 'retro-btn--gold'}`}
                            onClick={handleSpin}
                            disabled={spinning}
                            style={{ minWidth: '200px' }}
                        >
                            {spinning ? 'SPINNING...' : 'SPIN THE GRID'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
