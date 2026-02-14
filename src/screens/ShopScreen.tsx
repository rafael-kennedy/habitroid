import { useEffect, useState } from 'react';
import { useCardStore } from '../store/cardStore';
import { useEconomyStore } from '../store/economyStore';
import { BOOSTER_PACKS } from '../data/boosterPacks';
import { CARD_DEFINITIONS, type CardDefinition } from '../data/cardDefinitions';
import { UPGRADE_DEFINITIONS, getUpgradeCost } from '../data/upgrades';
import CoinDisplay from '../components/CoinDisplay';
import RetroIcon from '../components/RetroIcon';
import CardDetailModal from '../components/CardDetailModal';
import './ShopScreen.css';

export default function ShopScreen() {
    const { collection, loadCards, openBoosterPack } = useCardStore();
    const { coinBalance, spendCoins } = useEconomyStore();
    const [loading, setLoading] = useState(true);
    const [opening, setOpening] = useState(false);
    const [revealedCards, setRevealedCards] = useState<CardDefinition[]>([]);
    const [showCollection, setShowCollection] = useState(false);
    const [filterRarity, setFilterRarity] = useState<string>('all');
    const [inspectedCard, setInspectedCard] = useState<CardDefinition | null>(null);

    useEffect(() => {
        loadCards().then(() => setLoading(false));
    }, [loadCards]);

    const handleBuyPack = async (packId: string, cost: number) => {
        if (coinBalance < cost) return;
        setOpening(true);
        const success = await spendCoins(cost, 'shop', 'Booster pack');
        if (success) {
            const cards = await openBoosterPack(packId);
            setRevealedCards(cards);
        }
        setOpening(false);
    };

    const closeReveal = () => setRevealedCards([]);

    // Build collection view data
    const collectionByDef = new Map<string, number>();
    collection.forEach(c => {
        collectionByDef.set(c.definitionId, (collectionByDef.get(c.definitionId) || 0) + 1);
    });

    const filteredDefs = CARD_DEFINITIONS.filter(
        d => filterRarity === 'all' || d.rarity === filterRarity
    );

    if (loading) {
        return <div className="screen"><p className="text-muted">Loading...</p></div>;
    }

    return (
        <div className="screen" id="shop-screen">
            <div className="shop-header">
                <h1 className="screen-title">Shop</h1>
                <CoinDisplay size="lg" />
            </div>

            {/* Toggle */}
            <div className="shop-tabs">
                <button
                    className={`retro-btn ${!showCollection && filterRarity !== 'upgrades' ? 'retro-btn--primary' : ''}`}
                    onClick={() => { setShowCollection(false); setFilterRarity('all'); }}
                >
                    Packs
                </button>
                <button
                    className={`retro-btn ${showCollection ? 'retro-btn--primary' : ''}`}
                    onClick={() => { setShowCollection(true); setFilterRarity('all'); }}
                >
                    Collection ({collection.length})
                </button>
                <button
                    className={`retro-btn ${filterRarity === 'upgrades' ? 'retro-btn--primary' : ''}`}
                    onClick={() => { setShowCollection(false); setFilterRarity('upgrades'); }}
                >
                    Cybernetics
                </button>
            </div>

            {filterRarity === 'upgrades' ? (
                /* Upgrades */
                <div className="pack-grid">
                    {UPGRADE_DEFINITIONS.map(u => {
                        const currentLevel = useEconomyStore.getState().settings?.upgrades?.[u.id] || 0;
                        const isMaxed = currentLevel >= u.maxLevel;
                        const cost = getUpgradeCost(u, currentLevel);
                        const { purchaseUpgrade } = useEconomyStore.getState();

                        return (
                            <div key={u.id} className="pack-card retro-panel retro-panel--elevated">
                                <div className="pack-visual">
                                    <div className={`pack-icon`}>
                                        <RetroIcon name={u.icon as any} size={48} color="var(--retro-cyan)" />
                                    </div>
                                </div>
                                <h3 className="pack-name font-retro">{u.name}</h3>
                                <p className="pack-desc" style={{ fontSize: 11, minHeight: 40 }}>{u.description}</p>

                                <div style={{ margin: '8px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                                    Level: <span style={{ color: 'var(--retro-yellow)' }}>{currentLevel} / {u.maxLevel}</span>
                                </div>

                                <div className="pack-meta">
                                    <span>Current: {u.effectDescription(currentLevel)}</span>
                                    {!isMaxed && <span style={{ color: 'var(--retro-green)' }}>Next: {u.effectDescription(currentLevel + 1)}</span>}
                                </div>

                                <button
                                    className="retro-btn retro-btn--gold pack-buy-btn"
                                    onClick={async () => {
                                        if (coinBalance >= cost) {
                                            await purchaseUpgrade(u.id, cost);
                                            // Force update? Store subscription handles it
                                        }
                                    }}
                                    disabled={isMaxed || coinBalance < cost}
                                >
                                    {isMaxed ? 'MAXED' : (
                                        <>
                                            <RetroIcon name="coin" size={14} style={{ marginRight: 4 }} /> {cost}
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : !showCollection ? (
                /* Booster Packs */
                <div className="pack-grid">
                    {BOOSTER_PACKS.map(pack => (
                        <div key={pack.id} className="pack-card retro-panel retro-panel--elevated">
                            <div className="pack-visual">
                                <div className={`pack-icon pack-icon--${pack.id}`}>
                                    <RetroIcon name="crate" size={48} />
                                </div>
                            </div>
                            <h3 className="pack-name font-retro">{pack.name}</h3>
                            <p className="pack-desc">{pack.description}</p>
                            <div className="pack-meta">
                                <span>{pack.cardCount} cards</span>
                            </div>
                            <button
                                className="retro-btn retro-btn--gold pack-buy-btn"
                                onClick={() => handleBuyPack(pack.id, pack.cost)}
                                disabled={coinBalance < pack.cost || opening}
                                id={`buy-${pack.id}`}
                            >
                                <RetroIcon name="coin" size={14} style={{ marginRight: 4 }} /> {pack.cost}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                /* Collection */
                <>
                    <div className="collection-filters">
                        {['all', 'common', 'uncommon', 'rare', 'legendary'].map(r => (
                            <button
                                key={r}
                                className={`retro-btn ${filterRarity === r ? 'retro-btn--primary' : ''}`}
                                onClick={() => setFilterRarity(r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <div className="collection-grid">
                        {filteredDefs.map(def => {
                            const count = collectionByDef.get(def.id) || 0;
                            return (
                                <div
                                    key={def.id}
                                    className={`card-mini retro-panel ${count === 0 ? 'card-mini--locked' : ''}`}
                                    onClick={() => setInspectedCard(def)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={`card-mini__rarity rarity-badge rarity-badge--${def.rarity}`}>
                                        {def.rarity[0].toUpperCase()}
                                    </div>
                                    <div className="card-mini__name">{def.name}</div>
                                    <div className="card-mini__cost">
                                        <RetroIcon name="bolt" size={10} color="var(--retro-yellow)" />{def.energyCost}
                                    </div>
                                    {count > 0 && <div className="card-mini__count">×{count}</div>}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Reveal Modal */}
            {revealedCards.length > 0 && (
                <div className="modal-overlay" onClick={closeReveal}>
                    <div className="reveal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="font-retro" style={{ fontSize: 12, color: 'var(--retro-cyan)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                            Cards Acquired!
                        </h2>
                        <div className="reveal-cards">
                            {revealedCards.map((card, i) => (
                                <div
                                    key={i}
                                    className={`reveal-card reveal-card--${card.rarity}`}
                                    style={{ animationDelay: `${i * 150}ms`, cursor: 'pointer' }}
                                    onClick={() => setInspectedCard(card)}
                                >
                                    <div className={`rarity-badge rarity-badge--${card.rarity}`}>
                                        {card.rarity}
                                    </div>
                                    <div className="reveal-card__name font-retro">{card.name}</div>
                                    <div className="reveal-card__cost">
                                        <RetroIcon name="bolt" size={12} color="var(--retro-yellow)" />{card.energyCost}
                                    </div>
                                    <div className="reveal-card__flavor">{card.flavorText}</div>
                                </div>
                            ))}
                        </div>
                        <button className="retro-btn retro-btn--primary" onClick={closeReveal} style={{ width: '100%', marginTop: 'var(--space-lg)' }}>
                            Awesome!
                        </button>
                    </div>
                </div>
            )}
            <CardDetailModal card={inspectedCard} onClose={() => setInspectedCard(null)} />
        </div>
    );
}
