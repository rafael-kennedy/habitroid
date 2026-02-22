import type { MapDefinition } from './types';

// Maps are designed for ~600×800 canvas (mobile portrait)
// Paths are Bézier-like polyline paths enemies follow
// Placement zones are circular areas where towers can be placed

export const MAP_DEFINITIONS: MapDefinition[] = [
    {
        id: 'map-serpent',
        name: 'Serpent Pass',
        width: 600,
        height: 800,
        paths: [
            {
                id: 'path-main',
                points: [
                    { x: 0, y: 100 },
                    { x: 150, y: 100 },
                    { x: 200, y: 200 },
                    { x: 400, y: 200 },
                    { x: 450, y: 350 },
                    { x: 200, y: 350 },
                    { x: 150, y: 500 },
                    { x: 400, y: 500 },
                    { x: 450, y: 650 },
                    { x: 300, y: 700 },
                    { x: 300, y: 800 },
                ],
            },
        ],
        placementZones: [
            { id: 'z1', center: { x: 100, y: 250 }, radius: 24 },
            { id: 'z2', center: { x: 350, y: 280 }, radius: 24 },
            { id: 'z3', center: { x: 300, y: 420 }, radius: 24 },
            { id: 'z4', center: { x: 500, y: 420 }, radius: 24 },
            { id: 'z5', center: { x: 100, y: 580 }, radius: 24 },
            { id: 'z6', center: { x: 350, y: 600 }, radius: 24 },
            { id: 'z7', center: { x: 500, y: 150 }, radius: 24 },
        ],
        waves: [
            { enemies: [{ type: 'basic', count: 5, delay: 1.0 }] },
            { enemies: [{ type: 'basic', count: 8, delay: 0.8 }, { type: 'fast', count: 3, delay: 0.5 }] },
            { enemies: [{ type: 'basic', count: 6, delay: 0.8 }, { type: 'armored', count: 2, delay: 1.5 }] },
            { enemies: [{ type: 'fast', count: 10, delay: 0.4 }] },
            { enemies: [{ type: 'armored', count: 5, delay: 1.0 }, { type: 'basic', count: 5, delay: 0.7 }] },
            { enemies: [{ type: 'swarm', count: 20, delay: 0.2 }] },
            { enemies: [{ type: 'basic', count: 8, delay: 0.6 }, { type: 'fast', count: 5, delay: 0.4 }, { type: 'armored', count: 3, delay: 1.2 }] },
            { enemies: [{ type: 'boss', count: 1, delay: 0 }, { type: 'basic', count: 10, delay: 0.8 }] },
        ],
        startEnergy: 5,
        energyPerWave: 3,
        startHP: 20,
    },
    {
        id: 'map-crossroads',
        name: 'The Crossroads',
        width: 600,
        height: 800,
        paths: [
            {
                id: 'path-left',
                points: [
                    { x: 0, y: 300 },
                    { x: 150, y: 300 },
                    { x: 200, y: 400 },
                    { x: 300, y: 400 },
                    { x: 300, y: 600 },
                    { x: 300, y: 800 },
                ],
            },
            {
                id: 'path-right',
                points: [
                    { x: 600, y: 200 },
                    { x: 450, y: 200 },
                    { x: 400, y: 300 },
                    { x: 300, y: 400 },
                    { x: 300, y: 600 },
                    { x: 300, y: 800 },
                ],
            },
        ],
        placementZones: [
            { id: 'z1', center: { x: 100, y: 420 }, radius: 24 },
            { id: 'z2', center: { x: 200, y: 250 }, radius: 24 },
            { id: 'z3', center: { x: 450, y: 350 }, radius: 24 },
            { id: 'z4', center: { x: 200, y: 550 }, radius: 24 },
            { id: 'z5', center: { x: 400, y: 550 }, radius: 24 },
            { id: 'z6', center: { x: 500, y: 150 }, radius: 24 },
        ],
        waves: [
            { enemies: [{ type: 'basic', count: 6, delay: 0.9 }] },
            { enemies: [{ type: 'basic', count: 5, delay: 0.8 }, { type: 'fast', count: 5, delay: 0.5 }] },
            { enemies: [{ type: 'armored', count: 4, delay: 1.2 }, { type: 'swarm', count: 8, delay: 0.3 }] },
            { enemies: [{ type: 'fast', count: 12, delay: 0.3 }] },
            { enemies: [{ type: 'armored', count: 6, delay: 1.0 }, { type: 'basic', count: 8, delay: 0.6 }] },
            { enemies: [{ type: 'swarm', count: 25, delay: 0.15 }] },
            { enemies: [{ type: 'boss', count: 1, delay: 0 }, { type: 'armored', count: 4, delay: 1.0 }] },
            { enemies: [{ type: 'boss', count: 2, delay: 3.0 }, { type: 'fast', count: 10, delay: 0.3 }] },
        ],
        startEnergy: 6,
        energyPerWave: 3,
        startHP: 25,
    },
    {
        id: 'map-gauntlet',
        name: 'The Gauntlet',
        width: 600,
        height: 800,
        paths: [
            {
                id: 'path-main',
                points: [
                    { x: 300, y: 0 },
                    { x: 300, y: 150 },
                    { x: 100, y: 200 },
                    { x: 100, y: 350 },
                    { x: 500, y: 350 },
                    { x: 500, y: 500 },
                    { x: 100, y: 500 },
                    { x: 100, y: 650 },
                    { x: 300, y: 700 },
                    { x: 300, y: 800 },
                ],
            },
        ],
        placementZones: [
            { id: 'z1', center: { x: 450, y: 200 }, radius: 24 },
            { id: 'z2', center: { x: 200, y: 280 }, radius: 24 },
            { id: 'z3', center: { x: 300, y: 430 }, radius: 24 },
            { id: 'z4', center: { x: 100, y: 430 }, radius: 24 },
            { id: 'z5', center: { x: 500, y: 430 }, radius: 24 },
            { id: 'z6', center: { x: 300, y: 580 }, radius: 24 },
            { id: 'z7', center: { x: 450, y: 650 }, radius: 24 },
            { id: 'z8', center: { x: 150, y: 150 }, radius: 24 },
        ],
        waves: [
            { enemies: [{ type: 'basic', count: 8, delay: 0.7 }] },
            { enemies: [{ type: 'fast', count: 8, delay: 0.4 }, { type: 'basic', count: 5, delay: 0.8 }] },
            { enemies: [{ type: 'armored', count: 5, delay: 1.0 }] },
            { enemies: [{ type: 'swarm', count: 15, delay: 0.2 }, { type: 'fast', count: 5, delay: 0.4 }] },
            { enemies: [{ type: 'armored', count: 4, delay: 1.0 }, { type: 'basic', count: 10, delay: 0.5 }] },
            { enemies: [{ type: 'boss', count: 1, delay: 0 }, { type: 'swarm', count: 15, delay: 0.2 }] },
            { enemies: [{ type: 'fast', count: 15, delay: 0.25 }, { type: 'armored', count: 6, delay: 0.8 }] },
            { enemies: [{ type: 'boss', count: 2, delay: 2.0 }, { type: 'armored', count: 5, delay: 0.8 }, { type: 'fast', count: 8, delay: 0.3 }] },
            { enemies: [{ type: 'boss', count: 3, delay: 2.5 }, { type: 'swarm', count: 20, delay: 0.15 }] },
            { enemies: [{ type: 'boss', count: 1, delay: 0 }] }, // final boss (scaled up)
        ],
        startEnergy: 7,
        energyPerWave: 4,
        startHP: 15,
    },
    {
        id: 'map-magma',
        name: 'Magma Core',
        width: 600,
        height: 800,
        unlockCost: 1000,
        paths: [
            {
                id: 'path-left',
                points: [
                    { x: 100, y: 0 }, { x: 100, y: 200 }, { x: 250, y: 300 }, { x: 250, y: 500 }, { x: 100, y: 600 }, { x: 100, y: 800 }
                ]
            },
            {
                id: 'path-right',
                points: [
                    { x: 500, y: 0 }, { x: 500, y: 200 }, { x: 350, y: 300 }, { x: 350, y: 500 }, { x: 500, y: 600 }, { x: 500, y: 800 }
                ]
            },
            {
                id: 'path-center',
                points: [
                    { x: 300, y: 0 }, { x: 300, y: 150 }, { x: 300, y: 650 }, { x: 300, y: 800 }
                ]
            }
        ],
        placementZones: [
            { id: 'z1', center: { x: 180, y: 150 }, radius: 24 },
            { id: 'z2', center: { x: 420, y: 150 }, radius: 24 },
            { id: 'z3', center: { x: 300, y: 250 }, radius: 24 }, // Dangerous center spot
            { id: 'z4', center: { x: 180, y: 400 }, radius: 24 },
            { id: 'z5', center: { x: 420, y: 400 }, radius: 24 },
            { id: 'z6', center: { x: 300, y: 550 }, radius: 24 },
            { id: 'z7', center: { x: 200, y: 700 }, radius: 24 },
            { id: 'z8', center: { x: 400, y: 700 }, radius: 24 },
        ],
        waves: [
            { enemies: [{ type: 'fast', count: 10, delay: 0.5 }] },
            { enemies: [{ type: 'armored', count: 5, delay: 1.0 }, { type: 'basic', count: 10, delay: 0.5 }] },
            { enemies: [{ type: 'swarm', count: 20, delay: 0.2 }, { type: 'fast', count: 10, delay: 0.4 }] },
            { enemies: [{ type: 'boss', count: 1, delay: 0 }, { type: 'armored', count: 8, delay: 0.8 }] },
            { enemies: [{ type: 'fast', count: 20, delay: 0.2 }, { type: 'swarm', count: 30, delay: 0.1 }] },
            { enemies: [{ type: 'boss', count: 2, delay: 2.0 }, { type: 'armored', count: 10, delay: 0.8 }] },
        ],
        startEnergy: 8,
        energyPerWave: 4,
        startHP: 30,
    },
    {
        id: 'map-void',
        name: 'The Void',
        width: 600,
        height: 800,
        unlockCost: 3000,
        paths: [
            {
                id: 'path-spiral',
                points: [
                    // Spiral inward
                    { x: 0, y: 0 }, { x: 600, y: 0 }, { x: 600, y: 800 }, { x: 0, y: 800 },
                    { x: 0, y: 200 }, { x: 400, y: 200 }, { x: 400, y: 600 }, { x: 200, y: 600 },
                    { x: 200, y: 400 }, { x: 300, y: 400 } // Ends in center
                ]
            }
        ],
        placementZones: [
            // Center is the kill box
            { id: 'z1', center: { x: 300, y: 300 }, radius: 24 },
            { id: 'z2', center: { x: 300, y: 500 }, radius: 24 },
            { id: 'z3', center: { x: 500, y: 400 }, radius: 24 },
            { id: 'z4', center: { x: 100, y: 400 }, radius: 24 },
            { id: 'z5', center: { x: 300, y: 100 }, radius: 24 },
            { id: 'z6', center: { x: 300, y: 700 }, radius: 24 },
            { id: 'z7', center: { x: 500, y: 100 }, radius: 24 }, // Corners
            { id: 'z8', center: { x: 100, y: 100 }, radius: 24 },
            { id: 'z9', center: { x: 500, y: 700 }, radius: 24 },
            { id: 'z10', center: { x: 100, y: 700 }, radius: 24 },
        ],
        waves: [
            { enemies: [{ type: 'armored', count: 5, delay: 1.5 }] }, // Tanky start
            { enemies: [{ type: 'fast', count: 15, delay: 0.3 }] }, // Fast swarm
            { enemies: [{ type: 'boss', count: 1, delay: 0 }, { type: 'basic', count: 10, delay: 0.5 }] }, // Early boss
            { enemies: [{ type: 'swarm', count: 50, delay: 0.1 }] }, // Massive swarm
            { enemies: [{ type: 'armored', count: 10, delay: 0.8 }, { type: 'fast', count: 10, delay: 0.4 }] },
            { enemies: [{ type: 'boss', count: 3, delay: 3.0 }] }, // Triple boss
            { enemies: [{ type: 'swarm', count: 100, delay: 0.05 }] }, // The flood
            { enemies: [{ type: 'boss', count: 1, delay: 0 }] }, // Final scaled up boss logic handles HP
        ],
        startEnergy: 10,
        energyPerWave: 5,
        startHP: 1, // Hard mode: 1 HP!
    },
];
