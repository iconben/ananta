import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sheet } from '../../../components/Sheet';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ICON_OPTIONS, COLOR_OPTIONS } from '@ananta/utils';
import { usePracticeStore } from '../../../src/stores';
export function PracticeSheet({ visible, onClose, editPractice }) {
    const { addPractice, updatePractice, deletePractice } = usePracticeStore();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('🪷');
    const [unit, setUnit] = useState('遍');
    const [color, setColor] = useState('#f0c040');
    useEffect(() => {
        if (editPractice) {
            setName(editPractice.name);
            setIcon(editPractice.icon);
            setUnit(editPractice.unit);
            setColor(editPractice.color);
        }
        else {
            setName('');
            setIcon('🪷');
            setUnit('遍');
            setColor('#f0c040');
        }
    }, [editPractice, visible]);
    const handleSave = () => {
        if (!name.trim())
            return;
        if (editPractice) {
            updatePractice(editPractice.id, { name, icon, unit, color });
        }
        else {
            addPractice({ name, icon, unit, color });
        }
        onClose();
    };
    const handleDelete = () => {
        if (editPractice) {
            deletePractice(editPractice.id);
            onClose();
        }
    };
    return (<Sheet visible={visible} onClose={onClose} title={editPractice ? '编辑课目' : '新建课目'}>
      <View style={styles.field}>
        <Text style={styles.label}>名称</Text>
        <Input value={name} onChangeText={setName} placeholder="如：观音心咒"/>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>计量单位</Text>
        <Input value={unit} onChangeText={setUnit} placeholder="遍/拜/部/盏/天"/>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>图标</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
          <View style={styles.optionRow}>
            {ICON_OPTIONS.map((ic) => (<TouchableOpacity key={ic} onPress={() => setIcon(ic)} style={[styles.iconOption, icon === ic && { backgroundColor: color + '30', borderColor: color }]}>
                <Text style={styles.iconText}>{ic}</Text>
              </TouchableOpacity>))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>颜色</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((c) => (<TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorSelected]}/>))}
        </View>
      </View>

      <View style={styles.buttons}>
        <Button title="取消" onPress={onClose} style={{ marginRight: 8 }}/>
        <Button title="保存" variant="primary" onPress={handleSave}/>
      </View>

      {editPractice && (<TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>删除此课目</Text>
        </TouchableOpacity>)}
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
    optionScroll: {
        marginHorizontal: -4,
    },
    optionRow: {
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 4,
    },
    iconOption: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: 20,
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 8,
    },
    colorSelected: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    buttons: {
        flexDirection: 'row',
        marginTop: 8,
    },
    deleteBtn: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 12,
    },
    deleteText: {
        color: '#ef4444',
        fontSize: 13,
    },
});
