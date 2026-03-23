import React from 'react';
import { Switch, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface ToggleProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ value, onValueChange }: ToggleProps) {
  return (
    <View style={styles.row}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,.1)', true: COLORS.gold + '55' }}
        thumbColor={value ? COLORS.gold : 'rgba(255,255,255,.3)'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
