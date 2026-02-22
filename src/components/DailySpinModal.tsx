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
    value?: string;
}

export default function DailySpinModal({ onClose, streakLevel }: DailySpinModalProps) {
    const { spinDailyGrid } = useEconomyStore();
    const [spinning, setSpinning] = useState(false);
    const [reward, setReward] = useState<{ type: 'coin' | 'card', value: string | number, rarity?: string } | null>(null);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const [gridItems, setGridItems] = useState<GridItem[]>([]);
    const [showRewardOverlay, setShowRewardOverlay] = useState(false);

    // Initialize 5x5 grid (25 items) with varied potential rewards
    useEffect(() => {
        const potentialRewards: GridItem[] = [];

        // ensure we have at least one of every possible high-value reward so it's possible to win them
        // High Value Baits
        potentialRewards.push({ type: 'coin-jackpot', value: '500' });
        potentialRewards.push({ type: 'coin-jackpot', value: '200' });
        potentialRewards.push({ type: 'card-legendary', value: 'LEGENDARY' });

        // Fill the rest (22 items)
        for (let i = 0; i < 22; i++) {
            const r = Math.random();
            if (r < 0.6) {
                // Coin amounts: 25, 50, 100
                const amounts = [25, 50, 100];
                const amount = amounts[Math.floor(Math.random() * amounts.length)];
                potentialRewards.push({ type: 'coin-jackpot', value: amount.toString() });
            } else {
                // Cards
                // Weighted mostly towards common/uncommon
                let rarity = 'common';
                const rr = Math.random();
                if (rr > 0.7) rarity = 'rare';
                else if (rr > 0.4) rarity = 'uncommon';

                potentialRewards.push({ type: 'card-legendary', value: rarity.toUpperCase() });
            }
        }

        // Shuffle the array
        for (let i = potentialRewards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [potentialRewards[i], potentialRewards[j]] = [potentialRewards[j], potentialRewards[i]];
        }

        setGridItems(potentialRewards);
    }, []);

    const handleSpin = async () => {
        if (spinning) return;
        setSpinning(true);
        setShowRewardOverlay(false);

        // Start visual spinning
        let currentIndex = highlightIndex;
        const spinInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % 25;
            setHighlightIndex(currentIndex);
        }, 80);

        try {
            // 1. Get the actual reward from the store
            const [result] = await Promise.all([
                spinDailyGrid(streakLevel),
                new Promise(resolve => setTimeout(resolve, 1500)) // Min spin time
            ]);

            clearInterval(spinInterval);

            // 2. Find the target index that matches this reward
            const rewardLabel = result.type === 'coin' ? result.value.toString() : (result.rarity?.toUpperCase() || 'CARD');

            let targetIndex = gridItems.findIndex(item =>
                (result.type === 'coin' && item.type === 'coin-jackpot' && item.value === rewardLabel) ||
                (result.type === 'card' && item.type === 'card-legendary' && item.value === rewardLabel)
            );

            // Fallback: If not found (should be rare/impossible with current logic), we pick a random spot and 'inject' it
            let needsInjection = false;
            if (targetIndex === -1) {
                targetIndex = (currentIndex + 12) % 25; // Just pick a spot ahead
                needsInjection = true;
            }

            // Calculate distance to target to ensure we spin a bit more and land there
            let distance = targetIndex - currentIndex;
            if (distance <= 0) distance += 25; // Ensure we go forward
            // Add a full rotation or two for effect
            distance += 25 * 1;

            // Simulate the slowdown/stop
            let steps = distance;
            let stepCount = 0;
            let delay = 80;

            const slowDownLoop = () => {
                steps--;
                stepCount++;
                currentIndex = (currentIndex + 1) % 25;
                setHighlightIndex(currentIndex);

                if (steps > 0) {
                    // Exponential slowdown curve
                    // Start adding delay only in the last 10 steps
                    if (steps < 8) {
                        delay *= 1.15; // compound slowdown
                    }
                    setTimeout(slowDownLoop, delay);
                } else {
                    // STOPPED ON TARGET.

                    if (needsInjection) {
                        // Only modify grid if we absolutely had to (fallback)
                        const newGrid = [...gridItems];
                        newGrid[currentIndex] = {
                            type: result.type === 'coin' ? 'coin-jackpot' : 'card-legendary',
                            value: rewardLabel
                        };
                        setGridItems(newGrid);
                    }

                    setReward(result);

                    // 3. WAIT 0.5s before showing the overlay
                    setTimeout(() => {
                        setShowRewardOverlay(true);
                        setSpinning(false);
                    }, 500);
                }
            };

            slowDownLoop();

        } catch (error) {
            console.error("Spin error:", error);
            clearInterval(spinInterval);
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
                            className={`spin-cell ${spinning && highlightIndex === i ? 'spin-cell--active' : ''} ${highlightIndex === i ? 'spin-cell--highlight' : ''}`}
                        >
                            {item.type === 'coin-jackpot' && (
                                <>
                                    <RetroIcon name="coin" size={20} color="var(--retro-gold)" />
                                    <span className="spin-cell-value">{item.value}</span>
                                </>
                            )}
                            {item.type === 'card-legendary' && (
                                <>
                                    <RetroIcon name="star" size={20} color="var(--retro-magenta)" />
                                    <span className="spin-cell-value" style={{ fontSize: '8px' }}>{item.value}</span>
                                </>
                            )}
                            {item.type === 'mystery' && (
                                <RetroIcon name="star" size={24} className="spin-icon" />
                            )}
                        </div>
                    ))}

                    {/* Overlay Reward when done */}
                    {showRewardOverlay && reward && (
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

                {!showRewardOverlay && (
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
