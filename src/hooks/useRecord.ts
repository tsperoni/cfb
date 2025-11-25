import { useMemo } from 'react';
import { Game } from '../types';
import { calculateResult } from '../utils/scoring';

export const useRecord = (games: Game[], picks: Record<number, 'home' | 'away'>) => {
    return useMemo(() => {
        let wins = 0;
        let losses = 0;
        let pushes = 0;

        games.forEach(game => {
            const pick = picks[game.id];
            if (!pick) return;

            const spread = game.lines?.[0]?.spread || 0;
            const result = calculateResult(game, pick, spread);

            if (result === 'win') wins++;
            if (result === 'loss') losses++;
            if (result === 'push') pushes++;
        });

        return { wins, losses, pushes };
    }, [games, picks]);
};
