import { memo } from 'react';
import type { PlacementZone, Tower } from '../../game/types';

interface Props {
    zones: PlacementZone[];
    towers: Tower[];
    selectedZoneId: string | null;
    isPlacing: boolean;
    onZoneClick: (zoneId: string) => void;
}

function ZoneLayer({ zones, towers, selectedZoneId, isPlacing, onZoneClick }: Props) {
    return (
        <g className="zone-layer">
            {zones.map(zone => {
                const hasTower = towers.some(t => t.zoneId === zone.id);
                const isSelected = zone.id === selectedZoneId;

                let className = 'zone';
                if (isSelected) className += ' zone--selected';
                else if (hasTower) className += ' zone--occupied';
                else if (isPlacing) className += ' zone--available';

                return (
                    <circle
                        key={zone.id}
                        className={className}
                        cx={zone.center.x}
                        cy={zone.center.y}
                        r={zone.radius}
                        onClick={(e) => {
                            e.stopPropagation();
                            onZoneClick(zone.id);
                        }}
                    />
                );
            })}
        </g>
    );
}

export default memo(ZoneLayer);
