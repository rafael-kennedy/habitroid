import { create } from 'zustand';
import { db, type Habit } from '../services/db';
import { useEconomyStore } from './economyStore';

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

function calculateStreak(completions: string[]): number {
    if (completions.length === 0) return 0;

    const sorted = [...completions].sort().reverse();
    const today = todayISO();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Streak must include today or yesterday
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
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
        // Dexie stores booleans as 0/1 in indexes, load all and filter
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
            // Undo completion
            newCompletions = habit.completions.filter(d => d !== today);
        } else {
            // Complete
            newCompletions = [...habit.completions, today];
            coinsEarned = habit.coinReward;
        }

        const streak = calculateStreak(newCompletions);
        const bestStreak = Math.max(streak, habit.bestStreak);

        // Bonus coins for streaks
        if (!alreadyDone && streak > 0 && streak % 7 === 0) {
            coinsEarned += Math.floor(habit.coinReward * 2); // 7-day streak bonus
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

        // Check global streak after state update
        await get().checkGlobalStreak();

        return coinsEarned;
    },

    checkGlobalStreak: async () => {
        const settings = useEconomyStore.getState().settings;
        if (!settings) return;

        const today = todayISO();
        // Check if already processed today
        if (settings.lastDailyCompletionDate === today) return;

        // Check if all *daily* habits are completed today
        const dailyHabits = get().habits.filter(h => h.frequency === 'daily' && !h.archived);
        if (dailyHabits.length === 0) return; // No daily habits to track

        const allDone = dailyHabits.every(h => h.completions.includes(today));

        if (allDone) {
            const lastDateStr = settings.lastDailyCompletionDate || '1970-01-01';
            // Calculate diff in days
            const current = new Date(today);
            const last = new Date(lastDateStr);
            const diffTime = Math.abs(current.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = settings.dailyCompletionStreak;
            let newArmor = settings.streakArmor;

            if (diffDays === 1) {
                // Perfect streak continuing
                newStreak++;
            } else if (diffDays > 1) {
                // Missed one or more days
                if (newArmor > 0) {
                    // Armor protects the streak!
                    newArmor--;
                    newStreak++;
                    // Ideally notify user here, but we'll reflect it in UI state
                } else {
                    // Streak broken
                    newStreak = 1;
                }
            } else {
                // diffDays === 0 (already handled by top check, but safe fallback)
                // or first time ever
                if (newStreak === 0) newStreak = 1;
            }

            // Bonus: Grant 1 Armor every 7 days, capped at 2
            if (newStreak > 0 && newStreak % 7 === 0) {
                if (newArmor < 2) {
                    newArmor++;
                }
            }

            await useEconomyStore.getState().updateSettings({
                dailyCompletionStreak: newStreak,
                lastDailyCompletionDate: today,
                streakArmor: newArmor,
            });
        }
    },

    isCompletedToday: (id) => {
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return false;
        return habit.completions.includes(todayISO());
    },
}));
