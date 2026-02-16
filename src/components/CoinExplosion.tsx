import ConfettiExplosion from 'react-confetti-explosion';

interface CoinExplosionProps {
    amount: number;
    onComplete?: () => void;
}

export default function CoinExplosion({ amount, onComplete }: CoinExplosionProps) {
    // Particle Logic:
    // Small rewards (<50): 1 particle per coin. Exact feels satisfying.
    // Large rewards (>=50): 50 + scaled amount. Capped at 200 to preventing lag.

    let particleCount = amount;
    if (amount >= 50) {
        // Example: 100 coins -> 50 + (50 / 5) = 60 particles
        // Example: 500 coins -> 50 + (450 / 5) = 140 particles
        particleCount = 50 + Math.floor((amount - 50) / 4);
    }

    // Hard cap
    if (particleCount > 200) particleCount = 200;

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, pointerEvents: 'none' }}>
            <ConfettiExplosion
                force={0.6}
                duration={2500}
                particleCount={particleCount}
                colors={['#FFD700', '#FFA500', '#FFFF00', '#ffffff']} // Gold, Orange, Yellow, White
                onComplete={onComplete}
                width={1600}
            />
        </div>
    );
}
