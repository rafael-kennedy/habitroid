import { create } from 'zustand';
import { db, type CoinTransaction, type AppSettings } from '../services/db';
import { CARD_DEFINITIONS, type Rarity } from '../data/cardDefinitions';

interface EconomyState {
    coinBalance: number;
    transactions: CoinTransaction[];
    settings: AppSettings | null;
    loading: boolean;
    loadEconomy: () => Promise<void>;
    earnCoins: (amount: number, source: CoinTransaction['source'], description: string) => Promise<void>;
    spendCoins: (amount: number, source: CoinTransaction['source'], description: string) => Promise<boolean>; // false if insufficient
    getRecentTransactions: (limit?: number) => CoinTransaction[];
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
    spinDailyGrid: (streakLevel: number) => Promise<{ type: 'coin' | 'card', value: string | number, rarity?: string }>;
    spinWeeklyGrid: (streakLevel: number) => Promise<{ type: 'coin' | 'card', value: string | number, rarity?: string }>;

    // Unlockables
    purchaseDeckSlot: () => Promise<boolean>;
    unlockMap: (mapId: string, cost: number) => Promise<boolean>;
    purchaseUpgrade: (upgradeId: string, cost: number) => Promise<boolean>;
    updatePersonalBest: (mapId: string, wave: number) => Promise<void>;
}

export const useEconomyStore = create<EconomyState>((set, get) => ({
    coinBalance: 0,
    transactions: [],
    settings: null,
    loading: true,

    loadEconomy: async () => {
        const settings = await db.settings.get('settings');
        const transactions = await db.transactions.orderBy('timestamp').reverse().limit(50).toArray();
        set({
            coinBalance: settings?.coinBalance ?? 0,
            transactions,
            settings: settings ?? null,
            loading: false,
        });
    },

    earnCoins: async (amount, source, description) => {
        const tx: CoinTransaction = {
            id: crypto.randomUUID(),
            amount,
            source,
            description,
            timestamp: new Date().toISOString(),
        };
        await db.transactions.put(tx);

        const newBalance = get().coinBalance + amount;
        await db.settings.update('settings', { coinBalance: newBalance });

        set(state => ({
            coinBalance: newBalance,
            transactions: [tx, ...state.transactions].slice(0, 50),
        }));
    },

    spendCoins: async (amount, source, description) => {
        const current = get().coinBalance;
        if (current < amount) return false;

        const tx: CoinTransaction = {
            id: crypto.randomUUID(),
            amount: -amount,
            source,
            description,
            timestamp: new Date().toISOString(),
        };
        await db.transactions.put(tx);

        const newBalance = current - amount;
        await db.settings.update('settings', { coinBalance: newBalance });

        set(state => ({
            coinBalance: newBalance,
            transactions: [tx, ...state.transactions].slice(0, 50),
        }));
        return true;
    },

    getRecentTransactions: (limit = 10) => {
        return get().transactions.slice(0, limit);
    },

    updateSettings: async (updates) => {
        await db.settings.update('settings', updates);
        const settings = await db.settings.get('settings');
        set({ settings: settings ?? null });
    },

    purchaseDeckSlot: async () => {
        const settings = get().settings;
        if (!settings) return false;

        // Calculate cost: 500 * (2 ^ (maxDecks - 3))
        // 4th slot: 500
        // 5th slot: 1000
        // 6th slot: 2000
        const currentSlots = settings.maxDecks || 3;
        const cost = 500 * Math.pow(2, currentSlots - 3);

        const success = await get().spendCoins(cost, 'shop', `Deck Slot Upgrade (${currentSlots + 1})`);
        if (success) {
            await get().updateSettings({ maxDecks: currentSlots + 1 });
            return true;
        }
        return false;
    },

    unlockMap: async (mapId, cost) => {
        const settings = get().settings;
        if (!settings) return false;

        if (settings.unlockedMapIds?.includes(mapId)) return true; // Already unlocked

        const success = await get().spendCoins(cost, 'shop', `Unlock Map: ${mapId}`);
        if (success) {
            const newUnlocked = [...(settings.unlockedMapIds || []), mapId];
            await get().updateSettings({ unlockedMapIds: newUnlocked });
            return true;
        }
        return false;
    },

    purchaseUpgrade: async (upgradeId, cost) => {
        const settings = get().settings;
        if (!settings) return false;

        const currentLevel = settings.upgrades?.[upgradeId] || 0;

        const success = await get().spendCoins(cost, 'shop', `Upgrade: ${upgradeId} (Level ${currentLevel + 1})`);
        if (success) {
            const newUpgrades = { ...(settings.upgrades || {}), [upgradeId]: currentLevel + 1 };
            await get().updateSettings({ upgrades: newUpgrades });
            return true;
        }
        return false;
    },

    updatePersonalBest: async (mapId, wave) => {
        const settings = get().settings;
        if (!settings) return;

        const currentBest = settings.personalBests?.[mapId] || 0;
        if (wave > currentBest) {
            const newBests = { ...(settings.personalBests || {}), [mapId]: wave };
            await get().updateSettings({ personalBests: newBests });
        }
    },

    spinDailyGrid: async (level) => {
        // RNG Logic based on level (streak)
        // Level 1-2: Low rewards
        // Level 3-6: Medium rewards
        // Level 7+: High rewards (Legendary chance)

        const roll = Math.random();
        let rewardType: 'coin' | 'card' = 'coin';

        // 40% chance of card, 60% chance of coins (tweakable)
        if (roll < 0.4) rewardType = 'card';

        if (rewardType === 'coin') {
            let amount = 25;

            if (level < 3) {
                // Low level: mostly 25, some 50
                amount = Math.random() < 0.8 ? 25 : 50;
            } else if (level < 7) {
                // Mid level: 50, 100, rare 200
                const r = Math.random();
                if (r < 0.6) amount = 50;
                else if (r < 0.9) amount = 100;
                else amount = 200;
            } else {
                // High level: 100, 200, rare 500
                const r = Math.random();
                if (r < 0.5) amount = 100;
                else if (r < 0.9) amount = 200;
                else amount = 500;
            }

            await get().earnCoins(amount, 'shop', `Daily Spin (Streak ${level})`);

            // Mark spin as used
            await get().updateSettings({ lastSpinDate: new Date().toISOString().split('T')[0] });

            return { type: 'coin', value: amount };
        } else {
            // Card Logic
            let rarityWeights: Record<Rarity, number>;
            if (level < 3) rarityWeights = { common: 80, uncommon: 19, rare: 1, legendary: 0 };
            else if (level < 7) rarityWeights = { common: 50, uncommon: 35, rare: 14, legendary: 1 };
            else rarityWeights = { common: 20, uncommon: 30, rare: 40, legendary: 10 };

            const rRoll = Math.random() * 100;
            let selectedRarity: Rarity = 'common';
            let cumulative = 0;

            if (rRoll < (cumulative += rarityWeights.common)) selectedRarity = 'common';
            else if (rRoll < (cumulative += rarityWeights.uncommon)) selectedRarity = 'uncommon';
            else if (rRoll < (cumulative += rarityWeights.rare)) selectedRarity = 'rare';
            else selectedRarity = 'legendary';

            const pool = CARD_DEFINITIONS.filter(c => c.rarity === selectedRarity);
            const cardDef = pool[Math.floor(Math.random() * pool.length)];

            // Add to DB
            await db.cards.add({
                id: crypto.randomUUID(),
                definitionId: cardDef.id,
                acquiredAt: new Date().toISOString(),
            });

            // Mark spin as used
            await get().updateSettings({ lastSpinDate: new Date().toISOString().split('T')[0] });

            return { type: 'card', value: cardDef.name, rarity: selectedRarity };
        }
    },

    spinWeeklyGrid: async (level) => {
        // Weekly Spin: Higher stakes!
        // Level: Weekly Streak Count

        // Always 50% chance of Card vs Coin, but much better rarity/amounts.
        const roll = Math.random();
        let rewardType: 'coin' | 'card' = 'coin';
        if (roll < 0.5) rewardType = 'card';

        if (rewardType === 'coin') {
            // Huge coin amounts
            let amount = 500 + Math.floor(Math.random() * 1000); // 500-1500 base
            // Multiplier based on streak
            amount = Math.floor(amount * (1 + level * 0.1)); // +10% per streak week

            await get().earnCoins(amount, 'shop', `Weekly Spin (Streak ${level})`);
            await get().updateSettings({ lastWeeklySpinDate: new Date().toISOString().split('T')[0] });
            return { type: 'coin', value: amount };
        } else {
            // Card Logic - Better rarities
            // No commons allowed!
            let rarityWeights: Record<Rarity, number>;
            rarityWeights = { common: 0, uncommon: 40, rare: 40, legendary: 20 };

            // Boost legendary chance if streak is high (>4 weeks)
            if (level > 4) rarityWeights = { common: 0, uncommon: 20, rare: 50, legendary: 30 };

            const rRoll = Math.random() * 100;
            let selectedRarity: Rarity = 'uncommon';
            let cumulative = 0;

            if (rRoll < (cumulative += rarityWeights.common)) selectedRarity = 'common'; // Should be 0
            else if (rRoll < (cumulative += rarityWeights.uncommon)) selectedRarity = 'uncommon';
            else if (rRoll < (cumulative += rarityWeights.rare)) selectedRarity = 'rare';
            else selectedRarity = 'legendary';

            const pool = CARD_DEFINITIONS.filter(c => c.rarity === selectedRarity);
            const cardDef = pool[Math.floor(Math.random() * pool.length)];

            await db.cards.add({
                id: crypto.randomUUID(),
                definitionId: cardDef.id,
                acquiredAt: new Date().toISOString(),
            });

            await get().updateSettings({ lastWeeklySpinDate: new Date().toISOString().split('T')[0] });
            return { type: 'card', value: cardDef.name, rarity: selectedRarity };
        }
    },
}));
