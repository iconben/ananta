import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
}

export function ProgressBar({ progress, color = COLORS.gold }: ProgressBarProps) {
  return (
    <View style={styles.bar}>
      <View
        style={[
          styles.fill,
          { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,.07)',
    overflow: 'hidden',
    marginTop: 8,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
});
