import { useEffect, useState, useRef } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useTodoStore } from '../store/todoStore';
import { useEconomyStore } from '../store/economyStore';
import CoinDisplay from '../components/CoinDisplay';
import RetroIcon, { type IconName } from '../components/RetroIcon';
import DailySpinModal from '../components/DailySpinModal';
import WeeklySpinModal from '../components/WeeklySpinModal';
import CoinExplosion from '../components/CoinExplosion';
import { motion, AnimatePresence } from 'framer-motion';
import './HabitScreen.css';


// Note: 'star' might not be in my list, let me check RetroIcon.tsx. 
// I didn't add 'star'. I'll stick to the ones I have:
const VALID_HABIT_ICONS: IconName[] = [
    // Activities & Core
    'run', 'book', 'water', 'mind', 'weights', 'moon', 'sun', 'target',
    'music', 'art', 'code', 'pill', 'phone', 'happy', 'bike', 'walk',

    // Food
    'burger', 'apple', 'banana', 'carrot', 'bread', 'chicken', 'cookie',
    'coffee', 'utensils', 'pizza', 'beer', 'milk', 'grape', 'meat', 'egg',

    // Tools & Chores
    'car', 'hammer', 'wrench', 'bed', 'shower', 'briefcase', 'credit-card',
    'cash', 'sofa', 'clean', 'trash',

    // Nature
    'tree', 'fire', 'wind', 'rain', 'flower', 'mountain',

    // Stats/Other
    'trophy', 'bolt', 'heart', 'star', 'shield', 'coin'
];

export default function HabitScreen() {
    const { habits, loading, loadHabits, addHabit, updateHabit, toggleCompletion, deleteHabit, isCompletedToday } = useHabitStore();
    const { todos, loadTodos, addTodo, updateTodo, toggleTodo, deleteTodo } = useTodoStore();
    const { earnCoins } = useEconomyStore();
    const [activeTab, setActiveTab] = useState<'habits' | 'todos'>('habits');
    const [showAdd, setShowAdd] = useState(false);
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState<IconName>('target');
    const [newReward, setNewReward] = useState(10);
    const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'anytime'>('daily');

    // New Frequency State
    const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Default all days
    const [targetCount, setTargetCount] = useState<number>(1);

    const [coinPopId, setCoinPopId] = useState<string | null>(null);
    const [showSpin, setShowSpin] = useState(false);
    const [showWeeklySpin, setShowWeeklySpin] = useState(false);

    // Derived state for spin availability
    const { settings } = useEconomyStore();
    const today = new Date().toISOString().split('T')[0];

    // DAILY SPIN Logic
    const dailyHabits = habits.filter(h => h.frequency === 'daily' && !h.archived);
    // Only care about habits relevant to TODAY
    const todayDay = new Date().getDay();
    const relevantDailyHabits = dailyHabits.filter(h => {
        const tDays = h.targetDays ?? [0, 1, 2, 3, 4, 5, 6];
        return tDays.includes(todayDay);
    });

    const allDailyDone = relevantDailyHabits.length > 0 && relevantDailyHabits.every(h => isCompletedToday(h.id));
    const spinAvailable = allDailyDone && settings?.lastSpinDate !== today;

    // WEEKLY SPIN Logic
    // Spin available if we have a weekly streak AND haven't spun this week.
    // "Week" logic is complex. Let's simplify: 
    // If settings.lastWeeklyCompletionWeek == CURRENT WEEK, it means we completed the streak THIS week.
    // If lastWeeklySpinDate < lastWeeklyCompletionWeek (lexicographically roughly works but ISO dates vs ISO weeks...)
    // Simplest: Check if lastWeeklySpinDate is in THIS week.

    function getISOWeek(dateStr: string): string {
        const date = new Date(dateStr);
        const day = date.getDay() || 7;
        date.setDate(date.getDate() + 4 - day);
        const year = date.getFullYear();
        const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1) / 7);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    const currentWeekIdx = getISOWeek(today);
    // We are eligible if we completed the weekly streak requirement THIS WEEK
    // AND we haven't already spun THIS WEEK.
    const weeklyStreakJustMet = settings?.lastWeeklyCompletionWeek === currentWeekIdx;

    let weeklySpinAvailable = false;
    if (settings && weeklyStreakJustMet) {
        const lastSpinWk = settings.lastWeeklySpinDate ? getISOWeek(settings.lastWeeklySpinDate) : '';
        if (lastSpinWk !== currentWeekIdx) {
            weeklySpinAvailable = true;
        }
    }

    // Todo specific state
    const [newTodoText, setNewTodoText] = useState('');
    const [newTodoReward, setNewTodoReward] = useState(15);

    // Long Press Logic
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pressStartPos = useRef<{ x: number, y: number } | null>(null);
    const isLongPress = useRef(false);

    const handlePointerDown = (item: any, type: 'habit' | 'todo', e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;

        isLongPress.current = false;
        pressStartPos.current = { x: e.clientX, y: e.clientY };

        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            if (type === 'habit') handleEdit(item);
            else handleEditTodo(item);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!longPressTimer.current || !pressStartPos.current) return;
        const dx = Math.abs(e.clientX - pressStartPos.current.x);
        const dy = Math.abs(e.clientY - pressStartPos.current.y);
        if (dx > 10 || dy > 10) {
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
            pressStartPos.current = null;
        }
    };

    const handlePointerUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        pressStartPos.current = null;
    };

    const handlePointerCancel = () => {
        handlePointerUp();
    };

    useEffect(() => {
        loadHabits();
        loadTodos();
    }, [loadHabits, loadTodos]);

    const handleToggle = async (id: string) => {
        const coins = await toggleCompletion(id);
        // If we earned coins (meaning we completed it, not un-completed it), trigger explosion
        if (coins > 0) {
            await earnCoins(coins, 'habit', `Completed habit`);
            setCoinPopId(id);
            // Auto hide explosion after animation
            setTimeout(() => setCoinPopId(null), 2500);
        }
    };

    const handleTodoToggle = async (id: string, reward: number) => {
        const todo = todos.find(t => t.id === id);
        if (todo && !todo.completed) {
            setCoinPopId(id);
            setTimeout(() => setCoinPopId(null), 2500);
        }
        await toggleTodo(id, reward);
    };

    const handleAdd = async () => {
        if (!newName.trim()) return;

        if (editingHabitId) {
            await updateHabit(editingHabitId, {
                name: newName.trim(),
                icon: newIcon,
                frequency: newFrequency,
                coinReward: newReward,
                targetDays: newFrequency === 'daily' ? targetDays : undefined,
                targetCount: newFrequency === 'weekly' ? targetCount : undefined,
            });
            setEditingHabitId(null);
        } else {
            await addHabit({
                name: newName.trim(),
                icon: newIcon,
                frequency: newFrequency,
                coinReward: newReward,
                targetDays: newFrequency === 'daily' ? targetDays : undefined,
                targetCount: newFrequency === 'weekly' ? targetCount : undefined,
            });
        }

        setNewName('');
        setNewIcon('target');
        setNewReward(10);
        // Reset defaults
        setNewFrequency('daily');
        setTargetDays([0, 1, 2, 3, 4, 5, 6]);
        setTargetCount(1);
        setShowAdd(false);
    };

    const handleEdit = (habit: any) => {
        setEditingHabitId(habit.id);
        setNewName(habit.name);
        setNewIcon(habit.icon as IconName);
        setNewReward(habit.coinReward);
        setNewFrequency(habit.frequency);
        if (habit.targetDays) setTargetDays(habit.targetDays);
        if (habit.targetCount) setTargetCount(habit.targetCount);
        setShowAdd(true);
    };

    const handleAddTodo = async () => {
        if (!newTodoText.trim()) return;

        if (editingHabitId) {
            // We reuse editingHabitId for todos too since they rely on separate stores but share the UI state sort of (activeTab distinguishes)
            // But wait, updateTodo is not in the scope of this particular change request but let's be consistent if we can.
            // Actually, the user asked for "edit an existing habit". 
            // I'll add basic todo edit support too for completeness if the interface supports it.
            // But let's check if todoStore supports update.
            if (updateTodo) {
                await updateTodo(editingHabitId, { text: newTodoText.trim(), coinReward: newTodoReward });
            }
            setEditingHabitId(null);
        } else {
            await addTodo(newTodoText.trim(), newTodoReward);
        }

        setNewTodoText('');
        setNewTodoReward(15);
        setShowAdd(false);
    };

    const handleEditTodo = (todo: any) => {
        setEditingHabitId(todo.id);
        setNewTodoText(todo.text);
        setNewTodoReward(todo.coinReward);
        setShowAdd(true);
    };

    const toggleDay = (day: number) => {
        if (targetDays.includes(day)) {
            // Don't allow empty set? Or maybe 1 day min.
            if (targetDays.length > 1) {
                setTargetDays(targetDays.filter(d => d !== day));
            }
        } else {
            setTargetDays([...targetDays, day].sort());
        }
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
                <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-4">
                    {/* Daily Streak */}
                    <div className="text-sm font-retro text-accent flex items-center gap-2">
                        <span>DAILY STREAK: </span>
                        <motion.span
                            key={settings.dailyCompletionStreak}
                            animate={{ scale: [1, 1.5, 1], color: ['#fff', '#00ffff', '#fff'] }}
                            transition={{ duration: 0.5 }}
                        >
                            {settings.dailyCompletionStreak}
                        </motion.span>
                        {settings.streakArmor > 0 && (
                            <div className="flex items-center text-xs text-muted" title="Streak Armor Active">
                                <RetroIcon name="shield" size={14} color="var(--retro-cyan)" style={{ marginRight: 4 }} />
                                {settings.streakArmor}
                            </div>
                        )}
                    </div>

                    {/* Weekly Streak */}
                    <div className="text-sm font-retro text-muted" style={{ color: 'var(--retro-magenta)' }}>
                        WEEKLY STREAK: {settings.weeklyCompletionStreak || 0}
                    </div>
                </div>
            )}

            {/* Weekly Spin Banner */}
            {weeklySpinAvailable && activeTab === 'habits' && (
                <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="retro-panel w-full mb-2 flex items-center justify-between p-3 animate-pulse"
                    onClick={() => setShowWeeklySpin(true)}
                    style={{ borderColor: 'var(--retro-magenta)', background: 'rgba(255, 0, 255, 0.1)', boxShadow: '0 0 15px rgba(255,0,255,0.2)' }}
                >
                    <div className="flex items-center gap-2">
                        <RetroIcon name="star" size={20} color="var(--retro-magenta)" />
                        <span className="font-retro" style={{ color: 'var(--retro-magenta)' }}>WEEKLY SPIN UNLOCKED!</span>
                    </div>
                    <RetroIcon name="arrow-right" size={16} color="var(--retro-magenta)" />
                </motion.button>
            )}

            {/* Daily Spin Banner */}
            {spinAvailable && activeTab === 'habits' && (
                <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="retro-panel w-full mb-4 flex items-center justify-between p-3 bg-retro-gold/10 border-retro-gold animate-pulse"
                    onClick={() => setShowSpin(true)}
                    style={{ borderColor: 'var(--coin-gold)', background: 'rgba(255, 215, 0, 0.1)' }}
                >
                    <div className="flex items-center gap-2">
                        <RetroIcon name="star" size={20} color="var(--coin-gold)" />
                        <span className="font-retro text-gold">DAILY SPIN AVAILABLE!</span>
                    </div>
                    <RetroIcon name="arrow-right" size={16} color="var(--coin-gold)" />
                </motion.button>
            )}

            {/* Progress summary - Only for Habits */}
            {activeTab === 'habits' && (
                <div className="retro-panel habit-progress">
                    <div className="habit-progress__label">
                        Today's Progress: {relevantDailyHabits.filter(h => isCompletedToday(h.id)).length} / {relevantDailyHabits.length}
                    </div>
                    <div className="progress-bar">
                        <motion.div
                            className="progress-bar__fill"
                            initial={{ width: 0 }}
                            animate={{
                                width: relevantDailyHabits.length > 0
                                    ? `${(relevantDailyHabits.filter(h => isCompletedToday(h.id)).length / relevantDailyHabits.length) * 100}%`
                                    : '0%'
                            }}
                            transition={{ type: 'spring', stiffness: 50 }}
                        />
                    </div>
                </div>
            )}

            {/* Lists */}
            <div className="habit-list">
                <AnimatePresence mode='popLayout'>
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

                                // Determine badge text
                                let badge = '';
                                if (habit.frequency === 'weekly') {
                                    badge = `${habit.targetCount}/wk`;
                                } else if (habit.frequency === 'daily') {
                                    const days = habit.targetDays ?? [0, 1, 2, 3, 4, 5, 6];
                                    if (days.length === 7) badge = 'Daily';
                                    else {
                                        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                                        badge = days.map(d => dayNames[d]).join('');
                                    }
                                } else {
                                    badge = 'Anytime';
                                }

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2, delay: i * 0.05 }}
                                        key={habit.id}
                                        className={`habit-card retro-panel ${completed && habit.frequency !== 'anytime' ? 'habit-card--done' : ''}`}
                                        onPointerDown={(e) => handlePointerDown(habit, 'habit', e)}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        onPointerLeave={handlePointerUp}
                                        onPointerCancel={handlePointerCancel}
                                        style={{ userSelect: 'none', touchAction: 'pan-y' }}
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
                                                {habit.frequency !== 'anytime' && (
                                                    <span className="habit-streak">
                                                        <RetroIcon name="bolt" size={12} color="var(--retro-orange)" /> {habit.streak}
                                                    </span>
                                                )}
                                                <span className="habit-reward">
                                                    <RetroIcon name="coin" size={12} color="var(--coin-gold)" /> +{habit.coinReward}
                                                </span>
                                                <span className="habit-badge" style={{ fontSize: '9px', opacity: 0.7, border: '1px solid currentColor', padding: '1px 4px', borderRadius: '4px' }}>
                                                    {badge}
                                                </span>
                                            </div>
                                        </div>
                                        {coinPopId === habit.id && (
                                            <CoinExplosion amount={habit.coinReward} />
                                        )}
                                        {/* Delete button moved to edit screen */}
                                    </motion.div>
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
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                    key={todo.id}
                                    className={`habit-card retro-panel ${todo.completed ? 'habit-card--done' : ''}`}
                                    onPointerDown={(e) => handlePointerDown(todo, 'todo', e)}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerLeave={handlePointerUp}
                                    onPointerCancel={handlePointerCancel}
                                    style={{ userSelect: 'none', touchAction: 'pan-y' }}
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
                                        <CoinExplosion amount={todo.coinReward} />
                                    )}
                                    {/* Delete button moved to edit screen */}
                                </motion.div>
                            ))
                        )
                    )}
                </AnimatePresence>
            </div>

            {/* Add Button */}
            <motion.button
                className="habit-add-fab retro-btn retro-btn--primary"
                onClick={() => setShowAdd(true)}
                id="add-habit-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <RetroIcon name="plus" size={16} style={{ marginRight: 6 }} />
                {activeTab === 'habits' ? 'NEW HABIT' : 'NEW TASK'}
            </motion.button>

            {/* Add Modal */}
            <AnimatePresence>
                {showAdd && (
                    <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.4 }}
                        >
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
                                        <div className="freq-toggle" style={{ flexWrap: 'wrap' }}>
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
                                            <button
                                                className={`retro-btn ${newFrequency === 'anytime' ? 'retro-btn--primary' : ''}`}
                                                onClick={() => setNewFrequency('anytime')}
                                            >
                                                Anytime
                                            </button>
                                        </div>
                                    </div>

                                    {/* Custom Toggles for Frequency */}
                                    {newFrequency === 'daily' && (
                                        <div className="form-group">
                                            <label className="form-label">Active Days</label>
                                            <div className="flex gap-2 justify-between">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                    <button
                                                        key={i}
                                                        className={`retro-btn ${targetDays.includes(i) ? 'retro-btn--primary' : ''}`}
                                                        style={{ padding: '6px 8px', minWidth: '32px' }}
                                                        onClick={() => toggleDay(i)}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {newFrequency === 'weekly' && (
                                        <div className="form-group">
                                            <label className="form-label">Times Per Week</label>
                                            <input
                                                className="retro-input"
                                                type="number"
                                                min={1}
                                                max={7}
                                                value={targetCount}
                                                onChange={e => setTargetCount(Math.min(7, Math.max(1, Number(e.target.value))))}
                                            />
                                        </div>
                                    )}

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

                            <div className="modal-actions" style={{ justifyContent: editingHabitId ? 'space-between' : 'flex-end', width: '100%' }}>
                                {editingHabitId && (
                                    <button
                                        className="retro-btn"
                                        style={{ borderColor: 'var(--retro-red)', color: 'var(--retro-red)' }}
                                        onClick={() => {
                                            if (activeTab === 'habits') {
                                                deleteHabit(editingHabitId);
                                            } else {
                                                deleteTodo(editingHabitId);
                                            }
                                            setShowAdd(false);
                                            setEditingHabitId(null);
                                        }}
                                        title="Delete"
                                    >
                                        Delete
                                    </button>
                                )}
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    <button className="retro-btn" onClick={() => {
                                        setShowAdd(false);
                                        setEditingHabitId(null);
                                        setNewName('');
                                        setNewIcon('target');
                                        setNewReward(10);
                                        setNewFrequency('daily');
                                        setTargetDays([0, 1, 2, 3, 4, 5, 6]);
                                        setTargetCount(1);
                                        setNewTodoText('');
                                        setNewTodoReward(15);
                                    }}>Cancel</button>
                                    <button className="retro-btn retro-btn--primary" onClick={activeTab === 'habits' ? handleAdd : handleAddTodo} id="save-habit-btn">
                                        {editingHabitId ? 'Save Changes' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSpin && settings && (
                    <DailySpinModal
                        onClose={() => setShowSpin(false)}
                        streakLevel={settings.dailyCompletionStreak}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showWeeklySpin && settings && (
                    <WeeklySpinModal
                        onClose={() => setShowWeeklySpin(false)}
                        streakLevel={settings.weeklyCompletionStreak || 0}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
