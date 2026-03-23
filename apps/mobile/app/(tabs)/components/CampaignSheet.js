import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sheet } from '../../../components/Sheet';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { usePracticeStore, useCampaignStore } from '../../../src/stores';
export function CampaignSheet({ visible, onClose, editCampaign, defaultPracticeId }) {
    const { practices } = usePracticeStore();
    const { addCampaign, updateCampaign } = useCampaignStore();
    const [name, setName] = useState('');
    const [practiceId, setPracticeId] = useState(defaultPracticeId || practices[0]?.id || '');
    const [goal, setGoal] = useState('');
    const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
    const [end, setEnd] = useState('');
    useEffect(() => {
        if (editCampaign) {
            setName(editCampaign.name);
            setPracticeId(editCampaign.practiceId);
            setGoal(String(editCampaign.goal));
            setStart(editCampaign.start);
            setEnd(editCampaign.end);
        }
        else {
            setName('');
            setPracticeId(defaultPracticeId || practices[0]?.id || '');
            setGoal('');
            setStart(new Date().toISOString().slice(0, 10));
            setEnd('');
        }
    }, [editCampaign, visible, defaultPracticeId, practices]);
    const handleSave = () => {
        if (!name.trim() || !goal || !end)
            return;
        if (editCampaign) {
            updateCampaign(editCampaign.id, {
                name,
                practiceId,
                goal: parseInt(goal),
                start,
                end,
            });
        }
        else {
            addCampaign({
                name,
                practiceId,
                goal: parseInt(goal),
                progress: 0,
                start,
                end,
                done: false,
            });
        }
        onClose();
    };
    const selectedPractice = practices.find((p) => p.id === practiceId);
    return (<Sheet visible={visible} onClose={onClose} title={editCampaign ? '编辑发愿' : '新建发愿'}>
      <View style={styles.field}>
        <Text style={styles.label}>发愿名称</Text>
        <Input value={name} onChangeText={setName} placeholder="如：春季法会共修"/>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>所属课目</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.practiceScroll}>
          <View style={styles.practiceRow}>
            {practices.map((p) => (<TouchableOpacity key={p.id} onPress={() => setPracticeId(p.id)} style={[
                styles.practicePill,
                { borderColor: p.color },
                practiceId === p.id && { backgroundColor: p.color + '20', borderColor: p.color },
            ]}>
                <Text style={styles.practiceIcon}>{p.icon}</Text>
                <Text style={[
                styles.practiceName,
                practiceId === p.id && { color: p.color },
            ]}>
                  {p.name}
                </Text>
              </TouchableOpacity>))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>目标数量 ({selectedPractice?.unit || '遍'})</Text>
        <Input value={goal} onChangeText={setGoal} placeholder="如：10000" keyboardType="numeric"/>
      </View>

      <View style={styles.dateRow}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>开始日期</Text>
          <Input value={start} onChangeText={setStart} placeholder="YYYY-MM-DD"/>
        </View>
        <View style={{ width: 16 }}/>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>截止日期</Text>
          <Input value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD"/>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button title="取消" onPress={onClose} style={{ marginRight: 8 }}/>
        <Button title="保存" variant="primary" onPress={handleSave}/>
      </View>
    </Sheet>);
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
    dateRow: {
        flexDirection: 'row',
    },
    buttons: {
        flexDirection: 'row',
        marginTop: 8,
    },
});
