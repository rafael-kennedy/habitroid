import { create } from 'zustand';
import { db, type CardInstance, type Deck } from '../services/db';
import { CARD_DEFINITIONS, type CardDefinition, type Rarity } from '../data/cardDefinitions';
import { BOOSTER_PACKS, type BoosterPack } from '../data/boosterPacks';

interface CardState {
    collection: CardInstance[];
    decks: Deck[];
    loading: boolean;
    loadCards: () => Promise<void>;
    openBoosterPack: (packId: string) => Promise<CardDefinition[]>; // returns the cards pulled
    getCardDefinition: (definitionId: string) => CardDefinition | undefined;
    createDeck: (name: string) => Promise<string>; // returns deck id
    updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
    deleteDeck: (id: string) => Promise<void>;
    addCardToDeck: (deckId: string, cardInstanceId: string) => Promise<void>;
    removeCardFromDeck: (deckId: string, cardInstanceId: string) => Promise<void>;
}

function rollRarity(pack: BoosterPack): Rarity {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(pack.rarityWeights) as [Rarity, number][]) {
        cumulative += chance;
        if (roll < cumulative) return rarity;
    }
    return 'common';
}

function getRandomCardOfRarity(rarity: Rarity): CardDefinition {
    const pool = CARD_DEFINITIONS.filter(c => c.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
}

export const useCardStore = create<CardState>((set, get) => ({
    collection: [],
    decks: [],
    loading: true,

    loadCards: async () => {
        const collection = await db.cards.toArray();
        const decks = await db.decks.toArray();
        set({ collection, decks, loading: false });
    },

    openBoosterPack: async (packId) => {
        const pack = BOOSTER_PACKS.find(p => p.id === packId);
        if (!pack) return [];

        const pulled: CardDefinition[] = [];
        const newInstances: CardInstance[] = [];

        for (let i = 0; i < pack.cardCount; i++) {
            const rarity = rollRarity(pack);
            const card = getRandomCardOfRarity(rarity);
            pulled.push(card);

            const instance: CardInstance = {
                id: crypto.randomUUID(),
                definitionId: card.id,
                acquiredAt: new Date().toISOString(),
            };
            newInstances.push(instance);
        }

        await db.cards.bulkPut(newInstances);
        set(state => ({
            collection: [...state.collection, ...newInstances],
        }));

        return pulled;
    },

    getCardDefinition: (definitionId) => {
        return CARD_DEFINITIONS.find(c => c.id === definitionId);
    },

    createDeck: async (name) => {
        const deck: Deck = {
            id: crypto.randomUUID(),
            name,
            cardIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await db.decks.put(deck);
        set(state => ({ decks: [...state.decks, deck] }));
        return deck.id;
    },

    updateDeck: async (id, updates) => {
        const fullUpdates = { ...updates, updatedAt: new Date().toISOString() };
        await db.decks.update(id, fullUpdates);
        set(state => ({
            decks: state.decks.map(d => d.id === id ? { ...d, ...fullUpdates } : d),
        }));
    },

    deleteDeck: async (id) => {
        await db.decks.delete(id);
        set(state => ({ decks: state.decks.filter(d => d.id !== id) }));
    },

    addCardToDeck: async (deckId, cardInstanceId) => {
        const deck = get().decks.find(d => d.id === deckId);
        if (!deck) return;
        const newCardIds = [...deck.cardIds, cardInstanceId];
        await db.decks.update(deckId, { cardIds: newCardIds, updatedAt: new Date().toISOString() });
        set(state => ({
            decks: state.decks.map(d =>
                d.id === deckId ? { ...d, cardIds: newCardIds, updatedAt: new Date().toISOString() } : d
            ),
        }));
    },

    removeCardFromDeck: async (deckId, cardInstanceId) => {
        const deck = get().decks.find(d => d.id === deckId);
        if (!deck) return;
        const newCardIds = deck.cardIds.filter(id => id !== cardInstanceId);
        await db.decks.update(deckId, { cardIds: newCardIds, updatedAt: new Date().toISOString() });
        set(state => ({
            decks: state.decks.map(d =>
                d.id === deckId ? { ...d, cardIds: newCardIds, updatedAt: new Date().toISOString() } : d
            ),
        }));
    },
}));
