import { describe, it, expect, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { db, initializeDB } from './db';

describe('Database Migration', () => {
    afterEach(async () => {
        await db.delete();
    });

    it('should upgrade from version 1 to version 2 (add todos table)', async () => {
        // Setup Version 1 DB
        const dbName = 'HabitroidDB';
        const v1 = new Dexie(dbName);
        v1.version(1).stores({
            habits: 'id, name, archived',
            foodEntries: 'id, date, mealType',
            cards: 'id, definitionId',
            decks: 'id, name',
            transactions: 'id, source, timestamp',
            gameResults: 'id, mapId, timestamp',
            settings: 'id',
        });

        // Add some data to v1
        await v1.open();
        await v1.table('habits').add({ id: 'h1', name: 'Old Habit', archived: false });
        await v1.table('settings').add({ id: 'settings', coinBalance: 50 });
        v1.close();

        // Open app DB (which is currently version 2)
        // This triggers the upgrade
        await db.open();

        // Check if data is preserved
        const habits = await db.habits.toArray();
        expect(habits).toHaveLength(1);
        expect(habits[0].name).toBe('Old Habit');

        // Check if new table exists
        // Dexie tables are created lazily/dynamically based on schema, 
        // but let's verify we can write to it without error
        await db.todos.add({ id: 't1', text: 'New Todo', completed: false, coinReward: 10, createdAt: new Date().toISOString() });
        const todos = await db.todos.toArray();
        expect(todos).toHaveLength(1);
        expect(todos[0].text).toBe('New Todo');
    });

    it('should run initialization logic for legacy data migration (settings updates)', async () => {
        // Setup a "legacy" state where settings exist but are missing new fields
        // e.g. simulating a user from before 'streakArmor' existed
        const dbName = 'HabitroidDB';
        const legacyDb = new Dexie(dbName);
        legacyDb.version(1).stores({ settings: 'id' });
        await legacyDb.open();
        await legacyDb.table('settings').put({
            id: 'settings',
            coinBalance: 100,
            // OLD DATA: missing streakArmor, dailyCompletionStreak, etc.
        });
        legacyDb.close();

        // Now run the app's initialization logic
        await db.open();
        await initializeDB();

        const settings = await db.settings.get('settings');
        expect(settings).toBeDefined();

        // Check if defaults were applied
        expect(settings?.streakArmor).toBe(0); // Should be added by ensureField
        expect(settings?.dailyCompletionStreak).toBe(0);
        expect(settings?.walkthroughCompleted).toBe(false);
        expect(settings?.unlockedMapIds).toEqual(['map-serpent']); // Default map

        // Check if original data preserved
        expect(settings?.coinBalance).toBe(100);
    });

    it('should initialize fresh DB for new user', async () => {
        // Ensure clean state
        await db.delete();
        await db.open();
        await initializeDB();

        const settings = await db.settings.get('settings');
        expect(settings).toBeDefined();
        expect(settings?.coinBalance).toBe(100); // Default starter coins
        expect(settings?.maxDecks).toBe(3);
    });
});
