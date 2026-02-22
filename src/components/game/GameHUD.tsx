import { memo } from 'react';
import type { GameState } from '../../game/types';
import RetroIcon from '../RetroIcon';

interface Props {
    state: GameState;
}

function GameHUD({ state }: Props) {
    const phaseLabel = state.phase === 'COMBAT_PHASE' ? 'COMBAT' : 'BUILD';
    const phaseClass = state.phase === 'COMBAT_PHASE'
        ? 'game-hud__phase--combat'
        : 'game-hud__phase--build';

    return (
        <div className="game-hud">
            <div className="game-hud__row">
                <span className="game-hud__stat game-hud__stat--wave">
                    W{state.currentWave + 1}/{state.totalWaves}
                </span>
                <span className="game-hud__stat game-hud__stat--hp">
                    <RetroIcon name="heart" size={14} color="#ff3b30" />
                    {state.hp}/{state.maxHp}
                </span>
                <span className="game-hud__stat game-hud__stat--energy">
                    <RetroIcon name="bolt" size={14} color="#ffea00" />
                    {Math.floor(state.energy)}
                    <div className="game-hud__energy-gauge">
                        <div
                            className="game-hud__energy-fill"
                            style={{ width: `${(state.energy % 1) * 100}%` }}
                        />
                    </div>
                </span>
                <span className="game-hud__stat game-hud__stat--score">
                    {state.score}
                </span>
            </div>
            <div className="game-hud__row">
                <span className={`game-hud__phase ${phaseClass}`}>
                    {phaseLabel}
                </span>
                <span className="game-hud__score-label">SCORE</span>
            </div>
        </div>
    );
}

export default memo(GameHUD);
