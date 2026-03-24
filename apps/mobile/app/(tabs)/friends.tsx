import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../../src/theme';
import { fmtN } from '@ananta/utils';
import { Card } from '../../src/components/ui/Card';
import { Pill } from '../../src/components/ui/Pill';
import { Sheet } from '../../src/components/Sheet';
import { Button } from '../../src/components/ui/Button';
import { usePracticeStore, useUserStore, useAuthStore, useFriendsStore } from '../../src/stores';

const BADGES = [
  { i: '⭐', l: '百万行者', s: '累计>100万' },
  { i: '🔥', l: '精进30天', s: '连续打卡30天' },
  { i: '🌸', l: '法会参与', s: '参与共修活动' },
  { i: '🙇', l: '礼拜行者', s: '礼拜>1000拜' },
];

type SubTab = 'feed' | 'ranking' | 'badges';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

export default function FriendsTab() {
  const [subTab, setSubTab] = useState<SubTab>('feed');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const { practices } = usePracticeStore();
  const { user } = useUserStore();
  const { token } = useAuthStore();
  const { feed, leaderboard, requests, friends, fetchFeed, fetchLeaderboard, fetchRequests, sendRequest, isLoading: friendsLoading } = useFriendsStore();

  const getPractice = (id: string) => practices.find((p) => p.id === id) || { icon: '☸️', color: '#f0c040', unit: '' };

  const isAuthenticated = !!token;

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchFeed(user.id);
      fetchLeaderboard();
      fetchRequests();
    }
  }, [isAuthenticated, user?.id]);

  const toggleLike = (key: string) => {
    setLiked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendRequest = async () => {
    if (!inviteCode.trim() || !user?.id) return;
    try {
      await sendRequest(user.id, inviteCode.trim().toUpperCase());
      setInviteCode('');
      setShowAddSheet(false);
      Alert.alert('已发送', '好友申请已发送');
    } catch (err) {
      Alert.alert('发送失败', '请检查邀请码是否正确');
    }
  };

  const renderFeed = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>登录后查看善友动态</Text>
          <Text style={styles.emptySubtext}>在设置中绑定邮箱以登录</Text>
        </View>
      );
    }

    if (feed.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无动态</Text>
          <Text style={styles.emptySubtext}>添加好友后查看他们的修持动态</Text>
        </View>
      );
    }

    return (
      <View>
        {feed.map((item) => (
          <Card key={item.id} style={styles.feedCard}>
            <View style={styles.feedHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.userAvatar}</Text>
              </View>
              <View style={styles.feedUserInfo}>
                <Text style={styles.feedName}>{item.userName}</Text>
                <Text style={styles.feedTime}>
                  {new Date(item.recordedAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.likeBtn,
                  liked[`f-${item.id}`] && styles.likeBtnActive,
                ]}
                onPress={() => toggleLike(`f-${item.id}`)}
              >
                <Text
                  style={[
                    styles.likeText,
                    liked[`f-${item.id}`] && styles.likeTextActive,
                  ]}
                >
                  🙏 {liked[`f-${item.id}`] ? '已赞' : '随喜'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.feedItems}>
              <View style={[styles.feedItem, { borderColor: COLORS.gold + '25', backgroundColor: COLORS.gold + '12' }]}>
                <Text style={styles.feedItemIcon}>{item.practiceIcon}</Text>
                <Text style={[styles.feedItemCount, { color: COLORS.gold }]}>
                  {fmtN(item.count)}
                </Text>
                <Text style={styles.feedItemUnit}>{item.practiceName}</Text>
              </View>
            </View>
          </Card>
        ))}
        <Text style={styles.feedHint}>只显示善友的每日汇总动态</Text>
      </View>
    );
  };

  const renderRanking = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>登录后查看排行榜</Text>
          <Text style={styles.emptySubtext}>在设置中绑定邮箱以登录</Text>
        </View>
      );
    }

    if (leaderboard.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无排行</Text>
          <Text style={styles.emptySubtext}>添加好友后查看排行榜</Text>
        </View>
      );
    }

    return (
      <Card>
        <Text style={styles.sectionLabel}>🏆 善友排行榜</Text>
        {leaderboard.map((entry) => {
          const isMe = entry.userId === user?.id;
          return (
            <View
              key={entry.userId}
              style={[styles.rankRow, isMe && styles.rankRowMe]}
            >
              <View style={styles.rankNum}>
                {entry.rank <= 3 ? (
                  <Text style={styles.medalText}>{MEDAL_EMOJIS[entry.rank - 1]}</Text>
                ) : (
                  <Text style={styles.rankNumText}>{entry.rank}</Text>
                )}
              </View>
              <View style={[styles.rankAvatar, isMe && styles.rankAvatarMe]}>
                <Text style={[styles.rankAvatarText, isMe && styles.rankAvatarTextMe]}>
                  {entry.userAvatar}
                </Text>
              </View>
              <View style={styles.rankInfo}>
                <View style={styles.rankNameRow}>
                  <Text style={[styles.rankName, isMe && styles.rankNameMe]}>
                    {entry.userName}
                  </Text>
                  {isMe && <Text style={styles.selfBadge}>自己</Text>}
                </View>
                <Text style={styles.rankStreak}>{fmtN(entry.total)}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.likeBtn,
                  liked[`r-${entry.rank}`] && styles.likeBtnActive,
                ]}
                onPress={() => toggleLike(`r-${entry.rank}`)}
              >
                <Text
                  style={[
                    styles.likeText,
                    liked[`r-${entry.rank}`] && styles.likeTextActive,
                  ]}
                >
                  🙏 {liked[`r-${entry.rank}`] ? '已赞' : '随喜'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </Card>
    );
  };

  const renderBadges = () => (
    <View>
      <Card style={styles.badgesCard}>
        <Text style={styles.sectionLabel}>🎖 我的成就</Text>
        <View style={styles.badgeGrid}>
          {BADGES.map((b) => (
            <View key={b.i} style={styles.badgeItem}>
              <Text style={styles.badgeIcon}>{b.i}</Text>
              <Text style={styles.badgeLabel}>{b.l}</Text>
              <Text style={styles.badgeDesc}>{b.s}</Text>
            </View>
          ))}
          <View style={styles.badgeLock}>
            <Text style={styles.badgeLockText}>更多待解锁</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.streakCard}>
        <Text style={styles.sectionLabel}>🔥 连续打卡</Text>
        <View style={styles.streakGrid}>
          {Array.from({ length: 21 }).map((_, i) => {
            const active = i < 17; // placeholder: streak % 21
            return (
              <View
                key={i}
                style={[
                  styles.streakCell,
                  active && styles.streakCellActive,
                ]}
              >
                <Text style={[styles.streakCellText, active && styles.streakCellTextActive]}>
                  {active ? '🔥' : '·'}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.streakLabel}>已连续 17 天</Text>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>善友</Text>
        <TouchableOpacity
          style={styles.friendReqBtn}
          onPress={() => setShowAddSheet(true)}
        >
          <Text style={styles.friendReqText}>好友</Text>
          {requests.length > 0 && (
            <View style={styles.friendReqBadge}>
              <Text style={styles.friendReqBadgeText}>{requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {(['feed', 'ranking', 'badges'] as SubTab[]).map((t) => (
          <Pill
            key={t}
            label={t === 'feed' ? '动态' : t === 'ranking' ? '排行' : '成就'}
            active={subTab === t}
            color={COLORS.gold}
            onPress={() => setSubTab(t)}
          />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {subTab === 'feed' && renderFeed()}
        {subTab === 'ranking' && renderRanking()}
        {subTab === 'badges' && renderBadges()}
      </ScrollView>

      {/* Add Friend Sheet */}
      <Sheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} title="添加善友">
        <View style={styles.addSheetContent}>
          <Text style={styles.addSheetLabel}>输入对方的邀请码</Text>
          <TextInput
            style={styles.inviteInput}
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="例如：A3B7K9"
            placeholderTextColor="rgba(255,255,255,.3)"
            autoCapitalize="characters"
            maxLength={6}
          />
          <Button
            title={friendsLoading ? '发送中...' : '发送好友申请'}
            onPress={handleSendRequest}
            disabled={!inviteCode.trim() || friendsLoading}
          />
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowAddSheet(false)}
          >
            <Text style={styles.cancelBtnText}>取消</Text>
          </TouchableOpacity>
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gold,
  },
  friendReqBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendReqText: {
    fontSize: 13,
    color: 'rgba(255,255,255,.3)',
  },
  friendReqBadge: {
    backgroundColor: 'rgba(240,192,64,.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  friendReqBadgeText: {
    fontSize: 10,
    color: COLORS.gold,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,.4)',
    marginBottom: 12,
  },
  feedCard: {
    marginBottom: 10,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  feedUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  feedName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  feedTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,.3)',
    marginTop: 1,
  },
  likeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  likeBtnActive: {
    backgroundColor: 'rgba(240,192,64,.12)',
    borderColor: 'rgba(240,192,64,.35)',
  },
  likeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,.35)',
  },
  likeTextActive: {
    color: COLORS.gold,
  },
  feedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  feedItemIcon: {
    fontSize: 13,
  },
  feedItemCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedItemUnit: {
    fontSize: 10,
    color: 'rgba(255,255,255,.4)',
  },
  feedHint: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,.2)',
    paddingVertical: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 4,
  },
  rankRowMe: {
    backgroundColor: 'rgba(240,192,64,.06)',
    borderWidth: 1,
    borderColor: 'rgba(240,192,64,.15)',
    paddingHorizontal: 6,
  },
  rankNum: {
    width: 24,
    alignItems: 'center',
  },
  medalText: {
    fontSize: 17,
  },
  rankNumText: {
    fontSize: 12,
    color: 'rgba(255,255,255,.3)',
    fontWeight: '700',
  },
  rankAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankAvatarMe: {
    backgroundColor: 'rgba(240,192,64,.2)',
    borderWidth: 2,
    borderColor: 'rgba(240,192,64,.4)',
  },
  rankAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  rankAvatarTextMe: {
    color: COLORS.gold,
  },
  rankInfo: {
    flex: 1,
  },
  rankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  rankNameMe: {
    fontWeight: '700',
  },
  rankBadges: {
    fontSize: 12,
  },
  rankStreak: {
    fontSize: 10,
    color: 'rgba(255,255,255,.35)',
    marginTop: 1,
  },
  rankPts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 3,
  },
  rankPtTag: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  rankPtText: {
    fontSize: 9,
  },
  badgesCard: {
    marginBottom: 12,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeItem: {
    backgroundColor: 'rgba(240,192,64,.07)',
    borderWidth: 1,
    borderColor: 'rgba(240,192,64,.18)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    minWidth: 68,
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  badgeDesc: {
    fontSize: 9,
    color: 'rgba(255,255,255,.3)',
    marginTop: 2,
  },
  badgeLock: {
    backgroundColor: 'rgba(255,255,255,.02)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,.1)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
    minHeight: 72,
  },
  badgeLockText: {
    fontSize: 11,
    color: 'rgba(255,255,255,.2)',
  },
  streakCard: {
    backgroundColor: 'rgba(251,100,0,.05)',
    borderColor: 'rgba(251,146,60,.2)',
  },
  streakGrid: {
    flexDirection: 'row',
    gap: 3,
  },
  streakCell: {
    flex: 1,
    height: 26,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCellActive: {
    backgroundColor: COLORS.gold,
  },
  streakCellText: {
    fontSize: 8,
    color: 'rgba(255,255,255,.15)',
  },
  streakCellTextActive: {
    color: '#080c18',
  },
  streakLabel: {
    fontSize: 13,
    color: 'rgba(255,160,0,.9)',
    fontWeight: '700',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255,255,255,.5)',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,.25)',
    textAlign: 'center',
  },
  selfBadge: {
    fontSize: 10,
    color: COLORS.gold,
    backgroundColor: 'rgba(240,192,64,.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  addSheetContent: {
    paddingVertical: 8,
    gap: 16,
  },
  addSheetLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,.6)',
    textAlign: 'center',
  },
  inviteInput: {
    backgroundColor: 'rgba(255,255,255,.07)',
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 14,
    color: 'rgba(255,255,255,.35)',
  },
});
