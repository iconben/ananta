import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../src/theme';
import { usePracticeStore } from '../../src/stores';

export default function OnboardingComplete() {
  const router = useRouter();
  const { seedIfEmpty } = usePracticeStore();

  useEffect(() => {
    // Seed default practices and mark onboarding complete
    seedIfEmpty();
    AsyncStorage.setItem('onboarding-complete', 'true');
  }, []);

  const handleEnter = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🪷</Text>
        <Text style={styles.title}>欢迎加入无量</Text>
        <Text style={styles.subtitle}>
          你的默认课目已创建完成{'\n'}开始在修行路上积累无量吧
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleEnter} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>进入无量</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
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
