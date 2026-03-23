import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sheet } from '../../../components/Sheet';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { COLORS } from '../../../src/theme';
import { usePracticeStore, useCampaignStore, useRecordStore } from '../../../src/stores';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultPracticeId?: string;
}

export function LogSheet({ visible, onClose, defaultPracticeId }: Props) {
  const { practices } = usePracticeStore();
  const { campaigns } = useCampaignStore();
  const { addRecord } = useRecordStore();

  const [practiceId, setPracticeId] = useState(defaultPracticeId || practices[0]?.id || '');
  const [count, setCount] = useState('');
  const [note, setNote] = useState('');
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const activeCampaigns = useMemo(
    () =>
      campaigns.filter(
        (c) =>
          c.practiceId === practiceId &&
          !c.done &&
          new Date(c.end) >= new Date()
      ),
    [campaigns, practiceId]
  );

  const selectedPractice = practices.find((p) => p.id === practiceId);

  const handleSave = () => {
    const n = parseInt(count);
    if (!n || n <= 0) return;

    addRecord({
      practiceId,
      campaignId: campaignId || undefined,
      count: n,
      note: note || '功课记录',
      recordedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    setCount('');
    setNote('');
    setCampaignId(null);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="记录功课">
      <View style={styles.field}>
        <Text style={styles.label}>选择课目</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.practiceScroll}>
          <View style={styles.practiceRow}>
            {practices.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  setPracticeId(p.id);
                  setCampaignId(null);
                }}
                style={[
                  styles.practicePill,
                  { borderColor: p.color },
                  practiceId === p.id && { backgroundColor: p.color + '20' },
                ]}
              >
                <Text style={styles.practiceIcon}>{p.icon}</Text>
                <Text
                  style={[
                    styles.practiceName,
                    practiceId === p.id && { color: p.color },
                  ]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          数量 ({selectedPractice?.unit || '遍'})
        </Text>
        <Input
          value={count}
          onChangeText={setCount}
          placeholder="如：108"
          keyboardType="numeric"
          autoFocus
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>备注（可选）</Text>
        <Input value={note} onChangeText={setNote} placeholder="如：晨课、晚课共修" />
      </View>

      {activeCampaigns.length > 0 && (
        <View style={styles.field}>
          <Text style={styles.label}>计入发愿（可选）</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.practiceScroll}>
            <View style={styles.practiceRow}>
              <TouchableOpacity
                onPress={() => setCampaignId(null)}
                style={[
                  styles.campaignPill,
                  !campaignId && styles.campaignPillActive,
                ]}
              >
                <Text style={[styles.campaignText, !campaignId && styles.campaignTextActive]}>
                  不计入
                </Text>
              </TouchableOpacity>
              {activeCampaigns.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCampaignId(c.id)}
                  style={[
                    styles.campaignPill,
                    campaignId === c.id && styles.campaignPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.campaignText,
                      campaignId === c.id && styles.campaignTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.buttons}>
        <Button title="取消" onPress={onClose} style={{ marginRight: 8 }} />
        <Button title="记录" variant="primary" onPress={handleSave} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,.4)',
    letterSpacing: '0.12em',
    marginBottom: 7,
  },
  practiceScroll: {
    marginHorizontal: -4,
  },
  practiceRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  practicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,.04)',
  },
  practiceIcon: {
    fontSize: 14,
  },
  practiceName: {
    fontSize: 12,
    color: 'rgba(255,255,255,.5)',
  },
  campaignPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  campaignPillActive: {
    backgroundColor: COLORS.gold + '20',
    borderColor: COLORS.gold,
  },
  campaignText: {
    fontSize: 12,
    color: 'rgba(255,255,255,.5)',
  },
  campaignTextActive: {
    color: COLORS.gold,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
