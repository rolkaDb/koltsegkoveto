import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useApp, useThemedStyles } from '../../lib/store';
import type { Theme } from '../../lib/theme';
import { AppearancePanel } from '../../components/AppearancePanel';
import { BackupPanel } from '../../components/BackupPanel';
import { BudgetSetting } from '../../components/BudgetSetting';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';

export default function ProfileScreen() {
  const { entries, appearance, streak, recurring, settings } = useApp();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const incomeCount = entries.filter((e) => e.kind === 'income').length;
  const expenseCount = entries.length - incomeCount;

  return (
    <Screen title="Profil">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Összes tétel</Text>
            <Text style={styles.statValue}>{entries.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Ebből kiadás</Text>
            <Text style={styles.statValue}>{expenseCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Ebből bevétel</Text>
            <Text style={styles.statValue}>{incomeCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Jelenlegi sorozat</Text>
            <Text style={styles.statValue}>{streak.days} nap</Text>
          </View>
          <View style={[styles.statRow, styles.statRowLast]}>
            <Text style={styles.statLabel}>Színvilág</Text>
            <Text style={styles.statValue}>{appearance.palette}</Text>
          </View>
        </Card>

        <Pressable
          onPress={() => router.push('/recurring')}
          style={({ pressed }) => [styles.linkWrap, pressed && styles.pressed]}
        >
          <Card style={styles.linkCard}>
            <Text style={styles.linkIcon}>🔁</Text>
            <View style={styles.flex}>
              <Text style={styles.linkTitle}>Ismétlődő tételek</Text>
              <Text style={styles.linkSub}>
                {recurring.length === 0
                  ? 'Előfizetések, bérleti díj'
                  : `${recurring.length} beállítva`}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => router.push('/currencies')}
          style={({ pressed }) => [styles.linkWrap, pressed && styles.pressed]}
        >
          <Card style={styles.linkCard}>
            <Text style={styles.linkIcon}>💱</Text>
            <View style={styles.flex}>
              <Text style={styles.linkTitle}>Pénznemek</Text>
              <Text style={styles.linkSub}>
                {settings.currencies.length === 0
                  ? 'Csak forint'
                  : `HUF + ${settings.currencies.map((c) => c.code).join(', ')}`}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Card>
        </Pressable>

        <BudgetSetting />
        <BackupPanel />
        <AppearancePanel />
      </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: {
      paddingBottom: 40,
    },
    pressed: { opacity: 0.7 },
    linkWrap: {
      marginBottom: 24,
    },
    linkCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: t.gap,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    linkIcon: { fontSize: 22 },
    linkTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: t.label,
    },
    linkSub: {
      fontSize: 13,
      color: t.labelSecondary,
      marginTop: 2,
    },
    chevron: {
      fontSize: 24,
      color: t.labelTertiary,
    },
    statsCard: {
      marginHorizontal: t.gap,
      marginBottom: 24,
      paddingHorizontal: t.gap,
      paddingVertical: 4,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.separator,
    },
    statRowLast: {
      borderBottomWidth: 0,
    },
    statLabel: {
      fontSize: 16,
      color: t.labelSecondary,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: t.label,
      fontVariant: ['tabular-nums'],
    },
  });
