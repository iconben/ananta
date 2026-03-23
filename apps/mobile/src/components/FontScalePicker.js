import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
const FONT_SCALES = [
    { val: 0.85, label: '小' },
    { val: 1.0, label: '中' },
    { val: 1.2, label: '大' },
    { val: 1.45, label: '超大' },
];
export function FontScalePicker({ value, onChange }) {
    return (<View style={styles.container}>
      <View style={styles.pills}>
        {FONT_SCALES.map((f) => {
            const active = Math.abs(value - f.val) < 0.01;
            return (<TouchableOpacity key={f.val} style={[
                    styles.pill,
                    active ? styles.pillActive : styles.pillInactive,
                ]} onPress={() => onChange(f.val)} activeOpacity={0.7}>
              <Text style={[
                    styles.pillText,
                    { fontSize: f.val * 16 },
                    active ? styles.textActive : styles.textInactive,
                ]}>
                字
              </Text>
              <Text style={[
                    styles.pillLabel,
                    active ? styles.labelActive : styles.labelInactive,
                ]}>
                {f.label}
              </Text>
            </TouchableOpacity>);
        })}
      </View>
      <Text style={styles.preview}>
        预览：{FONT_SCALES.find((f) => Math.abs(value - f.val) < 0.01)?.label} · 当前字号{' '}
        {Math.round(14 * value)}px
      </Text>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    pills: {
        flexDirection: 'row',
        gap: 6,
    },
    pill: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    pillActive: {
        backgroundColor: 'rgba(240,192,64,.15)',
        borderColor: 'rgba(240,192,64,.4)',
    },
    pillInactive: {
        backgroundColor: 'rgba(255,255,255,.04)',
        borderColor: 'rgba(255,255,255,.08)',
    },
    pillText: {
        fontWeight: 700,
    },
    pillLabel: {
        fontSize: 10,
        marginTop: 4,
    },
    textActive: {
        color: COLORS.gold,
    },
    textInactive: {
        color: 'rgba(255,255,255,.5)',
    },
    labelActive: {
        color: COLORS.gold,
    },
    labelInactive: {
        color: 'rgba(255,255,255,.3)',
    },
    preview: {
        fontSize: 11,
        color: 'rgba(255,255,255,.25)',
        marginTop: 10,
        textAlign: 'center',
    },
});
