import { describe, it, expect } from 'vitest';

// --- LOGIC UNDER TEST (Refined for UTC consistency) ---

function getISOWeek(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const year = date.getUTCFullYear();
    const week = Math.ceil((((date.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000) + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
}

function isTargetDay(dateStr: string, targetDays: number[]): boolean {
    const day = new Date(dateStr).getUTCDay(); // 0=Sun, 6=Sat
    return targetDays.includes(day);
}

function calculateStreak(completions: string[], frequency: 'daily' | 'weekly' | 'custom' | 'anytime', targetDays: number[] = [], targetCount: number = 1): number {
    if (frequency === 'anytime') return 0;
    if (completions.length === 0) return 0;

    const sorted = [...completions].sort().reverse();
    // Use UTC date for "today"
    const today = new Date().toISOString().split('T')[0];

    // Weekly Logic
    if (frequency === 'weekly') {
        const weeks: Record<string, number> = {};
        for (const date of sorted) {
            const week = getISOWeek(date);
            weeks[week] = (weeks[week] || 0) + 1;
        }

        const currentWk = getISOWeek(today);
        const isWeekComplete = (w: string) => (weeks[w] || 0) >= targetCount;

        // Iterate backwards from Previous Week
        // Use a date pointer initialized to 7 days ago
        let wDate = new Date();
        wDate.setUTCDate(wDate.getUTCDate() - 7);
        let wStr = getISOWeek(wDate.toISOString().split('T')[0]);
        let pastStreak = 0;

        for (let i = 0; i < 260; i++) {
            if (isWeekComplete(wStr)) {
                pastStreak++;
                wDate.setUTCDate(wDate.getUTCDate() - 7);
                wStr = getISOWeek(wDate.toISOString().split('T')[0]);
            } else {
                break;
            }
        }

        let totalStreak = pastStreak;
        if (isWeekComplete(currentWk)) {
            totalStreak++;
        }

        return totalStreak;
    }

    // Daily Logic
    let streak = 0;
    // Start from Yesterday
    let d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);

    let loops = 0;

    // Check past days
    while (loops < 365 * 5) {
        loops++;
        const dateStr = d.toISOString().split('T')[0];

        if (isTargetDay(dateStr, targetDays)) {
            if (sorted.includes(dateStr)) {
                streak++;
            } else {
                break; // Broken!
            }
        }
        d.setUTCDate(d.getUTCDate() - 1);
    }

    // Check Today
    if (isTargetDay(today, targetDays) && sorted.includes(today)) {
        streak++;
    }

    return streak;
}

// --- TESTS ---

describe('Streak Calculation Logic', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBeforeYesterday = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

    describe('Daily Habits', () => {
        const allDays = [0, 1, 2, 3, 4, 5, 6];

        it('returns 0 for no completions', () => {
            expect(calculateStreak([], 'daily', allDays)).toBe(0);
        });

        it('counts today if completed', () => {
            expect(calculateStreak([today], 'daily', allDays)).toBe(1);
        });

        it('counts yesterday if completed (but not today)', () => {
            expect(calculateStreak([yesterday], 'daily', allDays)).toBe(1);
        });

        it('sums consecutive days', () => {
            expect(calculateStreak([today, yesterday], 'daily', allDays)).toBe(2);
        });

        it('breaks on missing day', () => {
            expect(calculateStreak([today, threeDaysAgo], 'daily', allDays)).toBe(1); // Gap at yesterday/2daysAgo
        });

        it('respects target days (skips non-target days)', () => {
            const todayIdx = new Date().getUTCDay();
            const yesterdayIdx = new Date(Date.now() - 86400000).getUTCDay();
            const dayBeforeIdx = new Date(Date.now() - 2 * 86400000).getUTCDay();

            // Case: Target Days = [Today, Yesterday]. Both done.
            expect(calculateStreak([today, yesterday], 'daily', [todayIdx, yesterdayIdx])).toBe(2);

            // Case: Target Days = [Today, DayBefore]. Yesterday is NOT a target. 
            // Done: Today, DayBefore.
            // Streak should be 2. (Today=1, Yesterday=SimulatedSkip, DayBefore=1)
            expect(calculateStreak([today, dayBeforeYesterday], 'daily', [todayIdx, dayBeforeIdx])).toBe(2);
        });
    });

    describe('Weekly Habits', () => {
        // Need to mock dates relative to ISO weeks.

        // Helper: generate dates for same week
        const dCurrent1 = today;

        const dLastWeek1 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        const dLastWeek2 = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];

        it('counts 1 if target met this week', () => {
            // Target 2
            expect(calculateStreak([dCurrent1, dCurrent1], 'weekly', [], 2)).toBe(1);
        });

        it('counts 0 if target NOT met this week', () => {
            expect(calculateStreak([dCurrent1], 'weekly', [], 2)).toBe(0);
        });

        it('counts 1 if current week NOT met, but Last Week WAS met', () => {
            // This is critical behavior: Streak shouldn't reset just because the new week started.
            expect(calculateStreak([dLastWeek1, dLastWeek2], 'weekly', [], 2)).toBe(1);
        });

        it('sums consecutive weeks', () => {
            // Last week met (2 counts) AND This week met (2 counts)
            const completions = [dLastWeek1, dLastWeek2, dCurrent1, dCurrent1];
            expect(calculateStreak(completions, 'weekly', [], 2)).toBe(2);
        });
    });

    describe('Anytime Habits', () => {
        it('always returns 0', () => {
            expect(calculateStreak([today, yesterday], 'anytime')).toBe(0);
        });
    });
});
