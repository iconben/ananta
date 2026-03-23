import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function RootLayout() {
    const [loading, setLoading] = useState(true);
    const [onboarded, setOnboarded] = useState(false);
    useEffect(() => {
        AsyncStorage.getItem('onboarding-complete').then((value) => {
            setOnboarded(value === 'true');
            setLoading(false);
        });
    }, []);
    if (loading) {
        return (<View style={styles.loading}>
        <ActivityIndicator size="large" color="#f0c040"/>
        <StatusBar style="light"/>
      </View>);
    }
    return (<>
      <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#080c18' },
        }} initialRouteName={onboarded ? '(tabs)' : 'onboarding'}>
        <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        <Stack.Screen name="practice/[id]"/>
        <Stack.Screen name="campaign/[id]"/>
        <Stack.Screen name="settings"/>
      </Stack>
      <StatusBar style="light"/>
    </>);
}
const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: '#080c18',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
