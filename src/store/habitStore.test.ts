import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db, initializeDB } from '../services/db';
import { useHabitStore } from './habitStore';
import { useEconomyStore } from './economyStore';

// Reset DB and Zustand stores between tests
beforeEach(async () => {
    await db.delete();
    await db.open();
    await initializeDB();
    // Reset Zustand stores
    useHabitStore.setState({ habits: [], loading: true });
    useEconomyStore.setState({ coinBalance: 0, transactions: [], settings: null, loading: true });
    await useEconomyStore.getState().loadEconomy();
});

afterEach(async () => {
    await db.delete();
});

describe('HabitStore', () => {

    describe('loadHabits', () => {
        it('should load empty list when no habits exist', async () => {
            await useHabitStore.getState().loadHabits();
            expect(useHabitStore.getState().habits).toEqual([]);
            expect(useHabitStore.getState().loading).toBe(false);
        });

        it('should load only non-archived habits', async () => {
            await db.habits.put({
                id: 'h1', name: 'Active Habit', icon: 'run',
                frequency: 'daily', coinReward: 10, streak: 0, bestStreak: 0,
                completions: [], createdAt: new Date().toISOString(), archived: false,
            });
            await db.habits.put({
                id: 'h2', name: 'Archived Habit', icon: 'book',
                frequency: 'daily', coinReward: 10, streak: 0, bestStreak: 0,
                completions: [], createdAt: new Date().toISOString(), archived: true,
            });

            await useHabitStore.getState().loadHabits();
            const habits = useHabitStore.getState().habits;
            expect(habits).toHaveLength(1);
            expect(habits[0].name).toBe('Active Habit');
        });
    });

    describe('addHabit', () => {
        it('should add a new habit with defaults', async () => {
            await useHabitStore.getState().addHabit({
                name: 'Morning Run',
                icon: 'run',
                frequency: 'daily',
                coinReward: 15,
            });

            const habits = useHabitStore.getState().habits;
            expect(habits).toHaveLength(1);
            expect(habits[0].name).toBe('Morning Run');
            expect(habits[0].icon).toBe('run');
            expect(habits[0].frequency).toBe('daily');
            expect(habits[0].coinReward).toBe(15);
            expect(habits[0].streak).toBe(0);
            expect(habits[0].bestStreak).toBe(0);
            expect(habits[0].completions).toEqual([]);
            expect(habits[0].archived).toBe(false);
            expect(habits[0].id).toBeTruthy();
            expect(habits[0].createdAt).toBeTruthy();
        });

        it('should persist habit to IndexedDB', async () => {
            await useHabitStore.getState().addHabit({
                name: 'Drink Water',
                icon: 'water',
                frequency: 'daily',
                coinReward: 5,
            });

            const dbHabits = await db.habits.toArray();
            expect(dbHabits).toHaveLength(1);
            expect(dbHabits[0].name).toBe('Drink Water');
        });
    });

    describe('toggleCompletion', () => {
        it('should mark habit as completed today and return coin reward', async () => {
            await useHabitStore.getState().addHabit({
                name: 'Test Habit',
                icon: 'target',
                frequency: 'daily',
                coinReward: 20,
            });

            const habit = useHabitStore.getState().habits[0];
            const coinsEarned = await useHabitStore.getState().toggleCompletion(habit.id);

            expect(coinsEarned).toBe(20);
            const updated = useHabitStore.getState().habits[0];
            const today = new Date().toISOString().split('T')[0];
            expect(updated.completions).toContain(today);
        });

        it('should allow un-completing a habit (returns 0 coins)', async () => {
            await useHabitStore.getState().addHabit({
                name: 'Test Habit',
                icon: 'target',
                frequency: 'daily',
                coinReward: 20,
            });

            const habit = useHabitStore.getState().habits[0];

            // Complete first
            await useHabitStore.getState().toggleCompletion(habit.id);
            expect(useHabitStore.getState().habits[0].completions).toHaveLength(1);

            // Un-complete
            const coins = await useHabitStore.getState().toggleCompletion(habit.id);
            expect(coins).toBe(0);
            expect(useHabitStore.getState().habits[0].completions).toHaveLength(0);
        });

        it('should calculate streak correctly for consecutive days', async () => {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

            await db.habits.put({
                id: 'h1', name: 'Streak Test', icon: 'bolt',
                frequency: 'daily', coinReward: 10, streak: 0, bestStreak: 0,
                completions: [twoDaysAgo, yesterday],
                createdAt: new Date().toISOString(), archived: false,
            });

            await useHabitStore.getState().loadHabits();
            await useHabitStore.getState().toggleCompletion('h1');

            const habit = useHabitStore.getState().habits[0];
            expect(habit.streak).toBe(3); // 3-day streak
        });

        it('should reset streak if there is a gap in completions', async () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

            await db.habits.put({
                id: 'h1', name: 'Gap Test', icon: 'bolt',
                frequency: 'daily', coinReward: 10, streak: 5, bestStreak: 5,
                completions: [threeDaysAgo], // Gap of 2 days
                createdAt: new Date().toISOString(), archived: false,
            });

            await useHabitStore.getState().loadHabits();
            await useHabitStore.getState().toggleCompletion('h1');

            const habit = useHabitStore.getState().habits[0];
            expect(habit.streak).toBe(1); // Reset to 1
        });

        it('should track bestStreak', async () => {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            await db.habits.put({
                id: 'h1', name: 'Best Streak', icon: 'trophy',
                frequency: 'daily', coinReward: 10, streak: 0, bestStreak: 10,
                completions: [yesterday],
                createdAt: new Date().toISOString(), archived: false,
            });

            await useHabitStore.getState().loadHabits();
            await useHabitStore.getState().toggleCompletion('h1');

            const habit = useHabitStore.getState().habits[0];
            expect(habit.streak).toBe(2);
            expect(habit.bestStreak).toBe(10); // bestStreak stays because 2 < 10
        });

        it('should return 0 for non-existent habit', async () => {
            const coins = await useHabitStore.getState().toggleCompletion('nonexistent');
            expect(coins).toBe(0);
        });
    });

    describe('isCompletedToday', () => {
        it('should return false for incomplete habit', async () => {
            await useHabitStore.getState().addHabit({
                name: 'Test', icon: 'target', frequency: 'daily', coinReward: 10,
            });
            const habit = useHabitStore.getState().habits[0];
            expect(useHabitStore.getState().isCompletedToday(habit.id)).toBe(false);
        });

        it('should return true after completion', async () => {
            await useHabitStore.getState().addHabit({
                name: 'Test', icon: 'target', frequency: 'daily', coinReward: 10,
            });
            const habit = useHabitStore.getState().habits[0];
            await useHabitStore.getState().toggleCompletion(habit.id);
            expect(useHabitStore.getState().isCompletedToday(habit.id)).toBe(true);
        });
    });

    describe('deleteHabit', () => {
        it('should remove habit from store and DB', async () => {
            await useHabitStore.getState().addHabit({
                name: 'To Delete', icon: 'cross', frequency: 'daily', coinReward: 10,
            });
            const habit = useHabitStore.getState().habits[0];

            await useHabitStore.getState().deleteHabit(habit.id);

            expect(useHabitStore.getState().habits).toHaveLength(0);
            const dbHabits = await db.habits.toArray();
            expect(dbHabits).toHaveLength(0);
        });
    });

    describe('updateHabit', () => {
        it('should update habit properties', async () => {
            await useHabitStore.getState().addHabit({
                name: 'Original', icon: 'target', frequency: 'daily', coinReward: 10,
            });
            const habit = useHabitStore.getState().habits[0];

            await useHabitStore.getState().updateHabit(habit.id, { name: 'Updated', coinReward: 25 });

            const updated = useHabitStore.getState().habits[0];
            expect(updated.name).toBe('Updated');
            expect(updated.coinReward).toBe(25);
        });
    });
});
