import { useMemo } from 'react';
import { usePicks } from '../context/PicksContext';

// Calculate record across all picks in storage
// This aggregates wins/losses across ALL games the user has ever made picks on
export const useAggregateRecord = (scope: 'week' | 'year' | 'all', year?: number, week?: number) => {
    const { picks, gameResults } = usePicks();

    return useMemo(() => {
        let wins = 0;
        let losses = 0;
        let pushes = 0;

        // gameResults should be a map of gameId -> {result: 'win'|'loss'|'push', year, week}
        // For now, we'll need to store this info when picks are made
        Object.entries(gameResults || {}).forEach(([gameId, result]) => {
            // Filter based on scope
            if (scope === 'week' && (result.year !== year || result.week !== week)) {
                return;
            }
            if (scope === 'year' && result.year !== year) {
                return;
            }
            // 'all' scope includes everything

            if (result.outcome === 'win') wins++;
            if (result.outcome === 'loss') losses++;
            if (result.outcome === 'push') pushes++;
        });

        return { wins, losses, pushes };
    }, [picks, gameResults, scope, year, week]);
};
