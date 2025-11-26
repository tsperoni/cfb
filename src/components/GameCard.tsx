import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Game } from '../types';
import { getTeamLogo } from '../utils/teamLogos';

export interface SmartPickData {
    homeDom: number;
    awayDom: number;
    recommendation: string;
    delta: number;
}

interface GameCardProps {
    game: Game;
    onPickTeam: (team: 'home' | 'away', spread: number) => void;
    pickedTeam?: 'home' | 'away';
    getLogo?: (teamName: string) => string | null;
    smartPick?: SmartPickData;
}

export const GameCard = ({ game, onPickTeam, pickedTeam, getLogo, smartPick }: GameCardProps) => {
    const line = game.lines?.[0];
    const spread = line?.spread || 0;

    const formatSpread = (val: number) => (val > 0 ? `+${val}` : val);
    const homeSpreadDisplay = formatSpread(spread);
    const awaySpreadDisplay = formatSpread(-spread);

    const gameDate = new Date(game.startDate);
    const isValidDate = !isNaN(gameDate.getTime());
    const dateStr = isValidDate ? gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
    const timeStr = isValidDate ? gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

    const awayLogo = getLogo ? (getLogo(game.awayTeam) || getTeamLogo(game.awayTeam)) : getTeamLogo(game.awayTeam);
    const homeLogo = getLogo ? (getLogo(game.homeTeam) || getTeamLogo(game.homeTeam)) : getTeamLogo(game.homeTeam);

    const isFinal = typeof game.homeScore === 'number' && typeof game.awayScore === 'number';

    const getPickResult = (team: 'home' | 'away') => {
        if (!isFinal || !pickedTeam || pickedTeam !== team) return null;

        const homeScore = game.homeScore!;
        const awayScore = game.awayScore!;
        const margin = homeScore - awayScore;

        if (team === 'home') {
            if (margin + spread === 0) return 'push';
            return (margin + spread > 0) ? 'win' : 'loss';
        } else {
            if (margin + spread === 0) return 'push';
            return (margin + spread < 0) ? 'win' : 'loss';
        }
    };

    const homeResult = getPickResult('home');
    const awayResult = getPickResult('away');

    // Determine if we should show a badge for a team
    const showAwayBadge = smartPick && (smartPick.recommendation.includes('Away'));
    const showHomeBadge = smartPick && (smartPick.recommendation.includes('Home'));

    const getBadgeColor = (rec: string) => {
        if (rec.includes('Strong')) return '#059669';
        if (rec.includes('Lean')) return '#3b82f6';
        return '#6b7280';
    };

    return (
        <View style={styles.card}>
            {/* Header with date/time */}
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    {isFinal ? (
                        <View style={styles.finalBadge}>
                            <Text style={styles.finalText}>FINAL</Text>
                        </View>
                    ) : (
                        <View style={styles.upcomingBadge}>
                            <Text style={styles.upcomingText}>UPCOMING</Text>
                        </View>
                    )}
                    <Text style={styles.dateText}>{dateStr} • {timeStr}</Text>
                </View>
                {line?.provider && <Text style={styles.providerText}>{line.provider}</Text>}
            </View>

            {/* Game matchup */}
            <View style={styles.matchupContainer}>
                {/* Away Team */}
                <TouchableOpacity
                    style={[
                        styles.teamContainer,
                        pickedTeam === 'away' && styles.teamContainerSelected,
                        awayResult === 'win' && styles.teamContainerWin,
                        awayResult === 'loss' && styles.teamContainerLoss
                    ]}
                    onPress={() => onPickTeam('away', -spread)}
                >
                    <View style={styles.logoWrapper}>
                        {awayLogo ? (
                            <Image
                                source={{ uri: awayLogo }}
                                style={styles.teamLogo}
                            />
                        ) : null}
                    </View>
                    <View style={styles.teamInfo}>
                        <Text style={styles.teamName}>{game.awayTeam}</Text>
                        <Text style={styles.conferenceText}>{game.awayConference}</Text>
                        {smartPick && (
                            <Text style={styles.domText}>DOM: {smartPick.awayDom.toFixed(1)}</Text>
                        )}
                        {showAwayBadge && smartPick && (
                            <View style={[styles.smartBadge, { backgroundColor: getBadgeColor(smartPick.recommendation) }]}>
                                <Text style={styles.smartBadgeText}>
                                    {smartPick.recommendation.toUpperCase()} (Delta: {Math.abs(smartPick.delta).toFixed(1)})
                                </Text>
                            </View>
                        )}
                    </View>

                    {isFinal && (
                        <Text style={styles.scoreText}>{game.awayScore}</Text>
                    )}

                    <View style={[
                        styles.spreadBadge,
                        pickedTeam === 'away' && styles.spreadBadgeSelected
                    ]}>
                        <Text style={[
                            styles.spreadText,
                            pickedTeam === 'away' && styles.spreadTextSelected
                        ]}>{awaySpreadDisplay}</Text>
                    </View>

                    {awayResult && (
                        <View style={styles.resultIconWrapper}>
                            <Text style={styles.resultIcon}>
                                {awayResult === 'win' ? '✅' : awayResult === 'loss' ? '❌' : 'P'}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* VS Divider */}
                <View style={styles.divider}>
                    <Text style={styles.vsText}>@</Text>
                </View>

                {/* Home Team */}
                <TouchableOpacity
                    style={[
                        styles.teamContainer,
                        pickedTeam === 'home' && styles.teamContainerSelected,
                        homeResult === 'win' && styles.teamContainerWin,
                        homeResult === 'loss' && styles.teamContainerLoss
                    ]}
                    onPress={() => onPickTeam('home', spread)}
                >
                    <View style={styles.logoWrapper}>
                        {homeLogo ? (
                            <Image
                                source={{ uri: homeLogo }}
                                style={styles.teamLogo}
                            />
                        ) : null}
                    </View>
                    <View style={styles.teamInfo}>
                        <Text style={styles.teamName}>{game.homeTeam}</Text>
                        <Text style={styles.conferenceText}>{game.homeConference}</Text>
                        {smartPick && (
                            <Text style={styles.domText}>DOM: {smartPick.homeDom.toFixed(1)}</Text>
                        )}
                        {showHomeBadge && smartPick && (
                            <View style={[styles.smartBadge, { backgroundColor: getBadgeColor(smartPick.recommendation) }]}>
                                <Text style={styles.smartBadgeText}>
                                    {smartPick.recommendation.toUpperCase()} (Delta: {Math.abs(smartPick.delta).toFixed(1)})
                                </Text>
                            </View>
                        )}
                    </View>

                    {isFinal && (
                        <Text style={styles.scoreText}>{game.homeScore}</Text>
                    )}

                    <View style={[
                        styles.spreadBadge,
                        pickedTeam === 'home' && styles.spreadBadgeSelected
                    ]}>
                        <Text style={[
                            styles.spreadText,
                            pickedTeam === 'home' && styles.spreadTextSelected
                        ]}>{homeSpreadDisplay}</Text>
                    </View>

                    {homeResult && (
                        <View style={styles.resultIconWrapper}>
                            <Text style={styles.resultIcon}>
                                {homeResult === 'win' ? '✅' : homeResult === 'loss' ? '❌' : 'P'}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Over/Under if available */}
            {line?.overUnder && (
                <View style={styles.footer}>
                    <Text style={styles.ouText}>O/U: {line.overUnder}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    upcomingBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    upcomingText: {
        color: '#1e40af',
        fontSize: 10,
        fontWeight: '700',
    },
    finalBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    finalText: {
        color: '#4b5563',
        fontSize: 10,
        fontWeight: '700',
    },
    dateText: {
        color: '#6b7280',
        fontSize: 13,
        fontWeight: '500',
    },
    providerText: {
        color: '#9ca3af',
        fontSize: 12,
    },
    matchupContainer: {
        padding: 16,
    },
    teamContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingLeft: 12,
        paddingRight: 40,
        borderRadius: 6,
        backgroundColor: '#f9fafb',
        marginBottom: 8,
    },
    teamContainerSelected: {
        backgroundColor: '#dbeafe',
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    logoWrapper: {
        width: 52,
        marginRight: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    teamLogo: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        color: '#1f2937',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    conferenceText: {
        color: '#6b7280',
        fontSize: 12,
    },
    spreadBadge: {
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        minWidth: 50,
        alignItems: 'center',
    },
    spreadBadgeSelected: {
        backgroundColor: '#3b82f6',
    },
    spreadText: {
        color: '#374151',
        fontSize: 15,
        fontWeight: '600',
    },
    spreadTextSelected: {
        color: '#ffffff',
    },
    divider: {
        alignItems: 'center',
        marginVertical: 4,
    },
    vsText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 8,
    },
    teamContainerWin: {
        backgroundColor: '#d1fae5',
        borderColor: '#059669',
        borderWidth: 1,
    },
    teamContainerLoss: {
        backgroundColor: '#fee2e2',
        borderColor: '#dc2626',
        borderWidth: 1,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 12,
    },
    resultIconWrapper: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: 24,
    },
    resultIcon: {
        fontSize: 16,
    },
    ouText: {
        color: '#6b7280',
        fontSize: 13,
    },
    domText: {
        fontSize: 11,
        color: '#3b82f6',
        fontWeight: '600',
        marginTop: 2,
    },
    smartBadge: {
        marginTop: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    smartBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
