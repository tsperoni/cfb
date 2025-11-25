import { useState, useEffect } from 'react';
import { getTeams, Team } from '../api/cfb';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'cfb_teams_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useTeamLogos = () => {
    const [logos, setLogos] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTeams = async () => {
            try {
                // Check cache first
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { timestamp, data } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setLogos(data);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch from API
                const teams = await getTeams();
                const logoMap: Record<string, string> = {};

                teams.forEach((team) => {
                    if (team.logos && team.logos.length > 0) {
                        logoMap[team.school] = team.logos[0];
                    }
                });

                setLogos(logoMap);

                // Cache the result
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: logoMap
                }));

            } catch (error) {
                console.error('Error loading team logos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTeams();
    }, []);

    const getLogo = (teamName: string) => {
        return logos[teamName] || null;
    };

    return { getLogo, loading };
};
