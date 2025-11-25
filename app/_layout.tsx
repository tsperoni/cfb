import '../global.css';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PicksProvider } from '../src/context/PicksContext';
import { NavBar } from '../src/components/NavBar';
import { View, StyleSheet } from 'react-native';

export default function Layout() {
    return (
        <SafeAreaProvider>
            <PicksProvider>
                <View style={styles.container}>
                    <NavBar />
                    <View style={styles.content}>
                        <Slot />
                    </View>
                </View>
            </PicksProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row', // Side-by-side layout
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
    },
});
