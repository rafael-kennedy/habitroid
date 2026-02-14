import { memo, useMemo } from 'react';
import type { Tower } from '../../game/types';
import { CARD_DEFINITIONS, type TowerVisuals } from '../../data/cardDefinitions';

interface Props {
    tower: Tower;
}

// Helper to generate Star/Spiky/Bouba paths
function getShapePath(visuals: TowerVisuals): string {
    try {
        const { baseShape, basePoints } = visuals;
        const r = 10;

        if (baseShape === 'circle') return `M ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0`;
        if (baseShape === 'square') return `M ${-r} ${-r} L ${r} ${-r} L ${r} ${r} L ${-r} ${r} Z`;
        if (baseShape === 'hex') {
            return Array.from({ length: 6 }, (_, i) => {
                const a = i * Math.PI / 3;
                return `${Math.cos(a) * r},${Math.sin(a) * r}`;
            }).map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p).join(' ') + ' Z';
        }
        if (baseShape === 'diamond') return `M 0 ${-r * 1.2} L ${r * 0.8} 0 L 0 ${r * 1.2} L ${-r * 0.8} 0 Z`;
        if (baseShape === 'chevron') return `M ${-r} ${r} L 0 ${-r} L ${r} ${r} L 0 ${r * 0.5} Z`;
        if (baseShape === 'crescent') return `M ${r} 0 A ${r} ${r} 0 1 1 ${-r * 0.5} ${-r * 0.8} Q 0 0 ${-r * 0.5} ${r * 0.8} A ${r} ${r} 0 0 1 ${r} 0`;

        // Procedural Polygon/Star/Bouba
        const points: string[] = [];
        const step = (Math.PI * 2) / (basePoints || 3);

        for (let i = 0; i < (basePoints || 3) * 2; i++) {
            const a = i * step / 2;
            let rad = r;
            if (i % 2 !== 0) {
                if (baseShape === 'star') rad = r * 0.5;
                if (baseShape === 'spiky') rad = r * 0.3; // Sharper
                if (baseShape === 'bouba') rad = r * 0.8; // Smoother
            }
            if (isNaN(rad)) rad = r;
            points.push(`${Math.cos(a) * rad} ${Math.sin(a) * rad}`);
        }

        if (baseShape === 'bouba') {
            // Curve through points
            return `M ${points[0]} ` + points.map((p) => {
                return `L ${p}`;
            }).join(' ') + ' Z';
        }

        return `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ') + ' Z';
    } catch (e) {
        console.error("Error generating shape path:", e, visuals);
        return "M 10 0 A 10 10 0 0 0 -10 0 A 10 10 0 0 0 10 0";
    }
}

function getBarrelPath(visuals: TowerVisuals): React.JSX.Element | null {
    try {
        const { barrelShape, barrelCount, barrelLength, coreColor } = visuals;
        // Barrel group
        return (
            <g className="tower-barrel-group">
                {Array.from({ length: barrelCount || 1 }).map((_, i) => {
                    const offset = (i - ((barrelCount || 1) - 1) / 2) * 6;

                    let path = '';
                    if (barrelShape === 'rect') path = `M -2 0 L -2 -${barrelLength} L 2 -${barrelLength} L 2 0 Z`;
                    else if (barrelShape === 'tapered') path = `M -3 0 L -1 -${barrelLength} L 1 -${barrelLength} L 3 0 Z`;
                    else if (barrelShape === 'tri') path = `M -4 0 L 0 -${barrelLength} L 4 0 Z`;
                    else if (barrelShape === 'multi') path = `M -1.5 0 L -1.5 -${barrelLength} L 1.5 -${barrelLength} L 1.5 0 Z`; // Thinner
                    else if (barrelShape === 'orb') return <circle key={i} cx={offset} cy={-(barrelLength || 12) / 2} r={3} fill={coreColor} />;
                    else path = `M -2 0 L -2 -10 L 2 -10 L 2 0 Z`;

                    return <path key={i} d={path} fill={coreColor} transform={`translate(${offset}, 0)`} />;
                })}
            </g>
        );
    } catch (e) {
        console.error("Error generating barrel:", e, visuals);
        return null;
    }
}

function TowerSprite({ tower }: Props) {
    if (!CARD_DEFINITIONS || CARD_DEFINITIONS.length === 0) {
        console.error("CARD_DEFINITIONS missing!");
        return <circle r={10} fill="red" />;
    }

    const cardDef = useMemo(() => CARD_DEFINITIONS.find(c => c.id === tower.primeCardDefId), [tower.primeCardDefId]);

    // Default fallback visuals if missing (shouldn't happen with updated data)
    const visuals = cardDef?.visuals ?? {
        baseShape: 'hex', basePoints: 6, baseScale: 1, baseStrokeWidth: 2, baseRotation: 0,
        barrelShape: 'rect', barrelCount: 1, barrelLength: 12,
        coreColor: '#ccc', accentColor: '#fff', glowColor: '#0ff'
    } as TowerVisuals;

    // Pulse brightness based on cooldown
    const recharge = 1 - (tower.cooldown / (1 / (tower.fireRate || 1)));
    const alpha = 0.2 + 0.3 * Math.max(0, recharge);

    if (cardDef?.visualPath) {
        return (
            <g className="tower-group" transform={`translate(${tower.x}, ${tower.y})`}>
                <circle className="tower-range" cx={0} cy={0} r={tower.range} />

                {/* Static SVG asset, rotated to face target */}
                {/* The asset is 64x64, viewbox -20 -20 40 40. We render it centered. */}
                {/* Note: tower.angle is in radians. valid SVG transform rotate uses degrees. */}
                {/* Also, standard 0 deg usually points RIGHT in math, but in our assets UP is default? */}
                {/* In procedural: barrel points up (negative Y) and we rotate by angle + 90 deg. */}
                {/* Let's replicate that rotation. */}

                <g transform={`rotate(${(tower.angle * 180) / Math.PI + 90})`}>
                    <image
                        href={cardDef.visualPath}
                        x={-20} y={-20}
                        width={40} height={40}
                        style={{ filter: recharge > 0 ? 'brightness(1.2)' : 'none', opacity: 1 }} // simple feedback
                    />
                </g>

                {/* Pulse effect overlay */}
                <circle cx={0} cy={0} r={16} fill={visuals.glowColor || 'cyan'} opacity={alpha} filter="blur(4px)" pointerEvents="none" />
            </g>
        );
    }

    const baseD = useMemo(() => getShapePath(visuals), [visuals]);

    if (!baseD) return <circle r={10} fill="magenta" />;

    return (
        <g className="tower-group" transform={`translate(${tower.x}, ${tower.y})`}>
            {/* Range indicator (visible on hover via CSS) */}
            <circle className="tower-range" cx={0} cy={0} r={tower.range} />

            {/* Base glow */}
            <circle className="tower-glow" cx={0} cy={0} r={16 * (visuals.baseScale || 1)} opacity={alpha} fill={visuals.glowColor || 'cyan'} filter="blur(4px)" />

            {/* Main Base Shape */}
            <g transform={`scale(${visuals.baseScale || 1}) rotate(${visuals.baseRotation || 0})`}>
                <path
                    d={baseD}
                    fill="#111"
                    stroke={visuals.coreColor || '#fff'}
                    strokeWidth={visuals.baseStrokeWidth || 2}
                    strokeLinejoin={visuals.baseShape === 'bouba' ? 'round' : 'miter'}
                    strokeLinecap={visuals.baseShape === 'bouba' ? 'round' : 'butt'}
                />

                {/* Inner Accent */}
                <path
                    d={baseD}
                    fill="none"
                    stroke={visuals.accentColor || '#fff'}
                    strokeWidth={1}
                    transform="scale(0.6)"
                    opacity={0.7}
                />
            </g>

            {/* Rotating barrel */}
            <g transform={`rotate(${(tower.angle * 180) / Math.PI + 90})`}>
                {getBarrelPath(visuals)}
            </g>
        </g>
    );
}

export default memo(TowerSprite);
