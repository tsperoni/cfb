// import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game } from '../types';

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
    timestamp: number;
    data: Game[];
}

export const cacheGames = async (year: number, week: number | undefined, games: Game[]) => {
    return;
    /*
    try {
        const key = `games_${year}_${week ?? 'all'}`;
        const cacheData: CachedData = {
            timestamp: Date.now(),
            data: games
        };
        await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error caching games:', error);
    }
    */
};

export const getCachedGames = async (year: number, week: number | undefined): Promise<Game[] | null> => {
    return null;
    /*
    try {
        const key = `games_${year}_${week ?? 'all'}`;
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
            const parsed: CachedData = JSON.parse(cached);
            // Check expiry (optional, currently relying on manual refresh)
            // if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
                return parsed.data;
            // }
        }
        return null;
    } catch (error) {
        console.error('Error retrieving cached games:', error);
        return null;
    }
    */
};
