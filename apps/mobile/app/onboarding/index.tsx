import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme';
import { AvatarPicker } from '../../src/components/AvatarPicker';
import { useUserStore } from '../../src/stores';

const { width } = Dimensions.get('window');

const WELCOME_FEATURES = [
  { icon: '🪷', text: '记录功课，积累无量' },
  { icon: '🏮', text: '发起或参与共修' },
  { icon: '🙏', text: '与善友互相随喜' },
];

export default function OnboardingWelcome() {
  const router = useRouter();
  const { user, updateUser, initAnonymousUser } = useUserStore();
  const [step, setStep] = useState<'welcome' | 'avatar'>('welcome');

  const handleNext = () => {
    if (step === 'welcome') {
      setStep('avatar');
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    updateUser({ avatar });
  };

  const handleContinue = () => {
    initAnonymousUser();
    router.replace('/onboarding/privacy');
  };

  if (step === 'avatar') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>选择你的头像字</Text>
          <Text style={styles.subtitle}>这是你在无量中的标识</Text>

          <View style={styles.avatarPreview}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarChar}>{user.avatar}</Text>
            </View>
          </View>

          <AvatarPicker value={user.avatar} onChange={handleAvatarSelect} />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>继续</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.appName}>无量</Text>
        <Text style={styles.appSub}>Ananta</Text>
        <Text style={styles.tagline}>数而超越数，积累无量</Text>

        <View style={styles.features}>
          {WELCOME_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>开始</Text>
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
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 4,
  },
  appSub: {
    fontSize: 20,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,.4)',
    marginBottom: 48,
  },
  features: {
    alignSelf: 'stretch',
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',
    borderRadius: 12,
    padding: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.text,
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 32,
    textAlign: 'center',
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(240,192,64,.2)',
    borderWidth: 3,
    borderColor: 'rgba(240,192,64,.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChar: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.gold,
  },
});
