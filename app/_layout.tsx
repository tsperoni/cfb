import '../global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PicksProvider } from '../src/context/PicksContext';

export default function Layout() {
    return (
        <SafeAreaProvider>
            <PicksProvider>
                <Stack
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#121212',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                        contentStyle: {
                            backgroundColor: '#121212',
                        },
                    }}
                >
                    <Stack.Screen name="index" options={{ title: 'CFB Picks' }} />
                </Stack>
            </PicksProvider>
        </SafeAreaProvider>
    );
}
