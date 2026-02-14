import { useEffect, useState, useRef } from 'react';
import { useEconomyStore } from '../store/economyStore';
import { exportState, importState, downloadStateFile, readStateFile } from '../services/stateFile';
import RetroIcon from '../components/RetroIcon';
import './SettingsScreen.css';

export default function SettingsScreen() {
    const { settings, loading, loadEconomy, updateSettings } = useEconomyStore();
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);
    const [importStatus, setImportStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadEconomy();
    }, [loadEconomy]);

    useEffect(() => {
        if (settings) {
            setApiKey(settings.openaiApiKey || '');
        }
    }, [settings]);

    const handleSaveKey = async () => {
        await updateSettings({ openaiApiKey: apiKey });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleExport = async () => {
        const json = await exportState();
        downloadStateFile(json);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const json = await readStateFile(file);
            await importState(json);
            setImportStatus('✅ Import successful! Reloading...');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setImportStatus(`❌ ${err instanceof Error ? err.message : 'Import failed'}`);
        }
    };

    if (loading || !settings) {
        return <div className="screen"><p className="text-muted">Loading...</p></div>;
    }

    return (
        <div className="screen" id="settings-screen">
            <h1 className="screen-title">Settings</h1>

            {/* OpenAI Key */}
            <section className="settings-section retro-panel">
                <h2 className="settings-section__title font-retro">
                    <RetroIcon name="mind" size={16} style={{ marginRight: 8 }} />
                    AI Food Analysis
                </h2>
                <p className="settings-desc">Enter your OpenAI API key for AI-powered food tracking.</p>
                <div className="form-group">
                    <label className="form-label">API Key</label>
                    <input
                        className="retro-input"
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        id="api-key-input"
                    />
                </div>
                <button className="retro-btn retro-btn--primary" onClick={handleSaveKey}>
                    {saved ? <span className="flex-center gap-xs"><RetroIcon name="check" size={12} /> Saved!</span> : 'Save Key'}
                </button>
            </section>

            {/* Data Management */}
            <section className="settings-section retro-panel">
                <h2 className="settings-section__title font-retro">
                    <RetroIcon name="crate" size={16} style={{ marginRight: 8 }} />
                    Data Management
                </h2>
                <p className="settings-desc">Export your data as a JSON backup or import from a previous backup.</p>
                <div className="settings-actions">
                    <button className="retro-btn retro-btn--primary" onClick={handleExport}>
                        <span className="flex-center gap-xs"><RetroIcon name="chevron-right" size={12} style={{ transform: 'rotate(-90deg)' }} /> Export Data</span>
                    </button>
                    <button className="retro-btn" onClick={() => fileInputRef.current?.click()}>
                        <span className="flex-center gap-xs"><RetroIcon name="chevron-right" size={12} style={{ transform: 'rotate(90deg)' }} /> Import Data</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                </div>
                {importStatus && <p className="import-status">{importStatus}</p>}
            </section>

            {/* Daily Goals */}
            <section className="settings-section retro-panel">
                <h2 className="settings-section__title font-retro">
                    <RetroIcon name="target" size={16} style={{ marginRight: 8 }} />
                    Daily Goals
                </h2>
                <div className="goals-grid">
                    <div className="form-group">
                        <label className="form-label">Calories</label>
                        <input
                            className="retro-input"
                            type="number"
                            value={settings.dailyCalorieGoal}
                            onChange={e => updateSettings({ dailyCalorieGoal: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Protein (g)</label>
                        <input
                            className="retro-input"
                            type="number"
                            value={settings.dailyProteinGoal}
                            onChange={e => updateSettings({ dailyProteinGoal: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Carbs (g)</label>
                        <input
                            className="retro-input"
                            type="number"
                            value={settings.dailyCarbsGoal}
                            onChange={e => updateSettings({ dailyCarbsGoal: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Fat (g)</label>
                        <input
                            className="retro-input"
                            type="number"
                            value={settings.dailyFatGoal}
                            onChange={e => updateSettings({ dailyFatGoal: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="settings-section retro-panel">
                <h2 className="settings-section__title font-retro">
                    <RetroIcon name="gamepad" size={16} style={{ marginRight: 8 }} />
                    About
                </h2>
                <p className="settings-desc">
                    Habitroid v0.1.0 — Gamify your habits with tower defense.
                </p>
                <p className="text-muted" style={{ fontSize: 11 }}>
                    All data stored locally on your device.
                </p>
                <button
                    className="retro-btn"
                    style={{ marginTop: 'var(--space-md)' }}
                    onClick={() => updateSettings({ walkthroughCompleted: false })}
                >
                    Reset Walkthrough
                </button>
            </section>
        </div>
    );
}
