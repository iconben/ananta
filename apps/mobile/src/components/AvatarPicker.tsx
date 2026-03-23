import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AVATAR_OPTIONS = ['普', '慧', '觉', '莲', '净', '法', '明', '空', '圆', '寂', '定', '悟', '忍', '智', '仁', '慈'];

interface AvatarPickerProps {
  value: string;
  onChange: (val: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <View style={styles.grid}>
      {AVATAR_OPTIONS.map((a) => {
        const active = value === a;
        return (
          <TouchableOpacity
            key={a}
            style={[styles.item, active ? styles.itemActive : styles.itemInactive]}
            onPress={() => onChange(a)}
            activeOpacity={0.7}
          >
            <Text style={[styles.char, active ? styles.charActive : styles.charInactive]}>{a}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  item: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  itemActive: {
    backgroundColor: 'rgba(240,192,64,.3)',
    borderColor: 'rgba(240,192,64,.6)',
  },
  itemInactive: {
    backgroundColor: 'rgba(255,255,255,.07)',
    borderColor: 'rgba(255,255,255,.1)',
  },
  char: {
    fontSize: 13,
    fontWeight: 700,
  },
  charActive: {
    color: '#f0c040',
  },
  charInactive: {
    color: 'rgba(255,255,255,.5)',
  },
});
