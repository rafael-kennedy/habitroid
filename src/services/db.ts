import Dexie, { type EntityTable } from 'dexie';

// ---- Data Types ----

export interface Habit {
    id: string;
    name: string;
    icon: string;
    frequency: 'daily' | 'weekly' | 'custom' | 'anytime';
    customDays?: number[]; // Deprecated, use targetDays
    targetDays?: number[]; // 0=Sun..6=Sat for daily habits
    targetCount?: number; // Target completions per week for weekly habits
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
    weeklyCompletionStreak: number;
    lastDailyCompletionDate: string; // ISO date
    lastWeeklyCompletionWeek: string; // ISO week string (e.g. "2023-W42")
    lastSpinDate: string; // ISO date
    lastWeeklySpinDate: string; // ISO date
    walkthroughCompleted: boolean;
    // Unlockables
    maxDecks: number;
    unlockedMapIds: string[];
    upgrades: Record<string, number>; // upgradeId -> level
    personalBests: Record<string, number>; // mapId -> maxWaveReached
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

        // ---- Version 1 ----
        this.version(1).stores({
            habits: 'id, name, archived',
            foodEntries: 'id, date, mealType',
            cards: 'id, definitionId',
            decks: 'id, name',
            transactions: 'id, source, timestamp',
            gameResults: 'id, mapId, timestamp',
            settings: 'id',
        });

        // ---- Version 2: Add todos table ----
        this.version(2).stores({
            todos: 'id, completed',
        });

        // ---- Future Versions Example ----
        // this.version(3).stores({
        //     newTable: 'id, index',
        //     habits: 'id, name, archived, newIndex' // modifiying existing table
        // }).upgrade(async tx => {
        //     // Migration logic here
        //     await tx.table('habits').toCollection().modify(habit => {
        //         habit.newIndex = 0;
        //     });
        // });
    }
}

export const db = new HabitroidDB();

// Initialize default settings if not present
// This function runs on app startup to ensure data integrity
export async function initializeDB() {
    // Check if we need to seed initial data
    const existing = await db.settings.get('settings');
    const isNewUser = !existing;

    if (isNewUser) {
        // New User Setup
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
            weeklyCompletionStreak: 0,
            lastDailyCompletionDate: '',
            lastWeeklyCompletionWeek: '',
            lastSpinDate: '',
            lastWeeklySpinDate: '',
            walkthroughCompleted: false,
            maxDecks: 3,
            unlockedMapIds: ['map-serpent'], // Start with only Serpent Pass
            upgrades: {},
            personalBests: {},
        });
    } else {
        // Existing User: Runtime checks for missing fields that might not be covered by schema migrations
        // (e.g. fields added to existing object stores without a version bump, though version bumps are preferred)

        const updates: Partial<AppSettings> = {};

        // Helper to check and set default
        const ensureField = <K extends keyof AppSettings>(key: K, defaultValue: AppSettings[K]) => {
            if (existing[key] === undefined) {
                updates[key] = defaultValue;
            }
        };

        ensureField('walkthroughCompleted', false);
        ensureField('streakArmor', 0);
        ensureField('dailyCompletionStreak', 0);
        ensureField('weeklyCompletionStreak', 0);
        ensureField('lastDailyCompletionDate', '');
        ensureField('lastWeeklyCompletionWeek', '');
        ensureField('lastSpinDate', '');
        ensureField('lastWeeklySpinDate', '');
        ensureField('maxDecks', 3);

        // Map logic: Ensure at least one map is unlocked.
        // If they have no unlockedMapIds array at all, give them the default.
        if (existing.unlockedMapIds === undefined) {
            updates.unlockedMapIds = ['map-serpent'];
        }

        ensureField('upgrades', {});
        ensureField('personalBests', {});

        if (Object.keys(updates).length > 0) {
            await db.settings.update('settings', updates);
        }
    }
}
