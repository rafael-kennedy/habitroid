import { create } from 'zustand';
import { db, type FoodEntry } from '../services/db';

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

interface DailyTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface FoodState {
    entries: FoodEntry[];
    selectedDate: string;
    loading: boolean;
    setSelectedDate: (date: string) => void;
    loadEntries: (date?: string) => Promise<void>;
    addEntry: (entry: Omit<FoodEntry, 'id' | 'timestamp' | 'coinsEarned'>) => Promise<number>; // returns coins
    updateEntry: (id: string, updates: Partial<FoodEntry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    getDailyTotals: () => DailyTotals;
}

const COINS_PER_FOOD_LOG = 5;

export const useFoodStore = create<FoodState>((set, get) => ({
    entries: [],
    selectedDate: todayISO(),
    loading: true,

    setSelectedDate: (date) => {
        set({ selectedDate: date });
        get().loadEntries(date);
    },

    loadEntries: async (date?: string) => {
        const targetDate = date || get().selectedDate;
        const entries = await db.foodEntries.where('date').equals(targetDate).toArray();
        set({ entries, loading: false });
    },

    addEntry: async (data) => {
        const entry: FoodEntry = {
            ...data,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            coinsEarned: COINS_PER_FOOD_LOG,
        };
        await db.foodEntries.put(entry);
        set(state => ({ entries: [...state.entries, entry] }));
        return COINS_PER_FOOD_LOG;
    },

    updateEntry: async (id, updates) => {
        await db.foodEntries.update(id, updates);
        set(state => ({
            entries: state.entries.map(e => e.id === id ? { ...e, ...updates } : e),
        }));
    },

    deleteEntry: async (id) => {
        await db.foodEntries.delete(id);
        set(state => ({ entries: state.entries.filter(e => e.id !== id) }));
    },

    getDailyTotals: () => {
        const entries = get().entries;
        return entries.reduce<DailyTotals>(
            (acc, e) => ({
                calories: acc.calories + e.calories,
                protein: acc.protein + e.protein,
                carbs: acc.carbs + e.carbs,
                fat: acc.fat + e.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
    },
}));
