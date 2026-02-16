import { create } from 'zustand';
import { db, type Habit } from '../services/db';
import { useEconomyStore } from './economyStore';

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

function getISOWeek(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const year = date.getUTCFullYear();
    const week = Math.ceil((((date.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000) + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
}

// Helper to check if a date string is a target day (0=Sun, 1=Mon...)
function isTargetDay(dateStr: string, targetDays: number[]): boolean {
    const day = new Date(dateStr).getUTCDay();
    return targetDays.includes(day);
}

function calculateStreak(completions: string[], frequency: Habit['frequency'], targetDays: number[] = [], targetCount: number = 1): number {
    if (frequency === 'anytime') return 0;
    if (completions.length === 0) return 0;

    const sorted = [...completions].sort().reverse();
    // Use UTC date for "today"
    const today = new Date().toISOString().split('T')[0];

    if (frequency === 'weekly') {
        const weeks: Record<string, number> = {};
        for (const date of sorted) {
            const week = getISOWeek(date);
            weeks[week] = (weeks[week] || 0) + 1;
        }

        const currentWk = getISOWeek(today);
        const isWeekComplete = (w: string) => (weeks[w] || 0) >= targetCount;

        // Iterate backwards from Previous Week
        // Use a date pointer initialized to 7 days ago
        let wDate = new Date();
        wDate.setUTCDate(wDate.getUTCDate() - 7);
        let wStr = getISOWeek(wDate.toISOString().split('T')[0]);
        let pastStreak = 0;

        for (let i = 0; i < 260; i++) {
            if (isWeekComplete(wStr)) {
                pastStreak++;
                wDate.setUTCDate(wDate.getUTCDate() - 7);
                wStr = getISOWeek(wDate.toISOString().split('T')[0]);
            } else {
                break;
            }
        }

        let totalStreak = pastStreak;
        if (isWeekComplete(currentWk)) {
            totalStreak++;
        }

        return totalStreak;
    }

    // Daily Handler
    let streak = 0;
    // We check from Yesterday backwards first to establish the "banked" streak.
    let d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);

    let loops = 0;
    while (loops < 365 * 5) { // Cap at 5 years
        loops++;
        const dateStr = d.toISOString().split('T')[0];

        if (isTargetDay(dateStr, targetDays)) {
            if (sorted.includes(dateStr)) {
                streak++;
            } else {
                break; // Broken!
            }
        }
        // Move back 1 day
        d.setUTCDate(d.getUTCDate() - 1);
    }

    // Now check Today
    if (isTargetDay(today, targetDays) && sorted.includes(today)) {
        streak++;
    }

    return streak;
}

interface HabitState {
    habits: Habit[];
    loading: boolean;
    loadHabits: () => Promise<void>;
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt' | 'archived'>) => Promise<void>;
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    toggleCompletion: (id: string) => Promise<number>; // returns coins earned (0 if uncompleted)
    checkGlobalStreak: () => Promise<void>;
    isCompletedToday: (id: string) => boolean;
}

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    loading: true,

    loadHabits: async () => {
        const allHabits = await db.habits.toArray();
        const active = allHabits.filter(h => !h.archived);
        set({ habits: active, loading: false });
    },

    addHabit: async (data) => {
        const habit: Habit = {
            ...data,
            id: crypto.randomUUID(),
            streak: 0,
            bestStreak: 0,
            completions: [],
            createdAt: new Date().toISOString(),
            archived: false,
            // Defaults
            targetDays: data.targetDays ?? (data.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : []),
            targetCount: data.targetCount ?? 1,
        };
        await db.habits.put(habit);
        set(state => ({ habits: [...state.habits, habit] }));
    },

    updateHabit: async (id, updates) => {
        await db.habits.update(id, updates);
        set(state => ({
            habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h),
        }));
    },

    deleteHabit: async (id) => {
        await db.habits.delete(id);
        set(state => ({ habits: state.habits.filter(h => h.id !== id) }));
    },

    toggleCompletion: async (id) => {
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return 0;

        const today = todayISO();
        const alreadyDone = habit.completions.includes(today);

        let newCompletions: string[];
        let coinsEarned = 0;

        if (alreadyDone) {
            newCompletions = habit.completions.filter(d => d !== today);
        } else {
            newCompletions = [...habit.completions, today];
            coinsEarned = habit.coinReward;
        }

        // Calculate Habit Streak
        const targetDays = habit.targetDays ?? (habit.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : []);
        const targetCount = habit.targetCount ?? 1;

        const streak = calculateStreak(newCompletions, habit.frequency, targetDays, targetCount);
        const bestStreak = Math.max(streak, habit.bestStreak);

        // Bonus coins for streaks (Daily/Weekly only)
        if (!alreadyDone && streak > 0 && streak % 7 === 0 && habit.frequency !== 'anytime') {
            coinsEarned += Math.floor(habit.coinReward * 2);
        }

        await db.habits.update(id, {
            completions: newCompletions,
            streak,
            bestStreak,
        });

        set(state => ({
            habits: state.habits.map(h =>
                h.id === id ? { ...h, completions: newCompletions, streak, bestStreak } : h
            ),
        }));

        // Check global streaks
        await get().checkGlobalStreak();

        return coinsEarned;
    },

    checkGlobalStreak: async () => {
        const settings = useEconomyStore.getState().settings;
        if (!settings) return;

        const today = todayISO();
        const currentWeek = getISOWeek(today);

        let newDailyStreak = settings.dailyCompletionStreak;
        let newWeeklyStreak = settings.weeklyCompletionStreak;
        let updates: Partial<typeof settings> = {};

        // 1. Daily Streak Check
        // Only active if we haven't processed today yet
        if (settings.lastDailyCompletionDate !== today) {
            const dailyHabits = get().habits.filter(h => h.frequency === 'daily' && !h.archived);

            // Should we only care about habits that have TODAY as a target day?
            // Yes. If I have a habit for "Mondays", and today is Tuesday, it shouldn't block my streak.
            const todayDay = new Date().getDay();
            const requiredHabits = dailyHabits.filter(h => {
                const targets = h.targetDays ?? [0, 1, 2, 3, 4, 5, 6];
                return targets.includes(todayDay);
            });

            if (requiredHabits.length > 0) {
                const allDone = requiredHabits.every(h => h.completions.includes(today));
                if (allDone) {
                    const lastDateStr = settings.lastDailyCompletionDate || '1970-01-01';
                    const diffDays = Math.ceil(Math.abs(new Date(today).getTime() - new Date(lastDateStr).getTime()) / (86400000));

                    let armor = settings.streakArmor;

                    if (diffDays === 1) {
                        newDailyStreak++;
                    } else if (diffDays > 1) {
                        if (armor > 0) {
                            armor--;
                            newDailyStreak++;
                            updates.streakArmor = armor;
                        } else {
                            newDailyStreak = 1;
                        }
                    } else {
                        // diffDays 0 (should correspond to early return above, but just in case)
                        if (newDailyStreak === 0) newDailyStreak = 1;
                    }

                    // Armor Bonus (every 7 days)
                    if (newDailyStreak > 0 && newDailyStreak % 7 === 0 && armor < 2) {
                        updates.streakArmor = (updates.streakArmor ?? armor) + 1;
                    }

                    updates.dailyCompletionStreak = newDailyStreak;
                    updates.lastDailyCompletionDate = today;
                }
            }
        }

        // 2. Weekly Streak Check
        if (settings.lastWeeklyCompletionWeek !== currentWeek) {
            const weeklyHabits = get().habits.filter(h => h.frequency === 'weekly' && !h.archived);
            if (weeklyHabits.length > 0) {
                // Check if ALL weekly habits have met their targetCount for THIS week
                const allMet = weeklyHabits.every(h => {
                    const completionsThisWeek = h.completions.filter(d => getISOWeek(d) === currentWeek).length;
                    return completionsThisWeek >= (h.targetCount ?? 1);
                });

                if (allMet) {
                    // Check logic against last week
                    // We need to parse weeks to check continuity... 
                    // Or simpler: Just store the streak count. 
                    // If lastWeeklyCompletionWeek was "last week", increment. Else reset to 1.

                    // Simple check: Is the last logged week exactly the previous week?
                    // Parsing ISO weeks is tedious.
                    // Let's assume the user opens the app regularly.
                    // We can check if "lastWeeklyCompletionWeek" is strictly previous to "currentWeek".

                    // Actually, if we just completed it *now*, we just updated it.
                    // We need to know if we missed a week.

                    // Safe approach:
                    // If lastWeeklyCompletionWeek is empty -> Streak = 1
                    newWeeklyStreak = 1;
                    if (settings.lastWeeklyCompletionWeek) {
                        const lastWeekID = getISOWeek(new Date(Date.now() - 7 * 86400000).toISOString());

                        // If the last recorded completion was LAST week, then we are consecutive.
                        if (settings.lastWeeklyCompletionWeek === lastWeekID) {
                            newWeeklyStreak = (settings.weeklyCompletionStreak || 0) + 1;
                        }
                    }

                    updates.weeklyCompletionStreak = newWeeklyStreak;
                    updates.lastWeeklyCompletionWeek = currentWeek;
                }
            }
        }

        if (Object.keys(updates).length > 0) {
            await useEconomyStore.getState().updateSettings(updates);
        }
    },

    isCompletedToday: (id) => {
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return false;
        return habit.completions.includes(todayISO());
    },
}));
