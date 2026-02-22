import { useEffect } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useEconomyStore } from '../store/economyStore';
import RetroIcon from '../components/RetroIcon';
import { motion } from 'framer-motion';
import './StatsScreen.css';

export default function StatsScreen() {
    const { habits, loadHabits, loading } = useHabitStore();
    const { settings } = useEconomyStore();

    useEffect(() => {
        loadHabits();
    }, [loadHabits]);

    if (loading) {
        return <div className="screen"><p className="text-muted">Loading...</p></div>;
    }

    // Calculations
    const totalCompletions = habits.reduce((acc, h) => acc + h.completions.length, 0);
    const activeHabits = habits.filter(h => !h.archived);

    const longestActiveStreak = activeHabits.length > 0
        ? Math.max(...activeHabits.map(h => h.streak))
        : 0;

    const bestAllTimeStreak = activeHabits.length > 0
        ? Math.max(...activeHabits.map(h => h.bestStreak))
        : 0;

    const mostFrequentHabit = activeHabits.length > 0
        ? activeHabits.reduce((prev, current) =>
            (prev.completions.length > current.completions.length) ? prev : current
        )
        : null;

    const habitCompletionsChart = activeHabits.slice()
        .sort((a, b) => b.completions.length - a.completions.length)
        .slice(0, 5);

    const animationProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    };

    return (
        <div className="screen" id="stats-screen">
            <div className="stats-header">
                <h1 className="screen-title stats-title">
                    <RetroIcon name="stats" size={28} className="title-icon" />
                    STATISTICS
                </h1>
            </div>

            <div className="stats-grid">
                {/* Global Streaks Hero Card */}
                {settings && (
                    <motion.div
                        className="stats-card stats-card--hero retro-panel"
                        {...animationProps}
                    >
                        <div className="stats-card__icon-wrapper" style={{ color: 'var(--retro-cyan)' }}>
                            <RetroIcon name="shield" size={32} />
                        </div>
                        <div className="stats-card__content">
                            <h3 className="stats-card__label">GLOBAL STREAKS</h3>
                            <div className="global-streaks">
                                <div className="global-streak-item">
                                    <span className="global-streak-value" style={{ color: 'var(--retro-cyan)' }}>
                                        {settings.dailyCompletionStreak}
                                    </span>
                                    <span className="global-streak-label">DAILY</span>
                                </div>
                                <div className="global-streak-divider"></div>
                                <div className="global-streak-item">
                                    <span className="global-streak-value" style={{ color: 'var(--retro-magenta)' }}>
                                        {settings.weeklyCompletionStreak || 0}
                                    </span>
                                    <span className="global-streak-label">WEEKLY</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Total Completions */}
                <motion.div
                    className="stats-card retro-panel"
                    {...animationProps}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stats-card__icon-wrapper" style={{ color: 'var(--retro-green)' }}>
                        <RetroIcon name="check" size={24} />
                    </div>
                    <div className="stats-card__content">
                        <h3 className="stats-card__label">TOTAL COMPLETIONS</h3>
                        <p className="stats-card__value text-glow-green">{totalCompletions}</p>
                    </div>
                </motion.div>

                {/* Longest Active Streak */}
                <motion.div
                    className="stats-card retro-panel"
                    {...animationProps}
                    transition={{ delay: 0.15 }}
                >
                    <div className="stats-card__icon-wrapper" style={{ color: 'var(--retro-orange)' }}>
                        <RetroIcon name="bolt" size={24} />
                    </div>
                    <div className="stats-card__content">
                        <h3 className="stats-card__label">LONGEST ACTIVE STREAK</h3>
                        <p className="stats-card__value text-glow-orange">{longestActiveStreak} <span className="stats-unit">days</span></p>
                    </div>
                </motion.div>

                {/* Best All-Time Streak */}
                <motion.div
                    className="stats-card retro-panel"
                    {...animationProps}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stats-card__icon-wrapper" style={{ color: 'var(--coin-gold)' }}>
                        <RetroIcon name="trophy" size={24} />
                    </div>
                    <div className="stats-card__content">
                        <h3 className="stats-card__label">BEST ALL-TIME STREAK</h3>
                        <p className="stats-card__value text-glow-gold">{bestAllTimeStreak} <span className="stats-unit">days</span></p>
                    </div>
                </motion.div>

                {/* Most Frequent Habit */}
                {mostFrequentHabit && (
                    <motion.div
                        className="stats-card stats-card--full retro-panel"
                        {...animationProps}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="stats-card__icon-wrapper" style={{ color: 'var(--retro-magenta)' }}>
                            <RetroIcon name="heart" size={28} />
                        </div>
                        <div className="stats-card__content">
                            <h3 className="stats-card__label">MOST FREQUENT HABIT</h3>
                            <div className="most-frequent-habit">
                                <div className="mfh-icon">
                                    <RetroIcon name={mostFrequentHabit.icon as any} size={24} />
                                </div>
                                <div className="mfh-details">
                                    <span className="mfh-name">{mostFrequentHabit.name}</span>
                                    <span className="mfh-count">{mostFrequentHabit.completions.length} times</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Top Habits Leaderboard */}
            {habitCompletionsChart.length > 0 && (
                <motion.div
                    className="stats-leaderboard retro-panel"
                    {...animationProps}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="leaderboard-title">
                        <RetroIcon name="star" size={20} className="mr-2" color="var(--retro-yellow)" />
                        TOP HABITS
                    </h3>
                    <div className="leaderboard-list">
                        {habitCompletionsChart.map((habit, index) => {
                            const maxCompletions = habitCompletionsChart[0].completions.length || 1;
                            const percentage = (habit.completions.length / maxCompletions) * 100;

                            return (
                                <div key={habit.id} className="leaderboard-item">
                                    <div className="leaderboard-item-header">
                                        <div className="leaderboard-item-name">
                                            <span className="leaderboard-rank">#{index + 1}</span>
                                            <RetroIcon name={habit.icon as any} size={16} />
                                            <span>{habit.name}</span>
                                        </div>
                                        <span className="leaderboard-item-score">{habit.completions.length}</span>
                                    </div>
                                    <div className="leaderboard-bar-track">
                                        <motion.div
                                            className="leaderboard-bar-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: 0.5 + (index * 0.1), duration: 0.8, type: 'spring' }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
