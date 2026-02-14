import { useEconomyStore } from '../store/economyStore';
import RetroIcon from './RetroIcon';
import './CoinDisplay.css';

interface CoinDisplayProps {
    size?: 'sm' | 'md' | 'lg';
}

export default function CoinDisplay({ size = 'md' }: CoinDisplayProps) {
    const coins = useEconomyStore(s => s.coinBalance);

    return (
        <div className={`coin-display coin-display--${size}`}>
            <span className="coin-icon">
                <RetroIcon name="coin" size={size === 'lg' ? 24 : size === 'md' ? 20 : 16} color="#ffd700" />
            </span>
            <span className="coin-amount">{coins.toLocaleString()}</span>
        </div>
    );
}
