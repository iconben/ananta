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
import { PracticeSheet } from '../(tabs)/components/PracticeSheet';
import { CampaignSheet } from '../(tabs)/components/CampaignSheet';
import type { Campaign } from '@ananta/types';

export default function PracticeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { practices, seedIfEmpty } = usePracticeStore();
  const { campaigns } = useCampaignStore();
  const { records } = useRecordStore();

  const [showEditPractice, setShowEditPractice] = useState(false);
  const [showEditCampaign, setShowEditCampaign] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    seedIfEmpty();
  }, []);

  const practice = practices.find((p) => p.id === id);

  const practiceRecords = useMemo(
    () => records.filter((r) => r.practiceId === id),
    [records, id]
  );

  const total = useMemo(
    () => practiceRecords.reduce((sum, r) => sum + r.count, 0),
    [practiceRecords]
  );

  const relatedCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => c.practiceId === id)
      .map((c) => {
        const extra = records
          .filter((r) => r.campaignId === c.id)
          .reduce((sum, r) => sum + r.count, 0);
        return { ...c, progress: c.progress + extra };
      });
  }, [campaigns, id, records]);

  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    records
      .filter((r) => r.practiceId === id)
      .forEach((r) => {
        const k = r.recordedAt.slice(0, 10);
        data[k] = (data[k] || 0) + r.count;
      });
    return data;
  }, [records, id]);

  if (!practice) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>课目不存在</Text>
      </View>
    );
  }

  const handleOpenEditCampaign = (c: Campaign) => {
    setEditCampaign(c);
    setShowEditCampaign(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.practiceIcon}>{practice.icon}</Text>
          <View style={styles.headerInfo}>
            <Text style={[styles.practiceName, { color: practice.color }]}>
              {practice.name}
            </Text>
            <Text style={styles.totalText}>
              累计 {fmtN(total)} {practice.unit}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowEditPractice(true)}
          >
            <Text style={styles.editText}>✎ 编辑</Text>
          </TouchableOpacity>
        </View>

        {/* Heatmap */}
        <Card style={[styles.card, { borderColor: practice.color + '28' }]}>
          <Text style={[styles.cardLabel, { color: practice.color }]}>活跃热力图</Text>
          <Heatmap data={heatmapData} color={practice.color} />
        </Card>

        {/* Related campaigns */}
        {relatedCampaigns.length > 0 && (
          <Card style={[styles.card, { borderColor: practice.color + '18' }]}>
            <Text style={styles.cardLabel}>🏮 相关发愿</Text>
            {relatedCampaigns.map((c) => {
              const pct = c.progress / c.goal;
              const daysLeft = Math.ceil(
                (new Date(c.end).getTime() - Date.now()) / 86400000
              );
              return (
                <View key={c.id} style={styles.campaignRow}>
                  <Ring
                    progress={pct}
                    color={c.done ? '#4ade80' : practice.color}
                    size={40}
                  />
                  <View style={styles.campaignInfo}>
                    <View style={styles.campaignHeader}>
                      <Text style={styles.campaignName}>{c.name}</Text>
                      {c.done ? (
                        <Text style={styles.doneTag}>✓ 圆满</Text>
                      ) : (
                        <Text style={styles.daysTag}>剩{daysLeft}天</Text>
                      )}
                    </View>
                    <View style={styles.campaignFooter}>
                      <Text style={[styles.campaignProgress, { color: practice.color }]}>
                        {fmtN(c.progress)} {practice.unit}
                      </Text>
                      <Text style={styles.campaignGoal}>/ {fmtN(c.goal)}</Text>
                    </View>
                    <ProgressBar
                      progress={pct}
                      color={c.done ? '#4ade80' : practice.color}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.campaignEdit}
                    onPress={() => handleOpenEditCampaign(c)}
                  >
                    <Text style={styles.campaignEditIcon}>✎</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Merged total */}
            {relatedCampaigns.length > 1 && (
              <View style={styles.mergedTotal}>
                <View style={styles.mergedHeader}>
                  <Text style={styles.mergedLabel}>跨发愿合并</Text>
                  <Text style={[styles.mergedValue, { color: practice.color }]}>
                    {fmtN(
                      relatedCampaigns.reduce((sum, c) => sum + c.progress, 0)
                    )}{' '}
                    /{' '}
                    {fmtN(
                      relatedCampaigns.reduce((sum, c) => sum + c.goal, 0)
                    )}{' '}
                    {practice.unit}
                  </Text>
                </View>
                <ProgressBar
                  progress={
                    relatedCampaigns.reduce((sum, c) => sum + c.progress) /
                    relatedCampaigns.reduce((sum, c) => sum + c.goal)
                  }
                  color={practice.color}
                />
              </View>
            )}
          </Card>
        )}

        {/* Records */}
        <Card>
          <Text style={styles.cardLabel}>📿 历史记录</Text>
          {practiceRecords.length === 0 && (
            <Text style={styles.emptyText}>暂无记录</Text>
          )}
          {practiceRecords.map((r, i) => (
            <View
              key={r.id}
              style={[
                styles.recordRow,
                i < practiceRecords.length - 1 && styles.recordBorder,
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

      <PracticeSheet
        visible={showEditPractice}
        onClose={() => setShowEditPractice(false)}
        editPractice={practice}
      />

      <CampaignSheet
        visible={showEditCampaign}
        onClose={() => setShowEditCampaign(false)}
        editCampaign={editCampaign}
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
    alignItems: 'center',
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
  practiceIcon: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  practiceName: {
    fontSize: 17,
    fontWeight: '700',
  },
  totalText: {
    fontSize: 11,
    color: 'rgba(255,255,255,.35)',
    marginTop: 2,
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
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,.4)',
    marginBottom: 10,
  },
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,.05)',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campaignName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5dcc8',
  },
  doneTag: {
    fontSize: 10,
    color: '#4ade80',
  },
  daysTag: {
    fontSize: 10,
    color: 'rgba(255,255,255,.35)',
  },
  campaignFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  campaignProgress: {
    fontSize: 11,
  },
  campaignGoal: {
    fontSize: 11,
    color: 'rgba(255,255,255,.3)',
    marginLeft: 4,
  },
  campaignEdit: {
    padding: 4,
  },
  campaignEditIcon: {
    fontSize: 14,
    color: 'rgba(255,255,255,.2)',
  },
  mergedTotal: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,.07)',
  },
  mergedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mergedLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,.4)',
    letterSpacing: '0.08em',
  },
  mergedValue: {
    fontSize: 12,
    fontWeight: '700',
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
