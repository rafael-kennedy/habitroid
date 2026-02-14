import { NavLink } from 'react-router-dom';
import RetroIcon, { type IconName } from './RetroIcon';
import './NavBar.css';

const NAV_ITEMS: { path: string; icon: IconName; label: string }[] = [
    { path: '/', icon: 'target', label: 'Habits' },
    { path: '/food', icon: 'apple', label: 'Food' },
    { path: '/shop', icon: 'crate', label: 'Shop' },
    { path: '/decks', icon: 'cards', label: 'Decks' },
    { path: '/game', icon: 'gamepad', label: 'Game' },
];

export default function NavBar() {
    return (
        <nav className="navbar" id="main-nav">
            {NAV_ITEMS.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `navbar__item ${isActive ? 'navbar__item--active' : ''}`}
                >
                    <div className="navbar__icon">
                        <RetroIcon name={item.icon} size={20} />
                    </div>
                    <span className="navbar__label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
