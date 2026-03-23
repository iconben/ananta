import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Button } from './ui/Button';
export function ConfirmDialog({ visible, message, onOk, onCancel }) {
    if (!visible)
        return null;
    return (<Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <Button title="取消" onPress={onCancel} style={{ marginRight: 8 }}/>
            <Button title="确定" variant="primary" onPress={onOk}/>
          </View>
        </View>
      </View>
    </Modal>);
}
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dialog: {
        backgroundColor: '#141c30',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.12)',
        borderRadius: 16,
        padding: '24px 20px',
        width: '100%',
        maxWidth: 340,
    },
    message: {
        fontSize: 14,
        color: '#e5dcc8',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    buttons: {
        flexDirection: 'row',
    },
});
