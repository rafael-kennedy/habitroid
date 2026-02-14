import { useEffect, useState } from 'react';
import { useFoodStore } from '../store/foodStore';
import { useEconomyStore } from '../store/economyStore';
import { analyzeFoodWithAI } from '../services/openai';
import { db } from '../services/db';
import CoinDisplay from '../components/CoinDisplay';
import RetroIcon, { type IconName } from '../components/RetroIcon';
import './FoodScreen.css';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_SECTIONS: { type: MealType; icon: IconName; label: string }[] = [
    { type: 'breakfast', icon: 'coffee', label: 'Breakfast' },
    { type: 'lunch', icon: 'burger', label: 'Lunch' },
    { type: 'dinner', icon: 'utensils', label: 'Dinner' },
    { type: 'snack', icon: 'cookie', label: 'Snacks' },
];

export default function FoodScreen() {
    const { entries, selectedDate, loading, loadEntries, addEntry, deleteEntry, getDailyTotals, setSelectedDate } = useFoodStore();
    const { earnCoins } = useEconomyStore();
    const [showAdd, setShowAdd] = useState(false);
    const [addMealType, setAddMealType] = useState<MealType>('breakfast');
    const [foodInput, setFoodInput] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');
    // Manual entry state
    const [manualMode, setManualMode] = useState(false);
    const [manualCals, setManualCals] = useState(0);
    const [manualProtein, setManualProtein] = useState(0);
    const [manualCarbs, setManualCarbs] = useState(0);
    const [manualFat, setManualFat] = useState(0);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    const totals = getDailyTotals();

    const handleAIAnalyze = async () => {
        if (!foodInput.trim()) return;
        setAnalyzing(true);
        setError('');

        try {
            const settings = await db.settings.get('settings');
            if (!settings?.openaiApiKey) {
                setError('Set your OpenAI API key in Settings (gear icon).');
                setAnalyzing(false);
                return;
            }

            const result = await analyzeFoodWithAI(settings.openaiApiKey, foodInput);
            const coins = await addEntry({
                description: result.description,
                mealType: addMealType,
                calories: result.calories,
                protein: result.protein,
                carbs: result.carbs,
                fat: result.fat,
                date: selectedDate,
                aiGenerated: true,
            });
            await earnCoins(coins, 'food', 'Logged food');
            setFoodInput('');
            setShowAdd(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleManualAdd = async () => {
        if (!foodInput.trim()) return;
        const coins = await addEntry({
            description: foodInput.trim(),
            mealType: addMealType,
            calories: manualCals,
            protein: manualProtein,
            carbs: manualCarbs,
            fat: manualFat,
            date: selectedDate,
            aiGenerated: false,
        });
        await earnCoins(coins, 'food', 'Logged food');
        setFoodInput('');
        setManualCals(0);
        setManualProtein(0);
        setManualCarbs(0);
        setManualFat(0);
        setShowAdd(false);
    };

    const openAddModal = (mealType: MealType) => {
        setAddMealType(mealType);
        setShowAdd(true);
        setError('');
        setManualMode(false);
        setFoodInput('');
    };

    const changeDate = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const today = new Date().toISOString().split('T')[0];

    if (loading) {
        return <div className="screen"><p className="text-muted">Loading...</p></div>;
    }

    return (
        <div className="screen" id="food-screen">
            <div className="food-header">
                <div>
                    <h1 className="screen-title">Food Log</h1>
                </div>
                <CoinDisplay size="lg" />
            </div>

            {/* Date nav */}
            <div className="date-nav retro-panel">
                <button className="retro-btn icon-only" onClick={() => changeDate(-1)}>
                    <RetroIcon name="chevron-left" size={20} />
                </button>
                <span className="date-nav__label font-retro">
                    {selectedDate === today ? 'Today' : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <button className="retro-btn icon-only" onClick={() => changeDate(1)} disabled={selectedDate >= today}>
                    <RetroIcon name="chevron-right" size={20} />
                </button>
            </div>

            {/* Daily summary */}
            <div className="macro-summary retro-panel">
                <div className="macro-item">
                    <span className="macro-value">{totals.calories}</span>
                    <span className="macro-label">Cal</span>
                </div>
                <div className="macro-divider" />
                <div className="macro-item">
                    <span className="macro-value macro-value--protein">{totals.protein}g</span>
                    <span className="macro-label">Protein</span>
                </div>
                <div className="macro-divider" />
                <div className="macro-item">
                    <span className="macro-value macro-value--carbs">{totals.carbs}g</span>
                    <span className="macro-label">Carbs</span>
                </div>
                <div className="macro-divider" />
                <div className="macro-item">
                    <span className="macro-value macro-value--fat">{totals.fat}g</span>
                    <span className="macro-label">Fat</span>
                </div>
            </div>

            {/* Meal sections */}
            {MEAL_SECTIONS.map(section => {
                const sectionEntries = entries.filter(e => e.mealType === section.type);
                return (
                    <div key={section.type} className="meal-section">
                        <div className="meal-section__header">
                            <span className="meal-section__title">
                                <RetroIcon name={section.icon} size={18} style={{ marginRight: 8 }} /> {section.label}
                            </span>
                            <button
                                className="meal-add-btn"
                                onClick={() => openAddModal(section.type)}
                                id={`add-${section.type}-btn`}
                            >
                                <RetroIcon name="plus" size={14} />
                            </button>
                        </div>
                        {sectionEntries.length === 0 ? (
                            <p className="meal-empty">No entries</p>
                        ) : (
                            sectionEntries.map(entry => (
                                <div key={entry.id} className="food-entry retro-panel">
                                    <div className="food-entry__info">
                                        <span className="food-entry__name">
                                            {entry.aiGenerated && <span className="ai-badge">AI</span>}
                                            {entry.description}
                                        </span>
                                        <span className="food-entry__macros">
                                            {entry.calories} cal · {entry.protein}p · {entry.carbs}c · {entry.fat}f
                                        </span>
                                    </div>
                                    <button className="habit-delete" onClick={() => deleteEntry(entry.id)}>
                                        <RetroIcon name="cross" size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                );
            })}

            {/* Add Modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="font-retro" style={{ fontSize: 11, color: 'var(--retro-cyan)', marginBottom: 'var(--space-lg)' }}>
                            Add {addMealType}
                        </h2>

                        <div className="form-group">
                            <label className="form-label">What did you eat?</label>
                            <input
                                className="retro-input"
                                value={foodInput}
                                onChange={e => setFoodInput(e.target.value)}
                                placeholder="e.g. grilled chicken salad with ranch"
                                id="food-input"
                                autoFocus
                            />
                        </div>

                        {!manualMode ? (
                            <>
                                <div className="food-actions">
                                    <button
                                        className="retro-btn retro-btn--primary"
                                        onClick={handleAIAnalyze}
                                        disabled={analyzing || !foodInput.trim()}
                                        id="analyze-food-btn"
                                    >
                                        {analyzing ? (
                                            <span className="flex-center gap-xs">⟳ Analyzing...</span>
                                        ) : (
                                            <span className="flex-center gap-xs">
                                                <RetroIcon name="mind" size={16} /> AI Analyze
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        className="retro-btn"
                                        onClick={() => setManualMode(true)}
                                    >
                                        <span className="flex-center gap-xs">
                                            <RetroIcon name="edit" size={16} /> Manual
                                        </span>
                                    </button>
                                </div>
                                {error && <p className="food-error">{error}</p>}
                            </>
                        ) : (
                            <>
                                <div className="macro-inputs">
                                    <div className="form-group">
                                        <label className="form-label">Calories</label>
                                        <input className="retro-input" type="number" value={manualCals} onChange={e => setManualCals(Number(e.target.value))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Protein (g)</label>
                                        <input className="retro-input" type="number" value={manualProtein} onChange={e => setManualProtein(Number(e.target.value))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Carbs (g)</label>
                                        <input className="retro-input" type="number" value={manualCarbs} onChange={e => setManualCarbs(Number(e.target.value))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fat (g)</label>
                                        <input className="retro-input" type="number" value={manualFat} onChange={e => setManualFat(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="retro-btn" onClick={() => setManualMode(false)}>Back</button>
                                    <button className="retro-btn retro-btn--primary" onClick={handleManualAdd}>Add Entry</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
