// State File Export/Import Service
import { db } from './db';

export interface StateFile {
    version: 1;
    exportedAt: string;
    data: {
        habits: unknown[];
        foodEntries: unknown[];
        cards: unknown[];
        decks: unknown[];
        transactions: unknown[];
        gameResults: unknown[];
        settings: unknown;
    };
}

export async function exportState(): Promise<string> {
    const [habits, foodEntries, cards, decks, transactions, gameResults, settings] =
        await Promise.all([
            db.habits.toArray(),
            db.foodEntries.toArray(),
            db.cards.toArray(),
            db.decks.toArray(),
            db.transactions.toArray(),
            db.gameResults.toArray(),
            db.settings.get('settings'),
        ]);

    const stateFile: StateFile = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: { habits, foodEntries, cards, decks, transactions, gameResults, settings },
    };

    return JSON.stringify(stateFile, null, 2);
}

export async function importState(jsonString: string): Promise<void> {
    const stateFile = JSON.parse(jsonString) as StateFile;

    if (stateFile.version !== 1) {
        throw new Error(`Unsupported state file version: ${stateFile.version}`);
    }

    // Clear all existing data
    await Promise.all([
        db.habits.clear(),
        db.foodEntries.clear(),
        db.cards.clear(),
        db.decks.clear(),
        db.transactions.clear(),
        db.gameResults.clear(),
        db.settings.clear(),
    ]);

    // Import all data
    const { data } = stateFile;
    await Promise.all([
        db.habits.bulkPut(data.habits as never[]),
        db.foodEntries.bulkPut(data.foodEntries as never[]),
        db.cards.bulkPut(data.cards as never[]),
        db.decks.bulkPut(data.decks as never[]),
        db.transactions.bulkPut(data.transactions as never[]),
        db.gameResults.bulkPut(data.gameResults as never[]),
        data.settings ? db.settings.put(data.settings as never) : Promise.resolve(),
    ]);
}

export function downloadStateFile(jsonString: string) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitroid-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function readStateFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
