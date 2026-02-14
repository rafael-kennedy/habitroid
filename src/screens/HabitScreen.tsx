import { useEffect, useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useTodoStore } from '../store/todoStore';
import { useEconomyStore } from '../store/economyStore';
import CoinDisplay from '../components/CoinDisplay';
import RetroIcon, { type IconName } from '../components/RetroIcon';
import DailySpinModal from '../components/DailySpinModal';
import './HabitScreen.css';


// Note: 'star' might not be in my list, let me check RetroIcon.tsx. 
// I didn't add 'star'. I'll stick to the ones I have:
const VALID_HABIT_ICONS: IconName[] = [
    'run', 'book', 'water', 'mind', 'weights', 'moon', 'sun', 'target', 'coffee', 'apple', 'trophy', 'bolt', 'heart'
];

export default function HabitScreen() {
    const { habits, loading, loadHabits, addHabit, toggleCompletion, deleteHabit, isCompletedToday } = useHabitStore();
    const { todos, loadTodos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
    const { earnCoins } = useEconomyStore();
    const [activeTab, setActiveTab] = useState<'habits' | 'todos'>('habits');
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState<IconName>('target');
    const [newReward, setNewReward] = useState(10);
    const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly'>('daily');
    const [coinPopId, setCoinPopId] = useState<string | null>(null);
    const [showSpin, setShowSpin] = useState(false);

    // Derived state for spin availability
    const { settings } = useEconomyStore();
    const today = new Date().toISOString().split('T')[0];
    const dailyHabits = habits.filter(h => h.frequency === 'daily' && !h.archived);
    const allDailyDone = dailyHabits.length > 0 && dailyHabits.every(h => isCompletedToday(h.id));
    const spinAvailable = allDailyDone && settings?.lastSpinDate !== today;

    // Todo specific state
    const [newTodoText, setNewTodoText] = useState('');
    const [newTodoReward, setNewTodoReward] = useState(15);

    useEffect(() => {
        loadHabits();
        loadTodos();
    }, [loadHabits, loadTodos]);

    const handleToggle = async (id: string) => {
        const coins = await toggleCompletion(id);
        if (coins > 0) {
            await earnCoins(coins, 'habit', `Completed habit`);
            setCoinPopId(id);
            setTimeout(() => setCoinPopId(null), 800);
        }
    };

    const handleTodoToggle = async (id: string, reward: number) => {
        const todo = todos.find(t => t.id === id);
        if (todo && !todo.completed) {
            setCoinPopId(id);
            setTimeout(() => setCoinPopId(null), 800);
        }
        await toggleTodo(id, reward);
    };

    const handleAdd = async () => {
        if (!newName.trim()) return;
        await addHabit({
            name: newName.trim(),
            icon: newIcon,
            frequency: newFrequency,
            coinReward: newReward,
        });
        setNewName('');
        setNewIcon('target');
        setNewReward(10);
        setShowAdd(false);
    };

    const handleAddTodo = async () => {
        if (!newTodoText.trim()) return;
        await addTodo(newTodoText.trim(), newTodoReward);
        setNewTodoText('');
        setNewTodoReward(15);
        setShowAdd(false);
    };

    if (loading) {
        return <div className="screen"><p className="text-muted">Loading...</p></div>;
    }

    return (
        <div className="screen" id="habit-screen">
            <div className="habit-header">
                <div>
                    <h1 className="screen-title">Journal</h1>
                    <div className="habit-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'habits' ? 'tab-btn--active' : ''}`}
                            onClick={() => setActiveTab('habits')}
                        >
                            HABITS
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'todos' ? 'tab-btn--active' : ''}`}
                            onClick={() => setActiveTab('todos')}
                        >
                            TASKS
                        </button>
                    </div>
                </div>
                <CoinDisplay size="lg" />
            </div>

            {/* Global Streak & Armor Header */}
            {activeTab === 'habits' && settings && (
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="text-sm font-retro text-accent">
                        STREAM: {settings.dailyCompletionStreak} DAYS
                    </div>
                    <div className="flex items-center gap-2">
                        {settings.streakArmor > 0 && (
                            <div className="flex items-center text-xs text-muted" title="Streak Armor Active">
                                <RetroIcon name="shield" size={14} color="var(--retro-cyan)" style={{ marginRight: 4 }} />
                                {settings.streakArmor}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Daily Spin Banner */}
            {spinAvailable && activeTab === 'habits' && (
                <button
                    className="retro-panel w-full mb-4 flex items-center justify-between p-3 bg-retro-gold/10 border-retro-gold animate-pulse"
                    onClick={() => setShowSpin(true)}
                    style={{ borderColor: 'var(--coin-gold)', background: 'rgba(255, 215, 0, 0.1)' }}
                >
                    <div className="flex items-center gap-2">
                        <RetroIcon name="star" size={20} color="var(--coin-gold)" />
                        <span className="font-retro text-gold">DAILY SPIN AVAILABLE!</span>
                    </div>
                    <RetroIcon name="arrow-right" size={16} color="var(--coin-gold)" />
                </button>
            )}

            {/* Progress summary - Only for Habits */}
            {activeTab === 'habits' && (
                <div className="retro-panel habit-progress">
                    <div className="habit-progress__label">
                        Today: {habits.filter(h => isCompletedToday(h.id)).length} / {habits.length}
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar__fill"
                            style={{
                                width: habits.length > 0
                                    ? `${(habits.filter(h => isCompletedToday(h.id)).length / habits.length) * 100}%`
                                    : '0%',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Lists */}
            <div className="habit-list">
                {activeTab === 'habits' ? (
                    habits.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">
                                <RetroIcon name="target" size={48} color="var(--text-muted)" />
                            </div>
                            <p className="empty-state__text">No habits yet. Add your first one!</p>
                        </div>
                    ) : (
                        habits.map((habit, i) => {
                            const completed = isCompletedToday(habit.id);
                            // Fallback for old emoji icons if they exist in DB
                            const isEmoji = habit.icon.match(/\p{Emoji}/u);

                            return (
                                <div
                                    key={habit.id}
                                    className={`habit-card retro-panel ${completed ? 'habit-card--done' : ''}`}
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    <button
                                        className={`habit-check ${completed ? 'habit-check--done' : ''}`}
                                        onClick={() => handleToggle(habit.id)}
                                        id={`habit-toggle-${habit.id}`}
                                    >
                                        {completed && <RetroIcon name="check" size={20} />}
                                    </button>
                                    <div className="habit-card__info">
                                        <div className="habit-card__name">
                                            <span className="habit-card__icon">
                                                {isEmoji ? habit.icon : <RetroIcon name={habit.icon as IconName} size={20} />}
                                            </span>
                                            {habit.name}
                                        </div>
                                        <div className="habit-card__meta">
                                            <span className="habit-streak">
                                                <RetroIcon name="bolt" size={12} color="var(--retro-orange)" /> {habit.streak}
                                            </span>
                                            <span className="habit-reward">
                                                <RetroIcon name="coin" size={12} color="var(--coin-gold)" /> +{habit.coinReward}
                                            </span>
                                        </div>
                                    </div>
                                    {coinPopId === habit.id && (
                                        <div className="coin-pop">+{habit.coinReward}</div>
                                    )}
                                    <button
                                        className="habit-delete"
                                        onClick={() => deleteHabit(habit.id)}
                                        title="Delete habit"
                                    >
                                        <RetroIcon name="cross" size={16} />
                                    </button>
                                </div>
                            );
                        })
                    )
                ) : (
                    /* Todos List */
                    todos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">
                                <RetroIcon name="check" size={48} color="var(--text-muted)" />
                            </div>
                            <p className="empty-state__text">No pending tasks. Clear the deck!</p>
                        </div>
                    ) : (
                        todos.map((todo, i) => (
                            <div
                                key={todo.id}
                                className={`habit-card retro-panel ${todo.completed ? 'habit-card--done' : ''}`}
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <button
                                    className={`habit-check ${todo.completed ? 'habit-check--done' : ''}`}
                                    onClick={() => handleTodoToggle(todo.id, todo.coinReward)}
                                    id={`todo-toggle-${todo.id}`}
                                >
                                    {todo.completed && <RetroIcon name="check" size={20} />}
                                </button>
                                <div className="habit-card__info">
                                    <div className="habit-card__name">
                                        <span className="habit-card__icon">
                                            <RetroIcon name={todo.completed ? 'check' : 'target'} size={20} />
                                        </span>
                                        <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? 'var(--text-muted)' : 'inherit' }}>
                                            {todo.text || '(no text)'}
                                        </span>
                                    </div>
                                    <div className="habit-card__meta">
                                        <span className="habit-reward">
                                            <RetroIcon name="coin" size={12} color="var(--coin-gold)" /> +{todo.coinReward}
                                        </span>
                                    </div>
                                </div>
                                {coinPopId === todo.id && (
                                    <div className="coin-pop">+{todo.coinReward}</div>
                                )}
                                <button
                                    className="habit-delete"
                                    onClick={() => deleteTodo(todo.id)}
                                >
                                    <RetroIcon name="cross" size={16} />
                                </button>
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Add Button */}
            <button
                className="habit-add-fab retro-btn retro-btn--primary"
                onClick={() => setShowAdd(true)}
                id="add-habit-btn"
            >
                <RetroIcon name="plus" size={16} style={{ marginRight: 6 }} />
                {activeTab === 'habits' ? 'NEW HABIT' : 'NEW TASK'}
            </button>

            {/* Add Modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="font-retro" style={{ fontSize: 12, color: 'var(--retro-cyan)', marginBottom: 'var(--space-lg)' }}>
                            {activeTab === 'habits' ? 'New Habit' : 'New One-off Task'}
                        </h2>

                        {activeTab === 'habits' ? (
                            // Habit Form
                            <>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        className="retro-input"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="e.g. Morning run"
                                        id="habit-name-input"
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Icon</label>
                                    <div className="icon-picker">
                                        {VALID_HABIT_ICONS.map(icon => (
                                            <button
                                                key={icon}
                                                className={`icon-btn ${newIcon === icon ? 'icon-btn--selected' : ''}`}
                                                onClick={() => setNewIcon(icon)}
                                            >
                                                <RetroIcon name={icon} size={20} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Frequency</label>
                                    <div className="freq-toggle">
                                        <button
                                            className={`retro-btn ${newFrequency === 'daily' ? 'retro-btn--primary' : ''}`}
                                            onClick={() => setNewFrequency('daily')}
                                        >
                                            Daily
                                        </button>
                                        <button
                                            className={`retro-btn ${newFrequency === 'weekly' ? 'retro-btn--primary' : ''}`}
                                            onClick={() => setNewFrequency('weekly')}
                                        >
                                            Weekly
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Coin Reward</label>
                                    <input
                                        className="retro-input"
                                        type="number"
                                        value={newReward}
                                        onChange={e => setNewReward(Number(e.target.value))}
                                        min={1}
                                        max={100}
                                        id="habit-reward-input"
                                    />
                                </div>
                            </>
                        ) : (
                            // Todo Form
                            <>
                                <div className="form-group">
                                    <label className="form-label">Task Description</label>
                                    <input
                                        className="retro-input"
                                        value={newTodoText}
                                        onChange={e => setNewTodoText(e.target.value)}
                                        placeholder="e.g. Clean the garage"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Coin Reward</label>
                                    <input
                                        className="retro-input"
                                        type="number"
                                        value={newTodoReward}
                                        onChange={e => setNewTodoReward(Number(e.target.value))}
                                        min={1}
                                        max={500}
                                    />
                                </div>
                            </>
                        )}

                        <div className="modal-actions">
                            <button className="retro-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                            <button className="retro-btn retro-btn--primary" onClick={activeTab === 'habits' ? handleAdd : handleAddTodo} id="save-habit-btn">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSpin && settings && (
                <DailySpinModal
                    onClose={() => setShowSpin(false)}
                    streakLevel={settings.dailyCompletionStreak}
                />
            )}
        </div>
    );
}
