import Dexie, { type EntityTable } from 'dexie';

// ---- Data Types ----

export interface Habit {
    id: string;
    name: string;
    icon: string;
    frequency: 'daily' | 'weekly' | 'custom';
    customDays?: number[]; // 0=Sun..6=Sat for custom
    coinReward: number;
    streak: number;
    bestStreak: number;
    completions: string[]; // ISO date strings
    createdAt: string;
    archived: boolean;
}

export interface Todo {
    id: string;
    text: string;
    coinReward: number;
    completed: boolean;
    completedAt?: string;
    createdAt: string;
}

export interface FoodEntry {
    id: string;
    description: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string; // ISO date (YYYY-MM-DD)
    timestamp: string; // Full ISO timestamp
    aiGenerated: boolean;
    coinsEarned: number;
}

export interface CardInstance {
    id: string;
    definitionId: string;
    acquiredAt: string;
}

export interface Deck {
    id: string;
    name: string;
    cardIds: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CoinTransaction {
    id: string;
    amount: number; // positive = earn, negative = spend
    source: 'habit' | 'food' | 'game' | 'shop';
    description: string;
    timestamp: string;
}

export interface GameResult {
    id: string;
    mapId: string;
    deckId: string;
    wavesCompleted: number;
    score: number;
    coinsEarned: number;
    timestamp: string;
}

export interface AppSettings {
    id: string; // always 'settings'
    openaiApiKey: string;
    dailyCalorieGoal: number;
    dailyProteinGoal: number;
    dailyCarbsGoal: number;
    dailyFatGoal: number;
    coinBalance: number;
    // Daily Spin & Streak Global State
    streakArmor: number;
    dailyCompletionStreak: number;
    lastDailyCompletionDate: string; // ISO date
    lastSpinDate: string; // ISO date
    walkthroughCompleted: boolean;
    // Unlockables
    maxDecks: number;
    unlockedMapIds: string[];
    upgrades: Record<string, number>; // upgradeId -> level
}

// ---- Database ----

class HabitroidDB extends Dexie {
    habits!: EntityTable<Habit, 'id'>;
    foodEntries!: EntityTable<FoodEntry, 'id'>;
    todos!: EntityTable<Todo, 'id'>;
    cards!: EntityTable<CardInstance, 'id'>;
    decks!: EntityTable<Deck, 'id'>;
    transactions!: EntityTable<CoinTransaction, 'id'>;
    gameResults!: EntityTable<GameResult, 'id'>;
    settings!: EntityTable<AppSettings, 'id'>;

    constructor() {
        super('HabitroidDB');

        this.version(1).stores({
            habits: 'id, name, archived',
            foodEntries: 'id, date, mealType',
            cards: 'id, definitionId',
            decks: 'id, name',
            transactions: 'id, source, timestamp',
            gameResults: 'id, mapId, timestamp',
            settings: 'id',
        });

        // Version 2: Add todos table
        this.version(2).stores({
            todos: 'id, completed',
        });
    }
}

export const db = new HabitroidDB();

// Initialize default settings if not present
export async function initializeDB() {
    const existing = await db.settings.get('settings');
    if (!existing) {
        await db.settings.put({
            id: 'settings',
            openaiApiKey: '',
            dailyCalorieGoal: 2000,
            dailyProteinGoal: 150,
            dailyCarbsGoal: 250,
            dailyFatGoal: 65,
            coinBalance: 100, // starter coins
            streakArmor: 0,
            dailyCompletionStreak: 0,
            lastDailyCompletionDate: '',
            lastSpinDate: '',
            walkthroughCompleted: false,
            maxDecks: 3,
            unlockedMapIds: ['map-serpent'], // Start with only Serpent Pass
            upgrades: {},
        });
    } else {
        // Migration for existing users
        const updates: Partial<AppSettings> = {};
        if (existing.walkthroughCompleted === undefined) updates.walkthroughCompleted = false;
        if (existing.streakArmor === undefined) updates.streakArmor = 0;
        if (existing.dailyCompletionStreak === undefined) updates.dailyCompletionStreak = 0;
        if (existing.lastDailyCompletionDate === undefined) updates.lastDailyCompletionDate = '';
        if (existing.lastSpinDate === undefined) updates.lastSpinDate = '';
        if (existing.maxDecks === undefined) updates.maxDecks = 3;
        // If migrating, give them default unlocked maps if they played before? 
        // Or just 'map-serpent'. Let's be strict to the new progression.
        if (existing.unlockedMapIds === undefined) updates.unlockedMapIds = ['map-serpent', 'map-crossroads', 'map-gauntlet'];
        // Update: Implementation plan said lock Crossroads/Gauntlet.
        // But for existing users, maybe we should grandfather them? 
        // User said "The Crossroads: Lock. Unlock Cost: 1,000 Coins."
        // I will adhere to the "NewMaps" plan plan. 
        // Wait, for EXISTING users, if I lock maps they might have played, it's annoying.
        // But for "New Maps", they are new. 
        // The plan says "The Crossroads: Lock... The Gauntlet: Lock". 
        // These are EXISTING maps in the code.
        // I'll be nice and grandfather existing users to have 'map-crossroads' and 'map-gauntlet' if they are migrating, 
        // but new users only get serpent.
        // Actually, to test the feature, I should probably lock them for everyone or make it easy.
        // Let's stick to the plan: "The Crossroads: Lock... The Gauntlet: Lock."
        // I will NOT grandfather for now to ensure the feature is visible.
        if (existing.unlockedMapIds === undefined) updates.unlockedMapIds = ['map-serpent'];
        if (existing.upgrades === undefined) updates.upgrades = {};

        if (Object.keys(updates).length > 0) {
            await db.settings.update('settings', updates);
        }
    }
}
