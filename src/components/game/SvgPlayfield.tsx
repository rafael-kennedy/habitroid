import { memo } from 'react';
import type { GameState } from '../../game/types';
import { MAP_DEFINITIONS } from '../../game/map';
import PathLayer from './PathLayer';
import ZoneLayer from './ZoneLayer';
import BaseSprite from './BaseSprite';
import TowerSprite from './TowerSprite';
import EnemySprite from './EnemySprite';
import ProjectileSprite from './ProjectileSprite';
import VFXLayer from './VFXLayer';
import './Playfield.css';

interface Props {
    state: GameState;
    selectedZoneId: string | null;
    onZoneClick: (zoneId: string) => void;
    onTowerClick: (towerId: string, zoneId: string) => void;
    onEnemyClick: (enemyId: string) => void;
    onBackgroundClick: () => void;
}

function SvgPlayfield({ state, selectedZoneId, onZoneClick, onTowerClick, onEnemyClick, onBackgroundClick }: Props) {
    const map = MAP_DEFINITIONS.find(m => m.id === state.mapId);
    if (!map) return null;

    const isPlacing = state.phase === 'PLACEMENT_PHASE';

    return (
        <div className="playfield-wrapper" onClick={onBackgroundClick}>
            <svg
                className="playfield-svg"
                viewBox={`0 0 ${map.width} ${map.height}`}
                preserveAspectRatio="xMidYMin meet"
            >
                {/* SVG Filter Definitions */}
                <defs>
                    <filter id="neonCyan" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feFlood floodColor="#00ffff" floodOpacity="0.6" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonGreen" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feFlood floodColor="#39ff14" floodOpacity="0.6" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonPink" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                        <feFlood floodColor="#ff2d95" floodOpacity="0.5" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonYellow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                        <feFlood floodColor="#ffea00" floodOpacity="0.5" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonOrange" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                        <feFlood floodColor="#ff6b35" floodOpacity="0.5" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonPurple" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                        <feFlood floodColor="#bf5af2" floodOpacity="0.5" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonRed" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feFlood floodColor="#ff3b30" floodOpacity="0.6" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonBlue" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                        <feFlood floodColor="#5ac8fa" floodOpacity="0.5" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonWhite" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                        <feFlood floodColor="#ffffff" floodOpacity="0.4" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Grid pattern */}
                    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <line x1="40" y1="0" x2="40" y2="40" stroke="rgba(57,255,20,0.08)" strokeWidth="1" />
                        <line x1="0" y1="40" x2="40" y2="40" stroke="rgba(57,255,20,0.08)" strokeWidth="1" />
                    </pattern>
                </defs>

                {/* Grid background */}
                <rect width={map.width} height={map.height} fill="url(#gridPattern)" opacity={0.6} />

                {/* Static layers */}
                <PathLayer paths={map.paths} />
                <ZoneLayer
                    zones={map.placementZones}
                    towers={state.towers}
                    selectedZoneId={selectedZoneId}
                    isPlacing={isPlacing}
                    onZoneClick={onZoneClick}
                />

                <BaseSprite state={state} />

                {/* Dynamic layers */}
                {state.towers.map(tower => (
                    <TowerSprite
                        key={tower.id}
                        tower={tower}
                        onClick={() => onTowerClick(tower.id, tower.zoneId)}
                    />
                ))}
                {state.enemies.map(enemy => (
                    <EnemySprite key={enemy.id} enemy={enemy} onClick={onEnemyClick} />
                ))}
                {state.projectiles.map(proj => (
                    <ProjectileSprite key={proj.id} proj={proj} />
                ))}

                {/* VFX: hit flashes, death explosions */}
                <VFXLayer state={state} />
            </svg>
        </div>
    );
}

export default memo(SvgPlayfield);
