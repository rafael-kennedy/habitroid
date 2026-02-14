import { useEffect, useRef, useState, useCallback } from 'react';
import { useCardStore } from '../store/cardStore';
import { useEconomyStore } from '../store/economyStore';
import { CARD_DEFINITIONS, type CardDefinition } from '../data/cardDefinitions';
import { MAP_DEFINITIONS } from '../game/map';
import { createGameState, drawCards, startCombat, endWave, placeCard, updateGame } from '../game/engine';
import type { GameState } from '../game/types';
import RetroIcon from '../components/RetroIcon';
import CardDetailModal from '../components/CardDetailModal';
import CardTowerPreview from '../components/CardTowerPreview';
import SvgPlayfield from '../components/game/SvgPlayfield';
import GameHUD from '../components/game/GameHUD';
import './GameScreen.css';

export default function GameScreen() {
    const { decks, collection, loadCards } = useCardStore();
    const { earnCoins, settings } = useEconomyStore();
    const gameStateRef = useRef<GameState | null>(null);
    const animFrameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [gameActive, setGameActive] = useState(false);
    const [selectedMap, setSelectedMap] = useState<string>('');
    const [selectedDeck, setSelectedDeck] = useState<string>('');
    const [uiPhase, setUiPhase] = useState<string>('MENU');
    const [hand, setHand] = useState<string[]>([]);
    const [gameResult, setGameResult] = useState<{ won: boolean; score: number; waves: number } | null>(null);
    const [inspectedCard, setInspectedCard] = useState<CardDefinition | null>(null);
    // Snapshot of game state for SVG rendering — updated every frame
    const [gameSnapshot, setGameSnapshot] = useState<GameState | null>(null);

    useEffect(() => {
        loadCards();
    }, [loadCards]);

    // Game loop — only updates engine state + triggers React re-render
    const gameLoop = useCallback((timestamp: number) => {
        const state = gameStateRef.current;
        if (!state) return;

        if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
        const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = timestamp;

        // Update game engine
        if (state.phase === 'COMBAT_PHASE') {
            gameStateRef.current = updateGame(state, dt);
        }

        const current = gameStateRef.current!;

        // Check for wave end
        if (current.phase === 'COMBAT_PHASE' && current.waveComplete) {
            gameStateRef.current = endWave(current);
            setUiPhase(gameStateRef.current!.phase);
            if (gameStateRef.current!.phase === 'DRAW_PHASE') {
                gameStateRef.current = drawCards(gameStateRef.current!, 5);
                setHand([...gameStateRef.current!.hand]);
                setUiPhase('PLACEMENT_PHASE');
            }
        }

        // Check game over / victory
        if (current.phase === 'GAME_OVER' || current.phase === 'VICTORY') {
            setUiPhase(current.phase);
            setGameResult({
                won: current.phase === 'VICTORY',
                score: current.score,
                waves: current.currentWave,
            });

            // Calculate Coin Gain with Scavenger Protocol
            const scavengerLevel = settings?.upgrades?.['scavenger_protocol'] || 0;
            const bonusMultiplier = 1 + (scavengerLevel * 0.10); // +10% per level

            let baseCoins = 0;
            if (current.phase === 'VICTORY') {
                baseCoins = Math.floor(current.score / 10) + 50;
                earnCoins(Math.floor(baseCoins * bonusMultiplier), 'game', `Tower defense victory! Score: ${current.score} (Bonus: x${bonusMultiplier.toFixed(1)})`);
            } else {
                baseCoins = Math.floor(current.score / 20) + 10;
                earnCoins(Math.floor(baseCoins * bonusMultiplier), 'game', `Tower defense - Wave ${current.currentWave + 1} (Bonus: x${bonusMultiplier.toFixed(1)})`);
            }

            // Final snapshot, no more frames
            setGameSnapshot({ ...gameStateRef.current! });
            cancelAnimationFrame(animFrameRef.current);
            return;
        }

        // Push snapshot to React for SVG rendering
        setGameSnapshot({ ...gameStateRef.current! });

        animFrameRef.current = requestAnimationFrame(gameLoop);
    }, [earnCoins, settings]);

    const startGame = useCallback(() => {
        if (!selectedMap || !selectedDeck) return;

        const deck = decks.find(d => d.id === selectedDeck);
        if (!deck || deck.cardIds.length === 0) return;

        const cardDefIds = deck.cardIds
            .map(instanceId => {
                const instance = collection.find(c => c.id === instanceId);
                return instance?.definitionId;
            })
            .filter(Boolean) as string[];

        if (cardDefIds.length === 0) return;

        const state = createGameState(selectedMap, cardDefIds, settings?.upgrades || {});
        gameStateRef.current = state;

        gameStateRef.current = drawCards(gameStateRef.current!, 5);
        setHand([...gameStateRef.current!.hand]);
        setGameSnapshot({ ...gameStateRef.current! });
        setUiPhase('PLACEMENT_PHASE');
        setGameActive(true);
        setGameResult(null);
        setSelectedZoneId(null);
        lastTimeRef.current = 0;

        animFrameRef.current = requestAnimationFrame(gameLoop);
    }, [selectedMap, selectedDeck, decks, collection, gameLoop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // Zone click handler — from SVG component
    const handleZoneClick = useCallback((zoneId: string) => {
        if (!gameStateRef.current || gameStateRef.current.phase === 'COMBAT_PHASE') return;
        setSelectedZoneId(zoneId);
    }, []);

    const handleBackgroundClick = useCallback(() => {
        setSelectedZoneId(null);
    }, []);

    const handleStartWave = () => {
        const state = gameStateRef.current;
        if (!state) return;
        gameStateRef.current = startCombat(state);
        setGameSnapshot({ ...gameStateRef.current! });
        setUiPhase('COMBAT_PHASE');
        setHand([]);
        setSelectedZoneId(null);
    };

    const handleBackToMenu = () => {
        cancelAnimationFrame(animFrameRef.current);
        gameStateRef.current = null;
        setGameSnapshot(null);
        setGameActive(false);
        setGameResult(null);
        setUiPhase('MENU');
    };

    // ---- MENU ----
    if (!gameActive) {
        return (
            <div className="screen" id="game-screen">
                <h1 className="screen-title">Tower Defense</h1>

                {/* Map selection */}
                <div className="game-section">
                    <h2 className="game-section__title font-retro">Select Map</h2>
                    <div className="map-list">
                        {MAP_DEFINITIONS.map(map => {
                            const isUnlocked = !map.unlockCost || (useEconomyStore.getState().settings?.unlockedMapIds?.includes(map.id));
                            const isSelected = selectedMap === map.id;

                            return (
                                <div
                                    key={map.id}
                                    className={`map-card retro-panel ${isSelected ? 'map-card--selected' : ''} ${!isUnlocked ? 'map-card--locked' : ''}`}
                                    onClick={() => {
                                        if (isUnlocked) {
                                            setSelectedMap(map.id);
                                        } else {
                                            // Trigger unlock
                                            if (map.unlockCost) {
                                                const confirm = window.confirm(`Unlock ${map.name} for ${map.unlockCost} coins?`);
                                                if (confirm) {
                                                    const { coinBalance, unlockMap } = useEconomyStore.getState();
                                                    if (coinBalance >= map.unlockCost) {
                                                        unlockMap(map.id, map.unlockCost);
                                                    } else {
                                                        alert('Insufficient coins!');
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 className="map-card__name font-retro">{map.name}</h3>
                                        {!isUnlocked && <RetroIcon name="lock" size={14} color="var(--text-muted)" />}
                                    </div>
                                    <p className="map-card__info">
                                        {map.waves.length} waves · {map.paths.length} path{map.paths.length > 1 ? 's' : ''}
                                    </p>
                                    {!isUnlocked && (
                                        <div style={{ marginTop: 8, color: 'var(--retro-gold)', fontSize: 12, display: 'flex', alignItems: 'center' }}>
                                            <RetroIcon name="coin" size={12} style={{ marginRight: 4 }} /> {map.unlockCost}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Deck selection */}
                <div className="game-section">
                    <h2 className="game-section__title font-retro">Select Deck</h2>
                    {decks.length === 0 ? (
                        <p className="text-muted">No decks available. Build one in the Deck Builder!</p>
                    ) : (
                        <div className="deck-select-list">
                            {decks.map(deck => (
                                <div
                                    key={deck.id}
                                    className={`deck-select retro-panel ${selectedDeck === deck.id ? 'deck-select--selected' : ''}`}
                                    onClick={() => setSelectedDeck(deck.id)}
                                >
                                    <span className="font-retro" style={{ fontSize: 10 }}>{deck.name}</span>
                                    <span className="text-muted" style={{ fontSize: 11 }}>{deck.cardIds.length} cards</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Launch */}
                <button
                    className="retro-btn retro-btn--primary game-launch-btn"
                    onClick={startGame}
                    disabled={!selectedMap || !selectedDeck}
                    id="launch-game-btn"
                >
                    <RetroIcon name="chevron-right" size={16} style={{ marginRight: 6 }} /> LAUNCH GAME
                </button>
            </div>
        );
    }

    // ---- ACTIVE GAME ----
    return (
        <div className="game-container" id="game-active">
            {/* SVG Playfield */}
            {gameSnapshot && (
                <SvgPlayfield
                    state={gameSnapshot}
                    selectedZoneId={selectedZoneId}
                    onZoneClick={handleZoneClick}
                    onBackgroundClick={handleBackgroundClick}
                />
            )}

            {/* DOM HUD */}
            {gameSnapshot && <GameHUD state={gameSnapshot} />}

            {/* Tower Selection Modal */}
            {uiPhase === 'PLACEMENT_PHASE' && selectedZoneId && (
                <div className="tower-selection-overlay" onClick={() => {
                    setSelectedZoneId(null);
                }}>
                    <div className="tower-selection-container" onClick={e => e.stopPropagation()}>
                        {hand.map((cardDefId, idx) => {
                            const def = CARD_DEFINITIONS.find(c => c.id === cardDefId);
                            if (!def) return null;
                            return (
                                <div
                                    key={`${cardDefId}-${idx}`}
                                    className={`game-card game-card--${def.rarity}`}
                                    onClick={() => {
                                        if (selectedZoneId) {
                                            const state = gameStateRef.current;
                                            if (state) {
                                                gameStateRef.current = placeCard(state, cardDefId, selectedZoneId);
                                                setHand([...gameStateRef.current.hand]);
                                                setGameSnapshot({ ...gameStateRef.current });
                                                setSelectedZoneId(null);
                                            }
                                        }
                                    }}
                                >
                                    <div className="game-card__header">
                                        <span className="game-card__name">{def.name}</span>
                                        <span className="game-card__cost">{def.energyCost}</span>
                                    </div>
                                    <div className="game-card__art">
                                        <div className="game-card__art-placeholder" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                                            <CardTowerPreview card={def} size={50} />
                                        </div>
                                    </div>
                                    <div className="game-card__stats">
                                        <div className="game-card__stat-row">
                                            <span className="stat-label">DMG</span>
                                            <span className="stat-val">{def.primeEffect.baseDamage}</span>
                                        </div>
                                        <div className="game-card__stat-row">
                                            <span className="stat-label">RNG</span>
                                            <span className="stat-val">{def.primeEffect.range}</span>
                                        </div>
                                        <div className="game-card__stat-row">
                                            <span className="stat-label">SPD</span>
                                            <span className="stat-val">{def.primeEffect.fireRate}</span>
                                        </div>
                                    </div>
                                    <div className="game-card__info-btn" onClick={(e) => { e.stopPropagation(); setInspectedCard(def); }}>
                                        ℹ
                                    </div>
                                    <div className="game-card__desc">
                                        {def.flavorText}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Wave Control (Floating Button) */}
            {uiPhase === 'PLACEMENT_PHASE' && !selectedZoneId && (
                <div style={{ position: 'fixed', bottom: 70, right: 20, zIndex: 200 }}>
                    <button className="retro-btn retro-btn--danger" onClick={handleStartWave} style={{ padding: '12px 24px', fontSize: '16px' }}>
                        <RetroIcon name="run" size={18} style={{ marginRight: 8 }} /> SEND WAVE
                    </button>
                </div>
            )}

            {/* Game Result Overlay */}
            {gameResult && (
                <div className="game-result-overlay">
                    <div className="game-result retro-panel retro-panel--elevated">
                        <h2 className="font-retro" style={{ fontSize: 14, color: gameResult.won ? 'var(--retro-green)' : 'var(--retro-red)' }}>
                            {gameResult.won ? (
                                <span className="flex-center gap-sm">
                                    <RetroIcon name="trophy" size={24} /> VICTORY!
                                </span>
                            ) : (
                                <span className="flex-center gap-sm">
                                    <RetroIcon name="skull" size={24} /> DEFEATED
                                </span>
                            )}
                        </h2>
                        <p style={{ margin: 'var(--space-md) 0', color: 'var(--text-secondary)' }}>
                            Waves: {gameResult.waves} · Score: {gameResult.score}
                        </p>
                        <button className="retro-btn retro-btn--primary" onClick={handleBackToMenu}>
                            Back to Menu
                        </button>
                    </div>
                </div>
            )}

            <CardDetailModal card={inspectedCard} onClose={() => setInspectedCard(null)} />
        </div>
    );
}
