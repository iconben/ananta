import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { ProgressBar } from './ui/ProgressBar';
import { fmtN } from '@ananta/utils';
export function PracticeBreakdown({ practices, latestBucket, prevBucket, maxVal, }) {
    return (<View style={styles.container}>
      {practices.map((p) => {
            const cur = latestBucket?.totals[p.id] || 0;
            const prev = prevBucket?.totals[p.id] || 0;
            const delta = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;
            if (!cur && !prev)
                return null;
            return (<View key={p.id} style={styles.row}>
            {/* Icon */}
            <View style={[
                    styles.iconWrap,
                    { backgroundColor: p.color + '18', borderColor: p.color + '30' },
                ]}>
              <Text style={styles.icon}>{p.icon}</Text>
            </View>

            {/* Name + progress bar */}
            <View style={styles.middle}>
              <Text style={styles.practiceName}>{p.name}</Text>
              <ProgressBar progress={maxVal > 0 ? cur / maxVal : 0} color={p.color}/>
            </View>

            {/* Count + delta */}
            <View style={styles.countWrap}>
              <Text style={[styles.count, { color: p.color }]}>
                {fmtN(cur)}
              </Text>
              <Text style={styles.unit}>{p.unit}</Text>
              {delta !== null && (<Text style={[
                        styles.delta,
                        { color: delta >= 0 ? COLORS.success : '#f87171' },
                    ]}>
                  {delta >= 0 ? '↑' : '↓'}
                  {Math.abs(delta)}%
                </Text>)}
            </View>
          </View>);
        })}
    </View>);
}
const styles = StyleSheet.create({
    container: {
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,.05)',
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    icon: {
        fontSize: 17,
    },
    middle: {
        flex: 1,
    },
    practiceName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    countWrap: {
        alignItems: 'flex-end',
        flexShrink: 0,
        minWidth: 52,
    },
    count: {
        fontSize: 15,
        fontWeight: '700',
    },
    unit: {
        fontSize: 9,
        color: COLORS.textMuted,
        marginTop: 1,
    },
    delta: {
        fontSize: 9,
        marginTop: 1,
    },
});
