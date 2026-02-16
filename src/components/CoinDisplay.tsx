import { useEffect } from 'react';
import { useEconomyStore } from '../store/economyStore';
import RetroIcon from './RetroIcon';
import { motion, useSpring, useTransform } from 'framer-motion';
import './CoinDisplay.css';

interface CoinDisplayProps {
    size?: 'sm' | 'md' | 'lg';
}

export default function CoinDisplay({ size = 'md' }: CoinDisplayProps) {
    const coins = useEconomyStore(s => s.coinBalance);

    // Physics-based spring for smooth counting
    const springValue = useSpring(coins, {
        stiffness: 40,
        damping: 15,
        mass: 1
    });

    // Update spring target when coins change
    useEffect(() => {
        springValue.set(coins);
    }, [coins, springValue]);

    // Format number as string (e.g. "1,234") without decimals
    const displayValue = useTransform(springValue, (current) => Math.round(current).toLocaleString());

    return (
        <div className={`coin-display coin-display--${size}`}>
            <motion.span
                className="coin-icon"
                animate={{ scale: [1, 1.2, 1] }}
                key={coins} // Trigger pulse on change
                transition={{ duration: 0.3 }}
            >
                <RetroIcon name="coin" size={size === 'lg' ? 24 : size === 'md' ? 20 : 16} color="#ffd700" />
            </motion.span>
            <motion.span className="coin-amount">{displayValue}</motion.span>
        </div>
    );
}
