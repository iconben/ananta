import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/theme';
import { useUserStore } from '../src/stores';
import { Card } from '../src/components/ui/Card';
import { Toggle } from '../src/components/ui/Toggle';
import { Input } from '../src/components/ui/Input';
import { FontScalePicker } from '../src/components/FontScalePicker';
import { AvatarPicker } from '../src/components/AvatarPicker';

const SECTION_TITLE = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const ROW = ({
  label,
  last = false,
  children,
}: {
  label: string;
  last?: boolean;
  children: React.ReactNode;
}) => (
  <View style={[styles.row, !last && styles.rowBorder]}>
    <Text style={styles.rowLabel}>{label}</Text>
    {children}
  </View>
);

const PLACEHOLDER_ROW = ({ label }: { label: string }) => (
  <View style={styles.placeholderRow}>
    <Text style={styles.placeholderText}>{label}</Text>
    <Text style={styles.placeholderBadge}>Phase 2</Text>
  </View>
);

export default function Settings() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();

  const [savedMsg, setSavedMsg] = useState(false);

  const showSaved = useCallback(() => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1500);
  }, []);

  const handleUpdate = useCallback(
    (field: string, value: string | number | boolean) => {
      updateUser({ [field]: value } as any);
      showSaved();
    },
    [updateUser, showSaved]
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>设置</Text>
        {savedMsg && <Text style={styles.savedBadge}>已保存</Text>}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <Card>
          <SECTION_TITLE>👤 个人信息</SECTION_TITLE>

          {/* Avatar preview */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarPreview}>
              <Text style={styles.avatarChar}>{user.avatar}</Text>
            </View>
            <View style={styles.avatarPickerWrap}>
              <Text style={styles.fieldLabel}>选择头像字</Text>
              <AvatarPicker value={user.avatar} onChange={(v) => handleUpdate('avatar', v)} />
            </View>
          </View>

          {/* Name */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>法名 / 显示名称</Text>
            <Input
              placeholder="你的法名或昵称…"
              value={user.name}
              onChangeText={(v) => handleUpdate('name', v)}
              maxLength={20}
            />
          </View>

          {/* Bio */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>个人简介（可选）</Text>
            <Input
              placeholder="一句话介绍自己…"
              value={user.bio}
              onChangeText={(v) => handleUpdate('bio', v)}
              maxLength={100}
              multiline
            />
          </View>
        </Card>

        {/* Font Scale */}
        <Card>
          <SECTION_TITLE>🔤 字号大小</SECTION_TITLE>
          <FontScalePicker value={user.fontScale} onChange={(v) => handleUpdate('fontScale', v)} />
        </Card>

        {/* Privacy */}
        <Card>
          <SECTION_TITLE>🔒 隐私设置</SECTION_TITLE>
          <ROW label="修持数据是否公开">
            <Toggle
              value={user.dataPublic}
              onValueChange={(v) => handleUpdate('dataPublic', v)}
            />
          </ROW>
          <ROW label="是否出现在排行榜">
            <Toggle
              value={user.inRanking}
              onValueChange={(v) => handleUpdate('inRanking', v)}
            />
          </ROW>
          <ROW label="是否允许陌生人发送好友申请" last>
            <Toggle
              value={user.allowFriendReq}
              onValueChange={(v) => handleUpdate('allowFriendReq', v)}
            />
          </ROW>
        </Card>

        {/* Account */}
        <Card>
          <SECTION_TITLE>🔑 账号</SECTION_TITLE>
          <PLACEHOLDER_ROW label="绑定邮箱" />
          <PLACEHOLDER_ROW label="修改密码" />
          <PLACEHOLDER_ROW label="数据导出" />
          <PLACEHOLDER_ROW label="退出登录" />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
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
  headerTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: COLORS.text,
    flex: 1,
  },
  savedBadge: {
    fontSize: 12,
    color: COLORS.gold,
    backgroundColor: 'rgba(240,192,64,.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: '0.18em',
    color: 'rgba(240,192,64,.6)',
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(240,192,64,.2)',
    borderWidth: 2,
    borderColor: 'rgba(240,192,64,.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarChar: {
    fontSize: 26,
    fontWeight: 700,
    color: COLORS.gold,
  },
  avatarPickerWrap: {
    flex: 1,
  },
  fieldWrap: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,.4)',
    marginBottom: 6,
    letterSpacing: '0.12em',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,.05)',
  },
  rowLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,.7)',
    flex: 1,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,.05)',
  },
  placeholderText: {
    fontSize: 14,
    color: 'rgba(255,255,255,.3)',
  },
  placeholderBadge: {
    fontSize: 10,
    color: 'rgba(255,255,255,.2)',
    backgroundColor: 'rgba(255,255,255,.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
