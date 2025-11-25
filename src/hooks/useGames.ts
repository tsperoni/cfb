import { useState, useEffect } from 'react';
import { Game } from '../types';
import { getGames } from '../api/cfb';

export const useGames = (year: number, week?: number) => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                const data = await getGames(year, week);
                setGames(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch games');
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [year, week]);

    return { games, loading, error };
};
