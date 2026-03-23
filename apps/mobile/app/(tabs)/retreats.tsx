import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../src/theme';

export default function RetreatsTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>共修</Text>
      <Text style={styles.subtitle}>待实现 (Phase 3)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gold,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});
