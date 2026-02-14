import { useCardStore } from '../store/cardStore';
import { useEconomyStore } from '../store/economyStore';
import { CARD_DEFINITIONS, type CardDefinition } from '../data/cardDefinitions';
import RetroIcon from '../components/RetroIcon';
import CardDetailModal from '../components/CardDetailModal';
import CardTowerPreview from '../components/CardTowerPreview';
import './DeckScreen.css';

export default function DeckScreen() {
    const { collection, decks, loading, loadCards, createDeck, deleteDeck, addCardToDeck, removeCardFromDeck } = useCardStore();
    const { settings, coinBalance, purchaseDeckSlot, loadEconomy } = useEconomyStore();
    const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
    const [showNewDeck, setShowNewDeck] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [showCardPicker, setShowCardPicker] = useState(false);
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
        return CARD_DEFINITIONS.find(d => d.id === instance.definitionId);
    };

    // Cards available to add (owned but not in this deck)
    const availableCards = collection.filter(
        c => !selectedDeck?.cardIds?.includes(c.id)
    );

    if (loading) {
        return <div className="screen"><p className="text-muted">Loading...</p></div>;
    }

    return (
        <div className="screen" id="deck-screen">
            <h1 className="screen-title">Deck Builder</h1>

            {!selectedDeck ? (
                /* Deck List */
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
            ) : (
                /* Deck Editor */
                <div className="deck-editor">
                    <div className="deck-editor__header">
                        <button className="retro-btn" onClick={() => setSelectedDeckId(null)}>
                            <RetroIcon name="chevron-left" size={16} style={{ marginRight: 4 }} /> Back
                        </button>
                        <h2 className="font-retro" style={{ fontSize: 11, color: 'var(--retro-cyan)' }}>
                            {selectedDeck.name}
                        </h2>
                        <span className="text-muted" style={{ fontSize: 11 }}>
                            {selectedDeck.cardIds.length} cards
                        </span>
                    </div>

                    {/* Cards in deck */}
                    <div className="deck-cards">
                        {selectedDeck.cardIds.length === 0 ? (
                            <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                                Deck is empty. Add cards from your collection!
                            </p>
                        ) : (
                            selectedDeck.cardIds.map(instanceId => {
                                const def = getCardDef(instanceId);
                                if (!def) return null;
                                return (
                                    <div key={instanceId} className={`deck-card-item retro-panel`} onClick={() => setInspectedCard(def)} style={{ cursor: 'pointer', paddingLeft: 0 }}>
                                        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', marginRight: 10, borderRight: '1px solid var(--retro-border)' }}>
                                            <CardTowerPreview card={def} size={32} />
                                        </div>
                                        <div className="deck-card-item__info">
                                            <span className="deck-card-item__name" style={{ color: `var(--rarity-${def.rarity})` }}>{def.name}</span>
                                            <span className="deck-card-item__stats">
                                                <RetroIcon name="bolt" size={10} color="var(--retro-yellow)" />{def.energyCost} · {def.primeEffect.damageType} · {def.primeEffect.baseDamage}dmg
                                            </span>
                                        </div>
                                        <button
                                            className="habit-delete"
                                            onClick={(e) => { e.stopPropagation(); removeCardFromDeck(selectedDeck.id, instanceId); }}
                                        >
                                            <RetroIcon name="cross" size={14} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Add cards button */}
                    <button
                        className="retro-btn retro-btn--primary"
                        onClick={() => setShowCardPicker(true)}
                        style={{ width: '100%', marginTop: 'var(--space-md)' }}
                    >
                        <RetroIcon name="plus" size={14} style={{ marginRight: 6 }} /> Add Cards
                    </button>

                    {/* Card Picker Modal */}
                    {showCardPicker && (
                        <div className="modal-overlay" onClick={() => setShowCardPicker(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
                                <h2 className="font-retro" style={{ fontSize: 11, color: 'var(--retro-cyan)', marginBottom: 'var(--space-md)' }}>
                                    Add Cards
                                </h2>
                                {availableCards.length === 0 ? (
                                    <p className="text-muted">No available cards. Buy packs in the Shop!</p>
                                ) : (
                                    <div className="picker-list">
                                        {availableCards.map(instance => {
                                            const def = CARD_DEFINITIONS.find(d => d.id === instance.definitionId);
                                            if (!def) return null;
                                            return (
                                                <div
                                                    key={instance.id}
                                                    className="picker-card retro-panel"
                                                    onClick={() => {
                                                        addCardToDeck(selectedDeck.id, instance.id);
                                                    }}
                                                    style={{ paddingLeft: 0, display: 'flex', alignItems: 'center' }}
                                                >
                                                    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', marginRight: 8, borderRight: '1px solid var(--retro-border)' }}>
                                                        <CardTowerPreview card={def} size={24} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div className={`rarity-badge rarity-badge--${def.rarity}`}>{def.rarity[0].toUpperCase()}</div>
                                                        <span className="picker-card__name">{def.name}</span>
                                                        <span className="picker-card__cost">
                                                            <RetroIcon name="bolt" size={10} color="var(--retro-yellow)" />{def.energyCost}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="retro-btn retro-btn--sm"
                                                        onClick={(e) => { e.stopPropagation(); setInspectedCard(def); }}
                                                        style={{ padding: '2px 6px', fontSize: 8, marginLeft: 4 }}
                                                    >
                                                        ℹ
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <button className="retro-btn" onClick={() => setShowCardPicker(false)} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <CardDetailModal card={inspectedCard} onClose={() => setInspectedCard(null)} />
        </div>
    );
}
