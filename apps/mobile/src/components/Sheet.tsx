import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../theme';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Sheet({ visible, onClose, title, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          {title && <Text style={styles.title}>{title}</Text>}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.78)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#141c30',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: '22px 18px 40px',
    maxHeight: '90%',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    width: '100%',
  },
});
