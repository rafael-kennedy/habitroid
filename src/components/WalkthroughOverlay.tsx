import { useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useTodoStore } from '../store/todoStore';
import { useEconomyStore } from '../store/economyStore';
import RetroIcon, { type IconName } from './RetroIcon';
import './WalkthroughOverlay.css';

const HABIT_PACKS = [
    {
        id: 'health',
        name: 'Vitality Protocol',
        icon: 'apple' as IconName,
        description: 'Boost physical integrity.',
        habits: [
            { name: 'Drink Water', icon: 'water', frequency: 'daily', reward: 5 },
            { name: 'Morning Movement', icon: 'run', frequency: 'daily', reward: 10 },
            { name: 'Eat Clean', icon: 'apple', frequency: 'daily', reward: 8 },
        ]
    },
    {
        id: 'focus',
        name: 'Neural Focus',
        icon: 'mind' as IconName,
        description: 'Optimize mental throughput.',
        habits: [
            { name: 'Read Pages', icon: 'book', frequency: 'daily', reward: 10 },
            { name: 'Meditation', icon: 'moon', frequency: 'daily', reward: 12 },
            { name: 'Deep Work', icon: 'coffee', frequency: 'daily', reward: 15 },
        ]
    },
    {
        id: 'strength',
        name: 'Titan Strength',
        icon: 'weights' as IconName,
        description: 'Maximize power output.',
        habits: [
            { name: 'Pushups', icon: 'weights', frequency: 'daily', reward: 10 },
            { name: 'Sleep 8h', icon: 'moon', frequency: 'daily', reward: 15 },
            { name: 'Protein Goal', icon: 'utensils', frequency: 'daily', reward: 8 },
        ]
    }
];

export default function WalkthroughOverlay() {
    const [step, setStep] = useState(0);
    const [selectedPack, setSelectedPack] = useState<string | null>(null);
    const [todoText, setTodoText] = useState('');
    const { addHabit } = useHabitStore();
    const { addTodo } = useTodoStore();
    const { updateSettings } = useEconomyStore();
    const [isExiting, setIsExiting] = useState(false);

    const handleApplyPack = async () => {
        if (!selectedPack) return;
        const pack = HABIT_PACKS.find(p => p.id === selectedPack);
        if (!pack) return;

        for (const h of pack.habits) {
            await addHabit({
                name: h.name,
                icon: h.icon as IconName,
                frequency: h.frequency as 'daily' | 'weekly',
                coinReward: h.reward
            });
        }
        setStep(2);
    };

    const handleAddTodo = async () => {
        if (!todoText.trim()) return;
        await addTodo(todoText.trim(), 25); // Bonus reward for first todo
        setStep(3);
    };

    const handleComplete = async () => {
        setIsExiting(true);
        setTimeout(async () => {
            await updateSettings({ walkthroughCompleted: true });
        }, 500); // Wait for exit animation
    };

    return (
        <div className={`walkthrough-overlay ${isExiting ? 'walkthrough-overlay--exiting' : ''}`}>
            {/* Step 0: Welcome */}
            {step === 0 && (
                <div className="walkthrough-card retro-panel">
                    <div className="walkthrough-icon-ring">
                        <RetroIcon name="gamepad" size={48} color="var(--retro-cyan)" glow />
                    </div>
                    <h1 className="walkthrough-title font-retro">INITIALIZE<br />HABITROID</h1>
                    <p className="walkthrough-desc">
                        Gamify your life. Complete habits to earn coins, build defenses, and survive the waves.
                    </p>
                    <button className="retro-btn retro-btn--primary retro-btn--lg" onClick={() => setStep(1)}>
                        START SYSTEM
                    </button>
                    <div className="step-dots">
                        <span className="dot active"></span><span className="dot"></span><span className="dot"></span><span className="dot"></span>
                    </div>
                </div>
            )}

            {/* Step 1: Habit Packs */}
            {step === 1 && (
                <div className="walkthrough-card retro-panel">
                    <h2 className="walkthrough-subtitle font-retro">SELECT PROTOCOL</h2>
                    <p className="walkthrough-desc-sm">Choose a starter pack to begin your journey.</p>

                    <div className="pack-grid">
                        {HABIT_PACKS.map(pack => (
                            <button
                                key={pack.id}
                                className={`pack-card ${selectedPack === pack.id ? 'pack-card--selected' : ''}`}
                                onClick={() => setSelectedPack(pack.id)}
                            >
                                <RetroIcon name={pack.icon} size={24} color={selectedPack === pack.id ? '#050510' : 'var(--retro-green)'} />
                                <div className="pack-info">
                                    <span className="pack-name">{pack.name}</span>
                                    <span className="pack-desc">{pack.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="walkthrough-actions">
                        <button className="retro-btn" onClick={() => setStep(2)}>Skip</button>
                        <button
                            className="retro-btn retro-btn--primary"
                            disabled={!selectedPack}
                            onClick={handleApplyPack}
                        >
                            Confirm Selection
                        </button>
                    </div>
                    <div className="step-dots">
                        <span className="dot"></span><span className="dot active"></span><span className="dot"></span><span className="dot"></span>
                    </div>
                </div>
            )}

            {/* Step 2: First Todo */}
            {step === 2 && (
                <div className="walkthrough-card retro-panel">
                    <h2 className="walkthrough-subtitle font-retro">MISSION OBJECTIVE</h2>
                    <p className="walkthrough-desc">Define a one-off task to complete today for quick coins.</p>

                    <div className="todo-input-wrapper">
                        <input
                            className="retro-input"
                            value={todoText}
                            onChange={e => setTodoText(e.target.value)}
                            placeholder="e.g. Call Mom, Buy Groceries..."
                            autoFocus
                        />
                        <div className="first-reward-badge">
                            <RetroIcon name="coin" size={14} color="var(--coin-gold)" /> +25
                        </div>
                    </div>

                    <div className="walkthrough-actions">
                        <button className="retro-btn" onClick={() => setStep(3)}>Skip</button>
                        <button
                            className="retro-btn retro-btn--primary"
                            disabled={!todoText.trim()}
                            onClick={handleAddTodo}
                        >
                            Set Objective
                        </button>
                    </div>
                    <div className="step-dots">
                        <span className="dot"></span><span className="dot"></span><span className="dot active"></span><span className="dot"></span>
                    </div>
                </div>
            )}

            {/* Step 3: Ready */}
            {step === 3 && (
                <div className="walkthrough-card retro-panel">
                    <div className="walkthrough-icon-ring" style={{ borderColor: 'var(--retro-green)' }}>
                        <RetroIcon name="check" size={48} color="var(--retro-green)" glow />
                    </div>
                    <h1 className="walkthrough-title font-retro">SYSTEM ONLINE</h1>
                    <p className="walkthrough-desc">
                        You are ready, Operator. Use your coins to buy defenses in the Game tab.
                    </p>
                    <button className="retro-btn retro-btn--primary retro-btn--lg" onClick={handleComplete}>
                        EXECUTE
                    </button>
                    <div className="step-dots">
                        <span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="dot active"></span>
                    </div>
                </div>
            )}
        </div>
    );
}
