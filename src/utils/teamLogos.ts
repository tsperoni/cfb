// Helper to get team logo URLs from ESPN's logo CDN
// ESPN hosts college team logos at predictable URLs

const TEAM_LOGO_MAP: Record<string, string> = {
    // SEC
    'Alabama': 'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png',
    'Georgia': 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png',
    'LSU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png',
    'Texas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/251.png',
    'Texas A&M': 'https://a.espncdn.com/i/teamlogos/ncaa/500/245.png',
    'Florida': 'https://a.espncdn.com/i/teamlogos/ncaa/500/57.png',
    'Tennessee': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png',
    'Ole Miss': 'https://a.espncdn.com/i/teamlogos/ncaa/500/145.png',
    'Missouri': 'https://a.espncdn.com/i/teamlogos/ncaa/500/142.png',
    'South Carolina': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png',
    'Kentucky': 'https://a.espncdn.com/i/teamlogos/ncaa/500/96.png',
    'Vanderbilt': 'https://a.espncdn.com/i/teamlogos/ncaa/500/238.png',
    'Arkansas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/8.png',
    'Mississippi State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/344.png',
    'Auburn': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png',
    'Oklahoma': 'https://a.espncdn.com/i/teamlogos/ncaa/500/201.png',

    // Big Ten
    'Ohio State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png',
    'Michigan': 'https://a.espncdn.com/i/teamlogos/ncaa/500/130.png',
    'Penn State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/213.png',
    'Oregon': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png',
    'USC': 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png',
    'Iowa': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png',
    'Wisconsin': 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png',
    'Nebraska': 'https://a.espncdn.com/i/teamlogos/ncaa/500/158.png',
    'Michigan State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png',
    'Minnesota': 'https://a.espncdn.com/i/teamlogos/ncaa/500/135.png',
    'Maryland': 'https://a.espncdn.com/i/teamlogos/ncaa/500/120.png',
    'Rutgers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/164.png',
    'Indiana': 'https://a.espncdn.com/i/teamlogos/ncaa/500/84.png',
    'Purdue': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png',
    'Northwestern': 'https://a.espncdn.com/i/teamlogos/ncaa/500/77.png',
    'Illinois': 'https://a.espncdn.com/i/teamlogos/ncaa/500/356.png',
    'Washington': 'https://a.espncdn.com/i/teamlogos/ncaa/500/264.png',
    'UCLA': 'https://a.espncdn.com/i/teamlogos/ncaa/500/26.png',

    // ACC
    'Clemson': 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png',
    'Florida State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/52.png',
    'Miami': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png',
    'North Carolina': 'https://a.espncdn.com/i/teamlogos/ncaa/500/153.png',
    'NC State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/152.png',
    'Louisville': 'https://a.espncdn.com/i/teamlogos/ncaa/500/97.png',
    'Virginia Tech': 'https://a.espncdn.com/i/teamlogos/ncaa/500/259.png',
    'Virginia': 'https://a.espncdn.com/i/teamlogos/ncaa/500/258.png',
    'Pittsburgh': 'https://a.espncdn.com/i/teamlogos/ncaa/500/221.png',
    'Duke': 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
    'Syracuse': 'https://a.espncdn.com/i/teamlogos/ncaa/500/183.png',
    'Boston College': 'https://a.espncdn.com/i/teamlogos/ncaa/500/103.png',
    'Wake Forest': 'https://a.espncdn.com/i/teamlogos/ncaa/500/154.png',
    'Georgia Tech': 'https://a.espncdn.com/i/teamlogos/ncaa/500/59.png',
    'California': 'https://a.espncdn.com/i/teamlogos/ncaa/500/25.png',
    'Stanford': 'https://a.espncdn.com/i/teamlogos/ncaa/500/24.png',
    'SMU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png',

    // Big 12
    'Baylor': 'https://a.espncdn.com/i/teamlogos/ncaa/500/239.png',
    'TCU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png',
    'Oklahoma State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/197.png',
    'Kansas State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2306.png',
    'Kansas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png',
    'Texas Tech': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png',
    'West Virginia': 'https://a.espncdn.com/i/teamlogos/ncaa/500/277.png',
    'Iowa State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/66.png',
    'BYU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/252.png',
    'Utah': 'https://a.espncdn.com/i/teamlogos/ncaa/500/254.png',
    'Colorado': 'https://a.espncdn.com/i/teamlogos/ncaa/500/38.png',
    'Arizona': 'https://a.espncdn.com/i/teamlogos/ncaa/500/12.png',
    'Arizona State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/9.png',
    'UCF': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png',
    'Cincinnati': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png',
    'Houston': 'https://a.espncdn.com/i/teamlogos/ncaa/500/248.png',

    // Pac-12 (remaining)
    'Washington State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/265.png',
    'Oregon State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/204.png',

    // Independent
    'Notre Dame': 'https://a.espncdn.com/i/teamlogos/ncaa/500/87.png',
    'Army': 'https://a.espncdn.com/i/teamlogos/ncaa/500/349.png',
    'Navy': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2426.png',
    'UMass': 'https://a.espncdn.com/i/teamlogos/ncaa/500/113.png',

    // Other notable teams
    'Boise State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png',
    'San Diego State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/21.png',
    'Fresno State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/278.png',
    'Memphis': 'https://a.espncdn.com/i/teamlogos/ncaa/500/235.png',
    'Tulane': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png',
    'Liberty': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png',
    'App State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png',
    'James Madison': 'https://a.espncdn.com/i/teamlogos/ncaa/500/256.png',
};

// Default - return empty string for teams not in the map
// Component will handle displaying initials or hiding the logo
const DEFAULT_LOGO = '';

export const getTeamLogo = (teamName: string): string => {
    return TEAM_LOGO_MAP[teamName] || DEFAULT_LOGO;
};
