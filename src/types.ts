export interface BettingLine {
    provider: string;
    spread: number;
    formattedSpread: string;
    spreadOpen?: number;
    overUnder?: number;
    overUnderOpen?: number;
}

export interface Game {
    id: number;
    season: number;
    week: number;
    seasonType: string;
    startDate: string;
    homeTeam: string;
    homeConference?: string;
    homeScore?: number;
    awayTeam: string;
    awayConference?: string;
    awayScore?: number;
    lines?: BettingLine[];
}
