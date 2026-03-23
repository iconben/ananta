import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { hex2rgb } from '@ananta/utils';

interface HeatmapProps {
  data: Record<string, number>; // { 'YYYY-MM-DD': count }
  color: string;
}

export function Heatmap({ data, color }: HeatmapProps) {
  const weeks = useMemo(() => {
    const res: { k: string; v: number }[][] = [];
    const today = new Date();
    const cur = new Date(today);
    cur.setDate(cur.getDate() - 363);
    while (cur.getDay() !== 0) cur.setDate(cur.getDate() - 1);
    let wk: { k: string; v: number }[] = [];

    while (cur <= today) {
      const key = cur.toISOString().slice(0, 10);
      wk.push({ k: key, v: data[key] || 0 });
      if (wk.length === 7) {
        res.push(wk);
        wk = [];
      }
      cur.setDate(cur.getDate() + 1);
    }
    if (wk.length) res.push(wk);
    return res;
  }, [data]);

  const rgb = hex2rgb(color);
  const bg = (v: number) =>
    v === 0 ? 'rgba(255,255,255,.05)' :
    v < 500 ? `rgba(${rgb},.2)` :
    v < 5000 ? `rgba(${rgb},.45)` :
    v < 40000 ? `rgba(${rgb},.75)` :
    `rgba(${rgb},1)`;

  return (
    <View style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {weeks.map((wk, wi) => (
          <View key={wi} style={{ flexDirection: 'column', gap: 3 }}>
            {wk.map((d, di) => (
              <View
                key={di}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 2,
                  backgroundColor: bg(d.v),
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 5, marginTop: 6, alignItems: 'center' }}>
        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>少</Text>
        {[.05, .2, .45, .75, 1].map((o, i) => (
          <View
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: o === .05 ? 'rgba(255,255,255,.05)' : `rgba(${rgb},${o})`,
            }}
          />
        ))}
        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>多</Text>
      </View>
    </View>
  );
}
