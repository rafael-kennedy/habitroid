import { useState, useEffect, useMemo } from 'react';
import { useCardStore } from '../store/cardStore';
import { useEconomyStore } from '../store/economyStore';
import { CARD_DEFINITION_MAP, type CardDefinition } from '../data/cardDefinitions';
import RetroIcon from '../components/RetroIcon';
import CardDetailModal from '../components/CardDetailModal';
import Card from '../components/Card';
import './DeckScreen.css';

export default function DeckScreen() {
    const { collection, decks, loading, loadCards, createDeck, deleteDeck, addCardToDeck, removeCardFromDeck } = useCardStore();
    const { settings, coinBalance, purchaseDeckSlot, loadEconomy } = useEconomyStore();
    const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
    const [showNewDeck, setShowNewDeck] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');

    // Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRarity, setFilterRarity] = useState<string>('all');
    const [filterCost, setFilterCost] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('rarity'); // name, cost, rarity

    const [inspectedCard, setInspectedCard] = useState<CardDefinition | null>(null);

    useEffect(() => {
        loadCards();
        loadEconomy();
    }, [loadCards, loadEconomy]);

    const selectedDeck = decks.find(d => d.id === selectedDeckId);
    const maxDecks = settings?.maxDecks || 3;
    const canCreate = decks.length < maxDecks;

    // Cost for next slot: 500 * (2 ^ (maxDecks - 3))
    const nextSlotCost = 500 * Math.pow(2, maxDecks - 3);

    const handleCreateDeck = async () => {
        if (!newDeckName.trim()) return;
        const id = await createDeck(newDeckName.trim());
        setSelectedDeckId(id);
        setNewDeckName('');
        setShowNewDeck(false);
    };

    const handleBuySlot = async () => {
        if (coinBalance < nextSlotCost) return;
        const success = await purchaseDeckSlot();
        if (success) {
            // Re-render handled by store update
        }
    };

    const getCardDef = (instanceId: string): CardDefinition | undefined => {
        const instance = collection.find(c => c.id === instanceId);
        if (!instance) return undefined;
        return CARD_DEFINITION_MAP[instance.definitionId];
    };

    // Filter Logic
    const filteredAvailableCards = useMemo(() => {
        let cards = collection.filter(c => !selectedDeck?.cardIds?.includes(c.id));

        // Search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            cards = cards.filter(c => {
                const def = CARD_DEFINITION_MAP[c.definitionId];
                return def?.name.toLowerCase().includes(lower);
            });
        }

        // Rarity
        if (filterRarity !== 'all') {
            cards = cards.filter(c => {
                const def = CARD_DEFINITION_MAP[c.definitionId];
                return def?.rarity === filterRarity;
            });
        }

        // Cost
        if (filterCost !== 'all') {
            cards = cards.filter(c => {
                const def = CARD_DEFINITION_MAP[c.definitionId];
                if (!def) return false;
                if (filterCost === '0-2') return def.energyCost <= 2;
                if (filterCost === '3-5') return def.energyCost >= 3 && def.energyCost <= 5;
                if (filterCost === '6+') return def.energyCost >= 6;
                return true;
            });
        }

        // Sort
        return cards.sort((a, b) => {
            const defA = CARD_DEFINITION_MAP[a.definitionId];
            const defB = CARD_DEFINITION_MAP[b.definitionId];
            if (!defA || !defB) return 0;

            if (sortBy === 'name') return defA.name.localeCompare(defB.name);
            if (sortBy === 'cost') return defA.energyCost - defB.energyCost;
            if (sortBy === 'rarity') {
                const rarityOrder = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
                // High rarity first
                return (rarityOrder[defB.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[defA.rarity as keyof typeof rarityOrder] || 0);
            }
            return 0;
        });
    }, [collection, selectedDeck, searchQuery, filterRarity, filterCost, sortBy]);

    if (loading) {
        return <div className="screen"><p className="text-muted">Loading...</p></div>;
    }

    return (
        <div className="screen" id="deck-screen">
            {!selectedDeck ? (
                /* Deck List */
                <>
                    <h1 className="screen-title">Deck Builder</h1>
                    <div className="deck-list">
                        {decks.length === 0 && !showNewDeck && (
                            <div className="empty-state">
                                <div className="empty-state__icon">
                                    <RetroIcon name="cards" size={48} color="var(--text-muted)" />
                                </div>
                                <p className="empty-state__text">No decks yet. Create one to start building!</p>
                            </div>
                        )}

                        {decks.map(deck => (
                            <div
                                key={deck.id}
                                className="deck-card retro-panel retro-panel--elevated"
                                onClick={() => setSelectedDeckId(deck.id)}
                            >
                                <div className="deck-card__info">
                                    <h3 className="deck-card__name font-retro">{deck.name}</h3>
                                    <p className="deck-card__count">{deck.cardIds.length} cards</p>
                                </div>
                                <button
                                    className="habit-delete"
                                    onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }}
                                >
                                    <RetroIcon name="cross" size={16} />
                                </button>
                            </div>
                        ))}

                        <div className="deck-limit-info" style={{ textAlign: 'center', margin: 'var(--space-md) 0', color: 'var(--text-muted)', fontSize: 12 }}>
                            Slots Used: {decks.length} / {maxDecks}
                        </div>

                        {showNewDeck ? (
                            <div className="retro-panel" style={{ padding: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Deck Name</label>
                                    <input
                                        className="retro-input"
                                        value={newDeckName}
                                        onChange={e => setNewDeckName(e.target.value)}
                                        placeholder="e.g. Electric Storm"
                                        autoFocus
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button className="retro-btn" onClick={() => setShowNewDeck(false)}>Cancel</button>
                                    <button className="retro-btn retro-btn--primary" onClick={handleCreateDeck}>Create</button>
                                </div>
                            </div>
                        ) : (
                            canCreate ? (
                                <button
                                    className="retro-btn retro-btn--primary"
                                    onClick={() => setShowNewDeck(true)}
                                    style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                                >
                                    <RetroIcon name="plus" size={14} style={{ marginRight: 6 }} /> New Deck
                                </button>
                            ) : (
                                <button
                                    className="retro-btn retro-btn--gold"
                                    onClick={handleBuySlot}
                                    disabled={coinBalance < nextSlotCost}
                                    style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                                >
                                    <RetroIcon name="coin" size={14} style={{ marginRight: 6 }} /> Buy Slot ({nextSlotCost})
                                </button>
                            )
                        )}
                    </div>
                </>
            ) : (
                /* Advanced Deck Editor */
                <div className="deck-editor">
                    <div className="deck-editor__header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button className="retro-btn" onClick={() => setSelectedDeckId(null)}>
                                <RetroIcon name="chevron-left" size={16} /> Back
                            </button>
                            <div>
                                <h2 className="font-retro" style={{ fontSize: 16, color: 'var(--retro-cyan)', margin: 0 }}>
                                    {selectedDeck.name}
                                </h2>
                                <span className="text-muted" style={{ fontSize: 12 }}>
                                    {selectedDeck.cardIds.length} cards
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="deck-editor__content">
                        {/* Left Column: Deck Cards */}
                        <div className="deck-column">
                            <h3 style={{ fontSize: 12, marginBottom: 8, color: 'var(--text-secondary)' }}>Current Deck</h3>
                            <div className="deck-cards-list">
                                {selectedDeck.cardIds.length === 0 ? (
                                    <p className="text-muted" style={{ fontSize: 12, fontStyle: 'italic', padding: 8 }}>Empty Deck</p>
                                ) : (
                                    selectedDeck.cardIds.map(instanceId => {
                                        const def = getCardDef(instanceId);
                                        if (!def) return null;
                                        return (
                                            <div key={instanceId} className="deck-card-row" onClick={() => setInspectedCard(def)}>
                                                <div className={`rarity-stripe rarity-bg--${def.rarity}`} style={{ width: 4, height: 24, borderRadius: 2, marginRight: 8 }} />
                                                <span className="deck-card-row__name" style={{ color: `var(--rarity-${def.rarity})` }}>{def.name}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', marginRight: 8 }}>
                                                    <RetroIcon name="bolt" size={10} color="var(--retro-yellow)" />
                                                    <span style={{ fontSize: 10, color: 'var(--retro-yellow)' }}>{def.energyCost}</span>
                                                </div>
                                                <button
                                                    className="deck-remove-btn"
                                                    title="Remove from deck"
                                                    onClick={(e) => { e.stopPropagation(); removeCardFromDeck(selectedDeck.id, instanceId); }}
                                                >
                                                    <RetroIcon name="cross" size={12} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Column: Collection Picker */}
                        <div className="collection-column">
                            {/* Toolbar */}
                            <div className="collection-toolbar">
                                <input
                                    className="search-input"
                                    placeholder="Search cards..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <option value="rarity">Sort: Rarity</option>
                                    <option value="cost">Sort: Cost</option>
                                    <option value="name">Sort: Name</option>
                                </select>
                                <select className="filter-select" value={filterRarity} onChange={e => setFilterRarity(e.target.value)}>
                                    <option value="all">Rarity: All</option>
                                    <option value="common">Common</option>
                                    <option value="uncommon">Uncommon</option>
                                    <option value="rare">Rare</option>
                                    <option value="legendary">Legendary</option>
                                </select>
                                <select className="filter-select" value={filterCost} onChange={e => setFilterCost(e.target.value)}>
                                    <option value="all">Cost: All</option>
                                    <option value="0-2">0-2</option>
                                    <option value="3-5">3-5</option>
                                    <option value="6+">6+</option>
                                </select>
                            </div>

                            {/* Card Grid */}
                            <div className="card-grid">
                                {filteredAvailableCards.map(instance => {
                                    const def = CARD_DEFINITION_MAP[instance.definitionId];
                                    if (!def) return null;
                                    return (
                                        <div key={instance.id} style={{ display: 'flex', justifyContent: 'center' }}>
                                            <Card
                                                card={def}
                                                onClick={() => addCardToDeck(selectedDeck.id, instance.id)}
                                                showAction={true} // Implicitly just click to add, but maybe visual cue
                                                onInfo={() => setInspectedCard(def)}
                                            />
                                        </div>
                                    );
                                })}
                                {filteredAvailableCards.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                                        No cards found matching filters.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CardDetailModal card={inspectedCard} onClose={() => setInspectedCard(null)} />
        </div>
    );
}
