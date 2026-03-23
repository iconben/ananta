import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '../theme';

interface PillProps {
  label: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Pill({ label, active, color = COLORS.gold, onPress, style }: PillProps) {
  const content = (
    <Text style={[
      styles.pill,
      active && { color, borderColor: color + '55', backgroundColor: color + '18' },
      !active && styles.pillInactive,
      style,
    ]}>
      {label}
    </Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pill: {
    padding: '5px 11px',
    borderRadius: 20,
    border: '1px solid',
    fontSize: 12,
    overflow: 'hidden',
  },
  pillInactive: {
    color: 'rgba(255,255,255,0.4)',
    borderColor: 'rgba(255,255,255,.1)',
    backgroundColor: 'rgba(255,255,255,.04)',
  },
});
