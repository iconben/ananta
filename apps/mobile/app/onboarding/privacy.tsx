import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme';
import { useUserStore } from '../../src/stores';

export default function OnboardingPrivacy() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const [dataPublic, setDataPublic] = useState(true);
  const [inRanking, setInRanking] = useState(true);

  const handleContinue = () => {
    updateUser({ dataPublic, inRanking });
    router.replace('/onboarding/complete');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>隐私设置</Text>
        <Text style={styles.subtitle}>
          无量默认保护你的数据隐私，你可以随时在设置中更改
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>修持数据是否公开</Text>
              <Text style={styles.rowDesc}>关闭后，好友动态和排行榜不会显示你的数据</Text>
            </View>
            <Switch
              value={dataPublic}
              onValueChange={setDataPublic}
              trackColor={{ false: 'rgba(255,255,255,.1)', true: COLORS.gold + '55' }}
              thumbColor={dataPublic ? COLORS.gold : 'rgba(255,255,255,.3)'}
            />
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>是否出现在排行榜</Text>
              <Text style={styles.rowDesc}>关闭后，不会显示在善友排行榜中</Text>
            </View>
            <Switch
              value={inRanking}
              onValueChange={setInRanking}
              trackColor={{ false: 'rgba(255,255,255,.1)', true: COLORS.gold + '55' }}
              thumbColor={inRanking ? COLORS.gold : 'rgba(255,255,255,.3)'}
            />
          </View>
        </View>

        <Text style={styles.note}>
          随时可以在「设置 → 隐私设置」中更改这些选项
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>完成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,.05)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowInfo: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  rowDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  note: {
    fontSize: 12,
    color: 'rgba(255,255,255,.3)',
    textAlign: 'center',
    marginTop: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  primaryBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#080c18',
  },
});
