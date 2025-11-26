import { useState, useEffect, useCallback } from 'react';
import { Game } from '../types';
import { getGames } from '../api/cfb';
import { getCachedGames, cacheGames } from '../utils/storage';

export const useGames = (year: number, week?: number) => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            // Try cache first if not forcing refresh
            // if (!forceRefresh) {
            //     const cached = await getCachedGames(year, week);
            //     if (cached) {
            //         setGames(cached);
            //         setLoading(false);
            //         return;
            //     }
            // }

            // Fetch from API
            const data = await getGames(year, week);
            setGames(data);

            // Cache the new data
            // if (data.length > 0) {
            //     await cacheGames(year, week, data);
            // }
        } catch (err) {
            setError('Failed to fetch games');
            // If API fails, try to fall back to cache even if we were refreshing
            // if (forceRefresh) {
            //     const cached = await getCachedGames(year, week);
            //     if (cached) {
            //         setGames(cached);
            //     }
            // }
        } finally {
            setLoading(false);
        }
    }, [year, week]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    const refresh = () => fetchGames(true);

    return { games, loading, error, refresh };
};
