import { memo } from 'react';
import type { GameState } from '../../game/types';
import { MAP_DEFINITIONS } from '../../game/map';

interface Props {
    state: GameState;
}

function BaseSprite({ state }: Props) {
    const map = MAP_DEFINITIONS.find(m => m.id === state.mapId);
    if (!map) return null;

    // Find the end of the first path (usually where the base is)
    // Most maps have paths converging to one point or similar endpoints.
    // For simplicity, we'll place a base at the end of EACH path?
    // Or just the first one?
    // Let's place it at the end of the first path for now, or multiple if they are far apart.
    // Actually, checking map.ts, "The Gauntlet" ends at 300,800. "The Crossroads" ends at 300,800.
    // "Serpent Pass" ends at 300,800.
    // "Magma Core" has 3 paths ending at 100,800 / 500,800 / 300,800.
    // "The Void" spirals to center 300,400.

    // We should probably render a base at the end of every path.

    const endPoints = map.paths.map(p => {
        return p.points[p.points.length - 1];
    });

    // Deduplicate points (if multiple paths end at same spot)
    const uniqueEnds = endPoints.filter((p, index, self) =>
        index === self.findIndex((t) => (
            t.x === p.x && t.y === p.y
        ))
    );

    return (
        <g className="base-layer">
            {uniqueEnds.map((end, i) => (
                <g key={i} transform={`translate(${end.x}, ${end.y})`}>
                    {/* Pulsing Shield */}
                    <circle r={24} fill="none" stroke="#4a90e2" strokeWidth={2} opacity={0.6}>
                        <animate attributeName="r" values="22;26;22" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>

                    {/* Base Icon - using app icon (vite.svg) */}
                    <image
                        href="/vite.svg"
                        x={-20}
                        y={-20}
                        width={40}
                        height={40}
                        preserveAspectRatio="xMidYMid slice"
                    />

                    {/* HP Text if needed, though it's in HUD */}
                </g>
            ))}
        </g>
    );
}

export default memo(BaseSprite);
