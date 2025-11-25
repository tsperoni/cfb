import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const NavBar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <View style={styles.sidebar}>
            <View style={styles.nav}>
                <Link href="/" asChild>
                    <TouchableOpacity style={StyleSheet.flatten([styles.navItem, isActive('/') && styles.navItemActive])}>
                        <Ionicons
                            name="american-football"
                            size={24}
                            color={isActive('/') ? '#3b82f6' : '#9ca3af'}
                        />
                    </TouchableOpacity>
                </Link>
                <Link href="/results" asChild>
                    <TouchableOpacity style={StyleSheet.flatten([styles.navItem, isActive('/results') && styles.navItemActive])}>
                        <Ionicons
                            name="list"
                            size={24}
                            color={isActive('/results') ? '#3b82f6' : '#9ca3af'}
                        />
                    </TouchableOpacity>
                </Link>
                <Link href="/stats" asChild>
                    <TouchableOpacity style={StyleSheet.flatten([styles.navItem, isActive('/stats') && styles.navItemActive])}>
                        <Ionicons
                            name="stats-chart"
                            size={24}
                            color={isActive('/stats') ? '#3b82f6' : '#9ca3af'}
                        />
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: 60,
        backgroundColor: '#ffffff',
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
        paddingTop: 50, // Safe area
        alignItems: 'center',
        zIndex: 10,
    },
    nav: {
        flexDirection: 'column',
        gap: 24,
        alignItems: 'center',
        width: '100%',
    },
    navItem: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    navItemActive: {
        backgroundColor: '#eff6ff', // Light blue background for active state
    },
});
