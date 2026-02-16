import { useEffect, useState } from 'react';
import { useCardStore } from '../store/cardStore';
import { useEconomyStore } from '../store/economyStore';
import { BOOSTER_PACKS } from '../data/boosterPacks';
import { CARD_DEFINITIONS, type CardDefinition } from '../data/cardDefinitions';
import { UPGRADE_DEFINITIONS, getUpgradeCost } from '../data/upgrades';
import CoinDisplay from '../components/CoinDisplay';
import RetroIcon from '../components/RetroIcon';
import CardDetailModal from '../components/CardDetailModal';
import CardTowerPreview from '../components/CardTowerPreview';
import { motion, AnimatePresence } from 'framer-motion';
import './ShopScreen.css';

export default function ShopScreen() {
    const { collection, loadCards, openBoosterPack } = useCardStore();
    const { coinBalance, spendCoins, purchaseUpgrade } = useEconomyStore();
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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="screen" id="shop-screen">
            <div className="shop-header">
                <h1 className="screen-title">Shop</h1>
                <CoinDisplay size="lg" />
            </div>

            {/* Toggle */}
            <div className="shop-tabs">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`retro-btn ${!showCollection && filterRarity !== 'upgrades' ? 'retro-btn--primary' : ''}`}
                    onClick={() => { setShowCollection(false); setFilterRarity('all'); }}
                >
                    Packs
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`retro-btn ${showCollection ? 'retro-btn--primary' : ''}`}
                    onClick={() => { setShowCollection(true); setFilterRarity('all'); }}
                >
                    Collection ({collection.length})
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`retro-btn ${filterRarity === 'upgrades' ? 'retro-btn--primary' : ''}`}
                    onClick={() => { setShowCollection(false); setFilterRarity('upgrades'); }}
                >
                    Cybernetics
                </motion.button>
            </div>

            <AnimatePresence mode='wait'>
                {filterRarity === 'upgrades' ? (
                    /* Upgrades */
                    <motion.div
                        className="pack-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        key="upgrades"
                    >
                        {UPGRADE_DEFINITIONS.map(u => {
                            const currentLevel = useEconomyStore.getState().settings?.upgrades?.[u.id] || 0;
                            const isMaxed = currentLevel >= u.maxLevel;
                            const cost = getUpgradeCost(u, currentLevel);

                            return (
                                <motion.div key={u.id} className="pack-card retro-panel retro-panel--elevated" variants={itemVariants}>
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

                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        className="retro-btn retro-btn--gold pack-buy-btn"
                                        onClick={async () => {
                                            if (coinBalance >= cost) {
                                                await purchaseUpgrade(u.id, cost);
                                            }
                                        }}
                                        disabled={isMaxed || coinBalance < cost}
                                    >
                                        {isMaxed ? 'MAXED' : (
                                            <>
                                                <RetroIcon name="coin" size={14} style={{ marginRight: 4 }} /> {cost}
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : !showCollection ? (
                    /* Booster Packs */
                    <motion.div
                        className="pack-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        key="packs"
                    >
                        {BOOSTER_PACKS.map(pack => (
                            <motion.div key={pack.id} className="pack-card retro-panel retro-panel--elevated" variants={itemVariants}>
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
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="retro-btn retro-btn--gold pack-buy-btn"
                                    onClick={() => handleBuyPack(pack.id, pack.cost)}
                                    disabled={coinBalance < pack.cost || opening}
                                    id={`buy-${pack.id}`}
                                >
                                    <RetroIcon name="coin" size={14} style={{ marginRight: 4 }} /> {pack.cost}
                                </motion.button>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* Collection */
                    <motion.div key="collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                        <motion.div
                            className="collection-grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {filteredDefs.map(def => {
                                const count = collectionByDef.get(def.id) || 0;
                                return (
                                    <motion.div
                                        variants={itemVariants}
                                        key={def.id}
                                        className={`card-mini retro-panel ${count === 0 ? 'card-mini--locked' : ''}`}
                                        onClick={() => setInspectedCard(def)}
                                        layoutId={`card-${def.id}`}
                                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--space-sm)' }}
                                        whileHover={{ scale: 1.05, zIndex: 10 }}
                                    >
                                        <div className={`card-mini__rarity rarity-badge rarity-badge--${def.rarity}`} style={{ alignSelf: 'flex-start' }}>
                                            {def.rarity[0].toUpperCase()}
                                        </div>

                                        <div style={{ margin: '8px 0', transform: 'scale(1.2)' }}>
                                            <CardTowerPreview card={def} size={40} />
                                        </div>

                                        <div className="card-mini__name" style={{ fontSize: 10, marginTop: 4 }}>{def.name}</div>
                                        <div className="card-mini__cost">
                                            <RetroIcon name="bolt" size={10} color="var(--retro-yellow)" />{def.energyCost}
                                        </div>
                                        {count > 0 && <div className="card-mini__count">×{count}</div>}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reveal Modal */}
            <AnimatePresence>
                {revealedCards.length > 0 && (
                    <div className="modal-overlay" onClick={closeReveal}>
                        <motion.div
                            className="reveal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <h2 className="font-retro" style={{ fontSize: 12, color: 'var(--retro-cyan)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                                Cards Acquired!
                            </h2>
                            <div className="reveal-cards">
                                {revealedCards.map((card, i) => (
                                    <motion.div
                                        key={i}
                                        className={`reveal-card reveal-card--${card.rarity}`}
                                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: i * 0.2, type: 'spring' }}
                                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                        onClick={() => setInspectedCard(card)}
                                    >
                                        <div className={`rarity-badge rarity-badge--${card.rarity}`}>
                                            {card.rarity}
                                        </div>

                                        <div style={{ margin: '16px 0', transform: 'scale(1.5)' }}>
                                            <CardTowerPreview card={card} size={64} />
                                        </div>

                                        <div className="reveal-card__name font-retro">{card.name}</div>
                                        <div className="reveal-card__cost">
                                            <RetroIcon name="bolt" size={12} color="var(--retro-yellow)" />{card.energyCost}
                                        </div>
                                        <div className="reveal-card__flavor">{card.flavorText}</div>
                                    </motion.div>
                                ))}
                            </div>
                            <motion.button
                                className="retro-btn retro-btn--primary"
                                onClick={closeReveal}
                                style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Awesome!
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <CardDetailModal card={inspectedCard} onClose={() => setInspectedCard(null)} />
        </div>
    );
}
