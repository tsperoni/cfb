import { useState, useEffect } from 'react';
import { Game } from '../types';
import { getGames } from '../api/cfb';
import { useSeasonStats, TeamStats } from './useSeasonStats';

export interface SmartPick {
    game: Game;
    homeTeamStats: TeamStats | undefined;
    awayTeamStats: TeamStats | undefined;
    delta: number;
    recommendation: 'Strong Home' | 'Lean Home' | 'Toss Up' | 'Lean Away' | 'Strong Away';
    confidence: number; // 0-100 score based on delta
}

export const useSmartPicks = (year: number, week: number) => {
    const [picks, setPicks] = useState<SmartPick[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Get stats through the PREVIOUS week to analyze upcoming matchups
    // If week is 1, we have no stats, so we can't really predict.
    const statsWeek = week > 1 ? week - 1 : undefined;
    const { stats, loading: statsLoading } = useSeasonStats(year, statsWeek);

    useEffect(() => {
        const analyzeMatchups = async () => {
            if (statsLoading) return;
            setLoading(true);

            try {
                // 2. Get games for the CURRENT week
                const games = await getGames(year, week, 'regular');

                // Map stats for quick lookup
                const statsMap = new Map<string, TeamStats>();
                stats.forEach(s => statsMap.set(s.team, s));

                const smartPicks: SmartPick[] = games.map(game => {
                    // Skip games with no lines if we want, but we might want to predict anyway?
                    // For now, let's keep all games but we need lines to know the spread context if we were doing advanced stuff.
                    // But Dominance Score is independent of the current spread (it tracks past performance).

                    const homeStats = statsMap.get(game.homeTeam);
                    const awayStats = statsMap.get(game.awayTeam);

                    if (!homeStats || !awayStats) {
                        return {
                            game,
                            homeTeamStats: homeStats,
                            awayTeamStats: awayStats,
                            delta: 0,
                            recommendation: 'Toss Up',
                            confidence: 0
                        };
                    }

                    // Calculate Delta: Home - Away
                    // Positive delta means Home is more dominant
                    const delta = homeStats.dominanceScore - awayStats.dominanceScore;

                    let recommendation: SmartPick['recommendation'] = 'Toss Up';
                    if (delta >= 15) recommendation = 'Strong Home';
                    else if (delta >= 5) recommendation = 'Lean Home';
                    else if (delta <= -15) recommendation = 'Strong Away';
                    else if (delta <= -5) recommendation = 'Lean Away';

                    return {
                        game,
                        homeTeamStats: homeStats,
                        awayTeamStats: awayStats,
                        delta,
                        recommendation,
                        confidence: Math.min(Math.abs(delta), 100)
                    };
                });

                // Sort by confidence (highest delta first)
                smartPicks.sort((a, b) => b.confidence - a.confidence);

                setPicks(smartPicks);
            } catch (error) {
                console.error("Error generating smart picks:", error);
            } finally {
                setLoading(false);
            }
        };

        analyzeMatchups();
    }, [year, week, stats, statsLoading]);

    return { picks, loading: loading || statsLoading };
};
