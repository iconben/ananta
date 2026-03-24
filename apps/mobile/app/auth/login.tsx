import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme';
import { useAuthStore } from '../../src/stores';
import { Button } from '../../src/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    try {
      if (isRegister) {
        await register(email, password, name || undefined);
      } else {
        await login(email, password);
      }
      router.back();
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isRegister ? '注册账号' : '登录'}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.errorDismiss}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>邮箱</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor="rgba(255,255,255,.25)"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>密码</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="密码"
          placeholderTextColor="rgba(255,255,255,.25)"
          secureTextEntry
        />

        {isRegister && (
          <>
            <Text style={styles.label}>法名（可选）</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="你的法名或昵称"
              placeholderTextColor="rgba(255,255,255,.25)"
            />
          </>
        )}

        <Button
          title={isLoading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '登录')}
          onPress={handleSubmit}
          disabled={isLoading}
        />

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
            <Text style={styles.footerLink}>
              {isRegister ? '已有账号？登录' : '没有账号？注册'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: 'rgba(255,255,255,.6)',
    lineHeight: 22,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,80,80,.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ff6b6b',
  },
  errorDismiss: {
    fontSize: 18,
    color: '#ff6b6b',
    paddingLeft: 8,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,.4)',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: '0.1em',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,.05)',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 13,
    color: COLORS.gold,
  },
});
