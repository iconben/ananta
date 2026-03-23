import React from 'react';
import { Switch, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
export function Toggle({ label, value, onValueChange }) {
    return (<View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: 'rgba(255,255,255,.1)', true: COLORS.gold + '55' }} thumbColor={value ? COLORS.gold : 'rgba(255,255,255,.3)'}/>
    </View>);
}
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    label: {
        fontSize: 14,
        color: '#e5dcc8',
    },
});
