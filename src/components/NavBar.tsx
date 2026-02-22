import { NavLink } from 'react-router-dom';
import RetroIcon, { type IconName } from './RetroIcon';
import { motion } from 'framer-motion';
import './NavBar.css';

const NAV_ITEMS: { path: string; icon: IconName; label: string }[] = [
    { path: '/', icon: 'target', label: 'Habits' },
    { path: '/food', icon: 'burger', label: 'Food' },
    { path: '/shop', icon: 'crate', label: 'Shop' },
    { path: '/decks', icon: 'cards', label: 'Decks' },
    { path: '/game', icon: 'gamepad', label: 'Game' },
    { path: '/stats', icon: 'stats', label: 'Stats' },
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
                    {({ isActive }) => (
                        <>
                            <div className="navbar__icon">
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.2 : 1,
                                        y: isActive ? -2 : 0
                                    }}
                                    whileTap={{ scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <RetroIcon name={item.icon} size={20} />
                                </motion.div>
                            </div>
                            <span className="navbar__label">{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
