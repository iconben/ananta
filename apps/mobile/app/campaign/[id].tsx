import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../src/theme';
import { fmtN } from '@ananta/utils';
import { usePracticeStore, useCampaignStore, useRecordStore } from '../src/stores';
import { Card } from '../src/components/ui/Card';
import { Heatmap } from '../src/components/Heatmap';
import { Ring } from '../src/components/Ring';
import { ProgressBar } from '../src/components/ui/ProgressBar';
import { Pill } from '../src/components/ui/Pill';
import { CampaignSheet } from '../(tabs)/components/CampaignSheet';

export default function CampaignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { practices } = usePracticeStore();
  const { campaigns } = useCampaignStore();
  const { records } = useRecordStore();

  const [showEditCampaign, setShowEditCampaign] = useState(false);

  const campaign = campaigns.find((c) => c.id === id);

  const campaignWithProgress = useMemo(() => {
    if (!campaign) return null;
    const extra = records
      .filter((r) => r.campaignId === id)
      .reduce((sum, r) => sum + r.count, 0);
    return { ...campaign, progress: campaign.progress + extra };
  }, [campaign, id, records]);

  const practice = practices.find((p) => p.id === campaign?.practiceId);

  const cRecords = useMemo(
    () => records.filter((r) => r.campaignId === id),
    [records, id]
  );

  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    records
      .filter((r) => r.campaignId === id)
      .forEach((r) => {
        const k = r.recordedAt.slice(0, 10);
        data[k] = (data[k] || 0) + r.count;
      });
    return data;
  }, [records, id]);

  if (!campaign || !campaignWithProgress || !practice) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>发愿不存在</Text>
      </View>
    );
  }

  const { progress, goal, done } = campaignWithProgress;
  const pct = progress / goal;
  const daysLeft = Math.ceil(
    (new Date(campaign.end).getTime() - Date.now()) / 86400000
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <View style={styles.tagsRow}>
              <View
                style={[
                  styles.practiceTag,
                  { backgroundColor: practice.color + '18', borderColor: practice.color + '35' },
                ]}
              >
                <Text style={[styles.practiceTagText, { color: practice.color }]}>
                  {practice.icon} {practice.name}
                </Text>
              </View>
              {done ? (
                <View style={[styles.practiceTag, { backgroundColor: 'rgba(74,222,128,.12)', borderColor: 'rgba(74,222,128,.3)' }]}>
                  <Text style={[styles.practiceTagText, { color: '#4ade80' }]}>✓ 圆满</Text>
                </View>
              ) : (
                <View style={[styles.practiceTag, { backgroundColor: practice.color + '12', borderColor: practice.color + '28' }]}>
                  <Text style={[styles.practiceTagText, { color: practice.color }]}>
                    剩 {daysLeft} 天
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowEditCampaign(true)}
          >
            <Text style={styles.editText}>✎ 编辑</Text>
          </TouchableOpacity>
        </View>

        {/* Progress card */}
        <Card style={[styles.card, { borderColor: practice.color + '28' }]}>
          <View style={styles.progressRow}>
            <View style={styles.ringContainer}>
              <Ring progress={pct} color={done ? '#4ade80' : practice.color} size={80} />
              <View style={styles.ringCenter}>
                <Text style={[styles.pctText, { color: done ? '#4ade80' : practice.color }]}>
                  {(pct * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            <View style={styles.progressInfo}>
              <View style={styles.progressNumbers}>
                <Text style={[styles.progressCurrent, { color: practice.color }]}>
                  {fmtN(progress)} {practice.unit}
                </Text>
                <Text style={styles.progressTarget}>目标 {fmtN(goal)}</Text>
              </View>
              <ProgressBar progress={pct} color={done ? '#4ade80' : practice.color} />
              <Text style={styles.progressRemaining}>
                {done ? '已圆满' : `还差 ${fmtN(goal - progress)} ${practice.unit}`}
              </Text>
              <Text style={styles.progressDates}>
                {campaign.start} ~ {campaign.end}
              </Text>
            </View>
          </View>
        </Card>

        {/* Heatmap */}
        <Card style={[styles.card, { borderColor: practice.color + '20' }]}>
          <Text style={[styles.cardLabel, { color: practice.color }]}>此发愿活跃图</Text>
          <Heatmap data={heatmapData} color={practice.color} />
        </Card>

        {/* Records */}
        <Card>
          <Text style={styles.cardLabel}>📿 记录明细</Text>
          {cRecords.length === 0 && (
            <Text style={styles.emptyText}>暂无记录</Text>
          )}
          {cRecords.map((r, i) => (
            <View
              key={r.id}
              style={[
                styles.recordRow,
                i < cRecords.length - 1 && styles.recordBorder,
              ]}
            >
              <View style={styles.recordInfo}>
                <Text style={styles.recordNote}>{r.note}</Text>
                <Text style={styles.recordDate}>{r.recordedAt}</Text>
              </View>
              <View style={styles.recordStats}>
                <Text style={[styles.recordCount, { color: practice.color }]}>
                  {r.count.toLocaleString()}
                </Text>
                <Text style={styles.recordUnit}>{practice.unit}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>

      <CampaignSheet
        visible={showEditCampaign}
        onClose={() => setShowEditCampaign(false)}
        editCampaign={campaign}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  notFound: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,.6)',
  },
  headerInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e5dcc8',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  practiceTag: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  practiceTagText: {
    fontSize: 11,
  },
  editBtn: {
    padding: 4,
  },
  editText: {
    fontSize: 13,
    color: 'rgba(255,255,255,.3)',
  },
  card: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10,
    letterSpacing: '0.14em',
    color: 'rgba(255,255,255,.4)',
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ringContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    flexShrink: 0,
  },
  ringCenter: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressInfo: {
    flex: 1,
  },
  progressNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCurrent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTarget: {
    fontSize: 13,
    color: 'rgba(255,255,255,.4)',
  },
  progressRemaining: {
    fontSize: 11,
    color: 'rgba(255,255,255,.35)',
    marginTop: 5,
  },
  progressDates: {
    fontSize: 10,
    color: 'rgba(255,255,255,.25)',
    marginTop: 3,
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,.25)',
    padding: 16,
    fontSize: 12,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  recordBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,.05)',
  },
  recordInfo: {
    flex: 1,
  },
  recordNote: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5dcc8',
  },
  recordDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,.3)',
    marginTop: 1,
  },
  recordStats: {
    alignItems: 'flex-end',
  },
  recordCount: {
    fontSize: 15,
    fontWeight: '700',
  },
  recordUnit: {
    fontSize: 10,
    color: 'rgba(255,255,255,.3)',
  },
});
