import { useState, useEffect, useCallback } from 'react';
import { Game } from '../types';
import { getGames, getCalendar } from '../api/cfb';
import { getCachedGames, cacheGames } from '../utils/storage';

export interface GameResult {
    week: number;
    opponent: string;
    result: 'win' | 'loss' | 'push';
    margin: number;
    spread: number;
    score: string;
    scoreDiff: number;
}

export interface TeamStats {
    team: string;
    wins: number;
    losses: number;
    pushes: number;
    totalMargin: number;
    avgMargin: number;
    games: number;
    winPct: number;
    dominanceScore: number;
    history: GameResult[];
}

export const useSeasonStats = (year: number, maxWeek?: number) => {
    const [stats, setStats] = useState<TeamStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async (forceRefresh = false) => {
        try {
            setLoading(true);

            let games: Game[] = [];
            let calendar: any[] = [];

            // Try cache for games first
            // if (!forceRefresh) {
            //     const cachedGames = await getCachedGames(year, undefined); // undefined week means 'all'
            //     if (cachedGames) {
            //         games = cachedGames;
            //     }
            // }

            // Fetch if no cache or forced refresh
            if (games.length === 0) {
                const [fetchedGames, fetchedCalendar] = await Promise.all([
                    getGames(year, undefined, 'regular'),
                    getCalendar(year)
                ]);
                games = fetchedGames;
                calendar = fetchedCalendar;

                // if (games.length > 0) {
                //     await cacheGames(year, undefined, games);
                // }
            } else {
                // If we used cached games, we still need calendar for date filtering
                calendar = await getCalendar(year);
            }

            // Determine the cutoff date based on maxWeek
            let cutoffDate: Date | null = null;
            if (maxWeek) {
                const targetWeek = calendar.find(w => w.week === maxWeek && w.seasonType === 'regular');
                if (targetWeek) {
                    cutoffDate = new Date(targetWeek.endDate);
                }
            }

            const teamStatsMap = new Map<string, {
                wins: number;
                losses: number;
                pushes: number;
                totalMargin: number;
                games: number;
                history: GameResult[];
            }>();

            const initTeam = (team: string) => {
                if (!teamStatsMap.has(team)) {
                    teamStatsMap.set(team, { wins: 0, losses: 0, pushes: 0, totalMargin: 0, games: 0, history: [] });
                }
            };

            games.forEach(game => {
                // Filter by date if cutoffDate is established
                if (cutoffDate && game.startDate) {
                    const gameDate = new Date(game.startDate);
                    if (gameDate > cutoffDate) return;
                } else if (maxWeek && game.week > maxWeek) {
                    // Fallback to week-based filtering if no calendar data or game date
                    return;
                }

                // Only process games with scores and lines
                if (typeof game.homeScore !== 'number' || typeof game.awayScore !== 'number' || !game.lines || game.lines.length === 0) {
                    return;
                }

                const line = game.lines[0];
                const spread = line.spread;

                // Skip if spread is missing
                if (typeof spread !== 'number') return;

                const homeTeam = game.homeTeam;
                const awayTeam = game.awayTeam;
                const homeScore = game.homeScore;
                const awayScore = game.awayScore;

                initTeam(homeTeam);
                initTeam(awayTeam);

                const homeStats = teamStatsMap.get(homeTeam)!;
                const awayStats = teamStatsMap.get(awayTeam)!;

                // Calculate margins relative to spread
                // Home Cover Margin = (HomeScore - AwayScore) + Spread
                const homeMargin = (homeScore - awayScore) + spread;
                const homeScoreDiff = homeScore - awayScore;

                // Away Cover Margin = (AwayScore - HomeScore) + (-spread)
                const awayMargin = (awayScore - homeScore) + (-spread);
                const awayScoreDiff = awayScore - homeScore;

                // Determine results
                let homeResult: 'win' | 'loss' | 'push' = 'push';
                if (homeMargin > 0) homeResult = 'win';
                else if (homeMargin < 0) homeResult = 'loss';

                let awayResult: 'win' | 'loss' | 'push' = 'push';
                if (awayMargin > 0) awayResult = 'win';
                else if (awayMargin < 0) awayResult = 'loss';

                // Update Home Stats
                homeStats.totalMargin += homeMargin;
                homeStats.games += 1;
                if (homeResult === 'win') homeStats.wins++;
                else if (homeResult === 'loss') homeStats.losses++;
                else homeStats.pushes++;

                homeStats.history.push({
                    week: game.week,
                    opponent: awayTeam,
                    result: homeResult,
                    margin: homeMargin,
                    spread: spread,
                    score: `${homeScore}-${awayScore}`,
                    scoreDiff: homeScoreDiff
                });

                // Update Away Stats
                awayStats.totalMargin += awayMargin;
                awayStats.games += 1;
                if (awayResult === 'win') awayStats.wins++;
                else if (awayResult === 'loss') awayStats.losses++;
                else awayStats.pushes++;

                awayStats.history.push({
                    week: game.week,
                    opponent: homeTeam,
                    result: awayResult,
                    margin: awayMargin,
                    spread: -spread,
                    score: `${awayScore}-${homeScore}`,
                    scoreDiff: awayScoreDiff
                });
            });

            const statsArray: TeamStats[] = [];
            teamStatsMap.forEach((data, team) => {
                const winPct = data.games > 0 ? ((data.wins + (data.pushes * 0.5)) / data.games) * 100 : 0;
                const avgMargin = data.games > 0 ? data.totalMargin / data.games : 0;
                // Dominance Score = Win% + Avg Margin
                const dominanceScore = winPct + avgMargin;

                // Sort history by week descending
                data.history.sort((a, b) => b.week - a.week);

                statsArray.push({
                    team,
                    wins: data.wins,
                    losses: data.losses,
                    pushes: data.pushes,
                    totalMargin: data.totalMargin,
                    avgMargin,
                    games: data.games,
                    winPct,
                    dominanceScore,
                    history: data.history
                });
            });

            // Sort by Dominance Score descending
            statsArray.sort((a, b) => b.dominanceScore - a.dominanceScore);

            setStats(statsArray);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    }, [year, maxWeek]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const refresh = () => fetchStats(true);

    return { stats, loading, error, refresh };
};
