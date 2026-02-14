import React from 'react';
import './RetroIcon.css';

export type IconName =
    | 'target' // Habits
    | 'apple'  // Food
    | 'crate'  // Shop
    | 'cards'  // Decks
    | 'gamepad' // Game
    | 'coin'
    | 'bolt'   // Energy
    | 'heart'  // HP
    | 'settings'
    | 'check'
    | 'plus'
    | 'cross'  // Close/Delete
    | 'chevron-left'
    | 'chevron-right'
    | 'trash'
    | 'edit'
    | 'run'
    | 'water'
    | 'book'
    | 'moon'
    | 'sun'
    | 'weights'
    | 'mind'
    | 'coffee'
    | 'burger'
    | 'utensils'
    | 'cookie'
    | 'trophy'
    | 'skull'
    | 'shield'
    | 'star'
    | 'arrow-right';

export interface RetroIconProps {
    name: IconName;
    size?: number;
    color?: string;
    className?: string;
    glow?: boolean;
    style?: React.CSSProperties;
}

const PATHS: Record<IconName, React.JSX.Element> = {
    // Nav
    target: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0-6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" />,
    apple: <path d="M12 2a3 3 0 0 0-3 3 8 8 0 0 0-8 8c0 4.4 3.6 9 8 9 2.5 0 3-1 3-1s.5 1 3 1c4.4 0 8-4.6 8-9a8 8 0 0 0-8-8 3 3 0 0 0-3-3zm0 2c.8 0 1.5.7 1.5 1.5S12.8 7 12 7s-1.5-.7-1.5-1.5S11.2 4 12 4z" />,
    crate: <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7zm2 2v6h6V9H9z" />, // Asteroids style box
    cards: <path d="M4 2h12v16H4V2zm2 2v12h8V4H6zm4 4h12v16H10v-2h10V10h-8v6H10V8z" />,
    gamepad: <path d="M2 12h20v6H2v-6zm2 2v2h2v-2H4zm14 0v2h2v-2h-2zM6 8h12v2H6V8zm6-4h2v2h-2V4z" />,

    // Stats
    coin: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M11 7h2v10h-2V7z" />,
    bolt: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,

    // UI
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" strokeWidth="2" />,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" strokeWidth="2" />,
    'arrow-right': <path d="M5 12h14M12 5l7 7-7 7" fill="none" strokeWidth="2" />,
    settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c4.97 0 9-4.03 9-9h-2a7 7 0 1 0-14 0H3c0 4.97 4.03 9 9 9z" />, // Simplified gear
    check: <polyline points="20 6 9 17 4 12" fill="none" strokeWidth="3" />,
    plus: <path d="M11 5v6H5v2h6v6h2v-6h6v-2h-6V5h-2z" />,
    cross: (
        <>
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
        </>
    ),
    'chevron-left': <polyline points="15 18 9 12 15 6" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    'chevron-right': <polyline points="9 18 15 12 9 6" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" strokeWidth="2" />,
    edit: (
        <>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" strokeWidth="2" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" strokeWidth="2" />
        </>
    ),

    // Habits
    run: <path d="M19 14v4h-3v5h-2v-3h-2v2h-2v-4h2v-3h3v-2h-2l-1-2-1 1-1-1 3-3 2 1 1-1 2 2-1 2-2 1v3h3z" />, // Pixel-style runner
    water: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
    book: (
        <>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" strokeWidth="2" />
            <path d="M4 19.5S4 3.5 6.5 3.5H20v14H6.5" fill="none" strokeWidth="2" />
        </>
    ),
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    sun: (
        <>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" />
            <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" />
            <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" />
            <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" />
        </>
    ),
    weights: (
        <>
            <path d="M6.5 5a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V5.5a.5.5 0 0 0-.5-.5h-2zM15 5a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V5.5a.5.5 0 0 0-.5-.5h-2z" />
            <path d="M4 8h16v8H4z" />
        </>
    ),
    mind: <path d="M12 2a5 5 0 0 1 5 5c0 3-2.5 5-5 9-2.5-4-5-6-5-9a5 5 0 0 1 5-5z" />,

    // Food
    coffee: (
        <>
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" fill="none" strokeWidth="2" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="none" strokeWidth="2" />
            <line x1="6" y1="1" x2="6" y2="4" strokeWidth="2" />
            <line x1="10" y1="1" x2="10" y2="4" strokeWidth="2" />
            <line x1="14" y1="1" x2="14" y2="4" strokeWidth="2" />
        </>
    ),
    burger: (
        <>
            <rect x="4" y="12" width="16" height="4" rx="1" />
            <path d="M4 12V9a8 8 0 0 1 16 0v3" />
            <path d="M4 16v3a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-3" />
        </>
    ),
    utensils: (
        <>
            <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" fill="none" strokeWidth="2" />
            <path d="M3 15h18" fill="none" strokeWidth="2" />
            <path d="M12 15v6" strokeWidth="2" />
        </>
    ),
    cookie: (
        <>
            <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="15" cy="10" r="1.5" />
            <circle cx="14" cy="16" r="1.5" />
            <circle cx="9" cy="15" r="1.5" />
        </>
    ),

    // Game
    trophy: <path d="M8 21h8M12 17v4M6 4h12a4 4 0 0 1 4 4 4 4 0 0 1-4 4h-1.18a7 7 0 1 1-9.64 0H6a4 4 0 0 1-4-4 4 4 0 0 1 4-4z" fill="none" strokeWidth="2" />,
    skull: <path d="M12 2a9 9 0 0 0-9 9c0 3.8 2.5 6.9 6 8.3V22h6v-2.7c3.5-1.4 6-4.5 6-8.3a9 9 0 0 0-9-9z M9 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0z M15 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
};

export default function RetroIcon({ name, size = 24, color = 'currentColor', className = '', glow = true, style }: RetroIconProps) {
    const path = PATHS[name];

    if (!path) {
        console.warn(`Icon "${name}" not found`);
        return null; // Return null instead of erroring
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color === 'currentColor' ? 'currentColor' : undefined}
            stroke={color === 'currentColor' ? 'currentColor' : undefined}
            strokeWidth="0"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`retro-icon ${glow ? 'retro-icon--glow' : ''} ${className}`}
            style={{ color, ...style } as React.CSSProperties}
        >
            {/* Some icons are purely stroked, so we handle fill/stroke via classes or inline in paths */}
            {path}
        </svg>
    );
}
