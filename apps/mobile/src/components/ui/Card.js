import React from 'react';
import { View, StyleSheet } from 'react-native';
export function Card({ children, style }) {
    return (<View style={[styles.card, style]}>
      {children}
    </View>);
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.08)',
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
    },
});
