import { memo } from 'react';
import type { Projectile } from '../../game/types';

interface Props {
    proj: Projectile;
}

function ProjectileSprite({ proj }: Props) {
    return (
        <g transform={`translate(${proj.x}, ${proj.y})`}>
            <circle className="projectile" cx={0} cy={0} r={3} />
            <circle className="projectile-core" cx={0} cy={0} r={1.5} />
        </g>
    );
}

export default memo(ProjectileSprite);
