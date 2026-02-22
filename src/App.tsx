import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from './components/NavBar';
import RetroIcon from './components/RetroIcon';
import HabitScreen from './screens/HabitScreen';
import FoodScreen from './screens/FoodScreen';
import ShopScreen from './screens/ShopScreen';
import DeckScreen from './screens/DeckScreen';
import GameScreen from './screens/GameScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import WalkthroughOverlay from './components/WalkthroughOverlay';
import { initializeDB } from './services/db';
import { useEconomyStore } from './store/economyStore';

function AppContent() {
  const loadEconomy = useEconomyStore(s => s.loadEconomy);
  const settings = useEconomyStore(s => s.settings);

  useEffect(() => {
    initializeDB().then(() => loadEconomy());
  }, [loadEconomy]);

  return (
    <>
      <div className="app-header">
        <Link to="/" className="app-logo font-retro">HABITROID</Link>
        <Link to="/settings" className="settings-link">
          <RetroIcon name="settings" size={20} />
        </Link>
      </div>
      <Routes>
        <Route path="/" element={<HabitScreen />} />
        <Route path="/food" element={<FoodScreen />} />
        <Route path="/shop" element={<ShopScreen />} />
        <Route path="/decks" element={<DeckScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/stats" element={<StatsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
      <NavBar />

      {settings && !settings.walkthroughCompleted && <WalkthroughOverlay />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
