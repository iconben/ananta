import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme';
import { fmtN } from '@ananta/utils';
import { usePracticeStore, useCampaignStore, useRecordStore } from '../../src/stores';
import { Ring } from '../../src/components/Ring';
import { Card } from '../../src/components/ui/Card';
import { Pill } from '../../src/components/ui/Pill';
import { PracticeSheet } from './components/PracticeSheet';
import { CampaignSheet } from './components/CampaignSheet';
import { LogSheet } from './components/LogSheet';
import type { Practice, Campaign } from '@ananta/types';

const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_WIDTH = (width - 32 - CARD_GAP * 2) / 3;

export default function HomeTab() {
  const router = useRouter();
  const { practices, seedIfEmpty } = usePracticeStore();
  const { campaigns } = useCampaignStore();
  const { records } = useRecordStore();

  const [viewMode, setViewMode] = useState<'practice' | 'campaign'>('practice');
  const [showPracticeSheet, setShowPracticeSheet] = useState(false);
  const [showCampaignSheet, setShowCampaignSheet] = useState(false);
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [editPractice, setEditPractice] = useState<Practice | null>(null);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    seedIfEmpty();
  }, []);

  const practiceStats = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    return practices.map((p) => {
      const total = records
        .filter((r) => r.practiceId === p.id)
        .reduce((sum, r) => sum + r.count, 0);
      const today = records
        .filter((r) => r.practiceId === p.id && r.recordedAt.startsWith(todayKey))
        .reduce((sum, r) => sum + r.count, 0);
      return { ...p, total, today };
    });
  }, [practices, records]);

  const campaignProgress = useMemo(() => {
    return campaigns.map((c) => {
      const extra = records
        .filter((r) => r.campaignId === c.id)
        .reduce((sum, r) => sum + r.count, 0);
      return { ...c, progress: c.progress + extra };
    });
  }, [campaigns, records]);

  const activeCampaigns = useMemo(
    () => campaignProgress.filter((c) => !c.done),
    [campaignProgress]
  );

  const doneCampaigns = useMemo(
    () => campaignProgress.filter((c) => c.done),
    [campaignProgress]
  );

  const getPractice = (id: string) => practices.find((p) => p.id === id);

  const openEditPractice = (p: Practice) => {
    setEditPractice(p);
    setShowPracticeSheet(true);
  };

  const openEditCampaign = (c: Campaign) => {
    setEditCampaign(c);
    setShowCampaignSheet(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* View toggle */}
        <View style={styles.toggleRow}>
          <Pill
            label="按发愿"
            active={viewMode === 'campaign'}
            color={COLORS.gold}
            onPress={() => setViewMode('campaign')}
          />
          <Pill
            label="按课目"
            active={viewMode === 'practice'}
            color={COLORS.gold}
            onPress={() => setViewMode('practice')}
          />
        </View>

        {viewMode === 'practice' ? (
          <>
            {/* Practice grid */}
            <Card style={styles.gridCard}>
              <Text style={styles.sectionLabel}>☸ 我的课目</Text>
              <View style={styles.practiceGrid}>
                {practiceStats.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.practiceCard, { borderColor: p.color + '30' }]}
                    onPress={() => router.push(`/practice/${p.id}`)}
                    onLongPress={() => openEditPractice(p)}
                  >
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEditPractice(p)}
                    >
                      <Text style={styles.editIcon}>✎</Text>
                    </TouchableOpacity>
                    <Text style={styles.practiceIcon}>{p.icon}</Text>
                    <Text style={styles.practiceName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.practiceTotal}>{fmtN(p.total)}</Text>
                    <Text style={styles.practiceUnit}>累计{p.unit}</Text>
                    {p.today > 0 && (
                      <Text style={[styles.todayBadge, { color: p.color }]}>
                        今日+{fmtN(p.today)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* New practice button */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setEditPractice(null);
                setShowPracticeSheet(true);
              }}
            >
              <Text style={styles.addIcon}>＋</Text>
              <Text style={styles.addText}>新建课目</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>点击课目卡片查看详情，长按编辑</Text>
          </>
        ) : (
          <>
            {/* Active campaigns */}
            <Card>
              <Text style={styles.sectionLabel}>🏮 进行中的发愿</Text>
              {activeCampaigns.length === 0 && (
                <Text style={styles.emptyText}>暂无进行中的发愿</Text>
              )}
              {activeCampaigns.map((c) => {
                const p = getPractice(c.practiceId);
                if (!p) return null;
                const pct = c.progress / c.goal;
                const daysLeft = Math.ceil(
                  (new Date(c.end).getTime() - Date.now()) / 86400000
                );
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.campaignRow}
                    onPress={() => router.push(`/campaign/${c.id}`)}
                    onLongPress={() => openEditCampaign(c)}
                  >
                    <Ring progress={pct} color={p.color} size={44} />
                    <View style={styles.campaignInfo}>
                      <View style={styles.campaignHeader}>
                        <Text style={styles.campaignName}>{c.name}</Text>
                        <Text style={styles.daysLeft}>剩{daysLeft}天</Text>
                      </View>
                      <Text style={[styles.campaignPractice, { color: p.color }]}>
                        {p.icon} {p.name}
                      </Text>
                      <View style={styles.campaignFooter}>
                        <Text style={[styles.campaignProgress, { color: p.color }]}>
                          {fmtN(c.progress)} {p.unit}
                        </Text>
                        <Text style={styles.campaignGoal}>/ {fmtN(c.goal)}</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(pct * 100, 100)}%`, backgroundColor: p.color },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Card>

            {/* Done campaigns */}
            {doneCampaigns.length > 0 && (
              <Card>
                <Text style={styles.sectionLabel}>✓ 已圆满的发愿</Text>
                {doneCampaigns.map((c) => {
                  const p = getPractice(c.practiceId);
                  if (!p) return null;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.campaignRow}
                      onPress={() => router.push(`/campaign/${c.id}`)}
                    >
                      <View style={styles.doneRing}>
                        <Text style={styles.doneIcon}>✓</Text>
                      </View>
                      <View style={styles.campaignInfo}>
                        <Text style={styles.campaignName}>{c.name}</Text>
                        <Text style={[styles.campaignPractice, { color: p.color }]}>
                          {p.icon} {p.name}
                        </Text>
                        <Text style={styles.campaignDate}>
                          {c.start} ~ {c.end}
                        </Text>
                      </View>
                      <View style={styles.doneStats}>
                        <Text style={styles.doneTotal}>{fmtN(c.progress)}</Text>
                        <Text style={styles.doneUnit}>{p.unit}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Card>
            )}

            {/* New campaign button */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setEditCampaign(null);
                setShowCampaignSheet(true);
              }}
            >
              <Text style={styles.addIcon}>＋</Text>
              <Text style={styles.addText}>新建发愿</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowLogSheet(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Sheets */}
      <PracticeSheet
        visible={showPracticeSheet}
        onClose={() => {
          setShowPracticeSheet(false);
          setEditPractice(null);
        }}
        editPractice={editPractice}
      />

      <CampaignSheet
        visible={showCampaignSheet}
        onClose={() => {
          setShowCampaignSheet(false);
          setEditCampaign(null);
        }}
        editCampaign={editCampaign}
      />

      <LogSheet
        visible={showLogSheet}
        onClose={() => setShowLogSheet(false)}
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
    paddingBottom: 100,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,.4)',
    letterSpacing: '0.15em',
    marginBottom: 12,
  },
  gridCard: {
    marginBottom: 12,
  },
  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  practiceCard: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,.03)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
  },
  editBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 2,
  },
  editIcon: {
    fontSize: 10,
    color: 'rgba(255,255,255,.2)',
  },
  practiceIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  practiceName: {
    fontSize: 10,
    color: 'rgba(255,255,255,.45)',
    marginBottom: 4,
    textAlign: 'center',
  },
  practiceTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e5dcc8',
  },
  practiceUnit: {
    fontSize: 9,
    color: 'rgba(255,255,255,.25)',
    marginTop: 1,
  },
  todayBadge: {
    fontSize: 9,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,.02)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(240,192,64,.25)',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  addIcon: {
    fontSize: 18,
    color: 'rgba(240,192,64,.5)',
  },
  addText: {
    fontSize: 13,
    color: 'rgba(240,192,64,.6)',
    letterSpacing: '0.05em',
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,.2)',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,.25)',
    fontSize: 12,
    paddingVertical: 16,
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
  daysLeft: {
    fontSize: 10,
    color: 'rgba(255,255,255,.35)',
  },
  campaignPractice: {
    fontSize: 10,
    marginTop: 2,
  },
  campaignFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  campaignProgress: {
    fontSize: 11,
  },
  campaignGoal: {
    fontSize: 11,
    color: 'rgba(255,255,255,.3)',
    marginLeft: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,.07)',
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  doneRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74,222,128,.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneIcon: {
    fontSize: 18,
    color: '#4ade80',
  },
  doneStats: {
    alignItems: 'flex-end',
  },
  doneTotal: {
    fontSize: 13,
    color: '#4ade80',
    fontWeight: '700',
  },
  doneUnit: {
    fontSize: 10,
    color: 'rgba(255,255,255,.3)',
  },
  campaignDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,.3)',
    marginTop: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#080c18',
    fontWeight: '300',
    marginTop: -2,
  },
});
