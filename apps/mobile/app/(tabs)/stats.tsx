import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../src/theme';
import { useRecordStore } from '../../src/stores';
import { usePracticeStore } from '../../src/stores';
import { Pill } from '../../src/components/ui/Pill';
import { Card } from '../../src/components/ui/Card';
import { StackedBarChart } from '../../src/components/StackedBarChart';
import { PracticeBreakdown } from '../../src/components/PracticeBreakdown';

type Period = 'week' | 'month' | 'year';

const PERIOD_LABELS: [Period, string][] = [
  ['week', '近12周'],
  ['month', '近6月'],
  ['year', '近3年'],
];

interface BucketData {
  label: string;
  start: Date;
  end: Date;
  totals: Record<string, number>;
}

function buildBuckets(period: Period): BucketData[] {
  const now = new Date();
  const buckets: BucketData[] = [];

  if (period === 'week') {
    // 12 weeks, each bucket is a week
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay()); // Sunday
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // Saturday
      buckets.push({
        label: `${start.getMonth() + 1}/${start.getDate()}`,
        start,
        end,
        totals: {},
      });
    }
  } else if (period === 'month') {
    // 6 months
    const mNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      buckets.push({
        label: mNames[d.getMonth()],
        start: d,
        end,
        totals: {},
      });
    }
  } else {
    // 3 years
    for (let i = 2; i >= 0; i--) {
      const y = now.getFullYear() - i;
      buckets.push({
        label: `${y}年`,
        start: new Date(y, 0, 1),
        end: new Date(y, 11, 31),
        totals: {},
      });
    }
  }

  return buckets;
}

export default function StatsTab() {
  const [period, setPeriod] = useState<Period>('week');
  const records = useRecordStore((s) => s.records);
  const practices = usePracticeStore((s) => s.practices);

  const bucketData = useMemo(() => {
    const buckets = buildBuckets(period);

    // Aggregate records into buckets
    return buckets.map((b) => {
      const totals: Record<string, number> = {};
      practices.forEach((p) => {
        const sum = records
          .filter((r) => r.practiceId === p.id)
          .filter((r) => {
            const d = new Date(r.recordedAt);
            return d >= b.start && d <= b.end;
          })
          .reduce((a, r) => a + r.count, 0);
        totals[p.id] = sum;
      });
      return { ...b, totals };
    });
  }, [period, records, practices]);

  const maxVal = useMemo(() => {
    let m = 0;
    bucketData.forEach((b) => {
      const s = Object.values(b.totals).reduce((a, v) => a + v, 0);
      if (s > m) m = s;
    });
    return m || 1;
  }, [bucketData]);

  const latestBucket = bucketData[bucketData.length - 1] ?? null;
  const prevBucket = bucketData[bucketData.length - 2] ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Period selector */}
      <View style={styles.pillRow}>
        {PERIOD_LABELS.map(([v, l]) => (
          <Pill
            key={v}
            label={l}
            active={period === v}
            onPress={() => setPeriod(v)}
          />
        ))}
      </View>

      {/* Stacked bar chart */}
      <Card>
        <Text style={styles.sectionTitle}>各课目修持量</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <StackedBarChart
            bucketData={bucketData}
            practices={practices}
            maxVal={maxVal}
          />
        </ScrollView>
        {/* Legend */}
        <View style={styles.legendRow}>
          {practices
            .filter((p) =>
              Object.values(latestBucket?.totals ?? {}).some(
                (v, i) =>
                  Object.keys(latestBucket?.totals ?? {})[i] === p.id && v > 0
              )
            )
            .map((p) => (
              <View key={p.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: p.color }]} />
                <Text style={styles.legendText}>{p.name}</Text>
              </View>
            ))}
        </View>
      </Card>

      {/* Practice breakdown */}
      <Card>
        <Text style={styles.sectionTitle}>
          {latestBucket?.label ?? ''} · 各课目汇总
        </Text>
        <PracticeBreakdown
          practices={practices}
          latestBucket={latestBucket}
          prevBucket={prevBucket}
          maxVal={maxVal}
        />
      </Card>

      {/* Hint */}
      <Text style={styles.hint}>点击首页课目卡片可查看历史记录明细</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,.4)',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(255,255,255,.5)',
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,.2)',
    marginTop: 4,
    marginBottom: 8,
  },
});
