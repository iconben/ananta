import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function Button({ title, variant = 'secondary', onPress, style, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, variant === 'primary' && styles.primaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 12,
    borderRadius: 10,
    border: 'none',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.gold,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,.07)',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5dcc8',
  },
  primaryText: {
    color: '#080c18',
  },
});

import { COLORS } from '../theme';
