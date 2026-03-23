import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { Practice } from '@ananta/types';

interface BucketData {
  label: string;
  totals: Record<string, number>;
}

interface StackedBarChartProps {
  bucketData: BucketData[];
  practices: Practice[];
  maxVal: number;
}

const CHART_HEIGHT = 120;
const BAR_WIDTH = 24;
const GAP = 6;

export function StackedBarChart({ bucketData, practices, maxVal }: StackedBarChartProps) {
  const chartWidth = bucketData.length * (BAR_WIDTH + GAP);

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {bucketData.map((b, bi) => {
          const total = Object.values(b.totals).reduce((a, v) => a + v, 0);
          const barH = maxVal > 0 ? (total / maxVal) * CHART_HEIGHT : 0;
          const isLast = bi === bucketData.length - 1;
          const x = bi * (BAR_WIDTH + GAP);

          // Build stacked rects from bottom up
          let accumulated = 0;
          const rects: React.ReactNode[] = [];

          practices.forEach((p) => {
            const v = b.totals[p.id] || 0;
            if (!v) return;
            const segH = total > 0 ? (v / total) * barH : 0;
            rects.push(
              <Rect
                key={p.id}
                x={x}
                y={CHART_HEIGHT - accumulated - segH}
                width={BAR_WIDTH}
                height={segH}
                fill={p.color}
                opacity={isLast ? 1 : 0.65}
                rx={0}
              />
            );
            accumulated += segH;
          });

          return (
            <G key={bi}>
              {rects}
            </G>
          );
        })}
      </Svg>

      {/* Labels below chart */}
      <View style={[styles.labelsRow, { width: chartWidth }]}>
        {bucketData.map((b, bi) => {
          const isLast = bi === bucketData.length - 1;
          return (
            <View
              key={bi}
              style={[styles.labelWrap, { width: BAR_WIDTH + GAP }]}
            >
              <Text
                style={[
                  styles.label,
                  isLast && styles.labelActive,
                ]}
              >
                {b.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  labelWrap: {
    alignItems: 'center',
  },
  label: {
    fontSize: 9,
    color: 'rgba(255,255,255,.25)',
    textAlign: 'center',
  },
  labelActive: {
    color: 'rgba(255,255,255,.6)',
  },
});
