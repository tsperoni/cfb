import { Game } from '../types';

export const calculateResult = (game: Game, pick: 'home' | 'away', spread: number): 'win' | 'loss' | 'push' | 'pending' => {
    if (game.homeScore === undefined || game.awayScore === undefined) return 'pending';

    // Spread is usually for the home team in the data.
    // If spread is -13.5, Home needs to win by 14.
    // Score diff = Home - Away.
    // Adjusted diff = Score diff + spread.

    const scoreDiff = game.homeScore - game.awayScore;
    const adjustedDiff = scoreDiff + spread;

    if (pick === 'home') {
        if (adjustedDiff > 0) return 'win';
        if (adjustedDiff < 0) return 'loss';
        return 'push';
    } else {
        // Pick away. Away covers if Home fails to cover.
        if (adjustedDiff < 0) return 'win';
        if (adjustedDiff > 0) return 'loss';
        return 'push';
    }
};
