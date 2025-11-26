import axios from 'axios';
import { Game } from '../types';

const API_BASE_URL = 'https://api.collegefootballdata.com';
//const API_KEY = '68I0+/AR/fEzNdjuXL+olpy7IKkDyLLp77arOlSElO09oR/kP3PCFgmEmCIrpRPF'; // User needs to provide this
const API_KEY = 'fWQmfLfJLMKtJYTmsO/YEAbedhB7Eq2Pb7wwJe4cTZgAqNaQFTrjAD/oLXsOcKQu'; // tsperoni@acadiangroup.com

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
    },
});

export const getGames = async (year: number, week?: number, seasonType: string = 'regular'): Promise<Game[]> => {
    try {
        // Fetch both games (schedule/scores) and lines (odds)
        const [gamesResponse, linesResponse] = await Promise.all([
            client.get('/games', {
                params: { year, week, seasonType }
            }),
            client.get('/lines', {
                params: { year, week, seasonType }
            })
        ]);

        const gamesData = gamesResponse.data;
        const linesData = linesResponse.data;

        // Create a map of lines by game ID for faster lookup
        const linesMap = new Map();
        linesData.forEach((game: any) => {
            linesMap.set(game.id, game.lines);
        });

        // Map games to our Game interface and attach lines
        return gamesData.map((game: any) => ({
            id: game.id,
            season: game.season,
            week: game.week,
            seasonType: game.seasonType,
            startDate: game.startDate,
            homeTeam: game.homeTeam,
            homeConference: game.homeConference,
            homeScore: game.homePoints,
            awayTeam: game.awayTeam,
            awayConference: game.awayConference,
            awayScore: game.awayPoints,
            lines: linesMap.get(game.id) || []
        }));

    } catch (error) {
        console.error('Error fetching games:', error);
        // Return mock data if API fails (likely due to missing key)
        return MOCK_GAMES;
    }
};

export interface Team {
    id: number;
    school: string;
    mascot: string;
    abbreviation: string;
    alt_name_1: string;
    alt_name_2: string;
    alt_name_3: string;
    conference: string;
    division: string;
    color: string;
    alt_color: string;
    logos: string[];
    twitter: string;
    location: {
        venue_id: number;
        name: string;
        city: string;
        state: string;
        zip: string;
        country_code: string;
        timezone: string;
        latitude: number;
        longitude: number;
        elevation: string;
        capacity: number;
        year_constructed: number;
        grass: boolean;
        dome: boolean;
    };
}

export interface CalendarWeek {
    season: number;
    week: number;
    seasonType: string;
    startDate: string;
    endDate: string;
    firstGameStart: string;
    lastGameStart: string;
}

export const getCalendar = async (year: number): Promise<CalendarWeek[]> => {
    try {
        const response = await client.get('/calendar', {
            params: { year }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching calendar:', error);
        return [];
    }
};

export const getTeams = async (): Promise<Team[]> => {
    try {
        const response = await client.get('/teams');
        return response.data;
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
};

const MOCK_GAMES: Game[] = [
    {
        id: 1,
        season: 2024,
        week: 1,
        seasonType: 'regular',
        startDate: '2024-08-31T12:00:00.000Z',
        homeTeam: 'Georgia',
        homeConference: 'SEC',
        awayTeam: 'Clemson',
        awayConference: 'ACC',
        lines: [
            {
                provider: 'Consensus',
                spread: -13.5,
                formattedSpread: 'Georgia -13.5',
                overUnder: 48.5,
            },
        ],
    },
    {
        id: 2,
        season: 2024,
        week: 1,
        seasonType: 'regular',
        startDate: '2024-08-31T15:30:00.000Z',
        homeTeam: 'Florida',
        homeConference: 'SEC',
        awayTeam: 'Miami',
        awayConference: 'ACC',
        lines: [
            {
                provider: 'Consensus',
                spread: 2.5,
                formattedSpread: 'Florida +2.5',
                overUnder: 54.0,
            },
        ],
    },
    {
        id: 3,
        season: 2024,
        week: 1,
        seasonType: 'regular',
        startDate: '2024-08-31T19:30:00.000Z',
        homeTeam: 'Texas A&M',
        homeConference: 'SEC',
        awayTeam: 'Notre Dame',
        awayConference: 'Independent',
        lines: [
            {
                provider: 'Consensus',
                spread: -2.5,
                formattedSpread: 'Texas A&M -2.5',
                overUnder: 49.5,
            },
        ],
    },
];
