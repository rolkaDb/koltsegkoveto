import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useApp, useThemedStyles } from '../../lib/store';
import type { Theme } from '../../lib/theme';
import { BalanceHeader } from '../../components/BalanceHeader';
import { BudgetCard } from '../../components/BudgetCard';
import { EntryForm } from '../../components/EntryForm';
import { EntryRow } from '../../components/EntryRow';
import { MonthNav } from '../../components/MonthNav';
import { Screen } from '../../components/Screen';
import { StreakCard } from '../../components/StreakCard';

/** Hány tételt mutatunk a kezdőlapon. A teljes lista a Tételek fülön van. */
const RECENT_COUNT = 3;

export default function HomeScreen() {
  const { monthEntries } = useApp();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const recent = monthEntries.slice(0, RECENT_COUNT);

  return (
    <Screen title="Pénztárca">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MonthNav />
          <BalanceHeader />
          <StreakCard />
          <BudgetCard />
          <EntryForm />

          {recent.length > 0 && (
            <View style={styles.recent}>
              <View style={styles.recentHead}>
                <Text style={styles.recentTitle}>Legutóbbi tételek</Text>
                <Pressable
                  onPress={() => router.push('/entries')}
                  hitSlop={10}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.recentLink}>Összes</Text>
                </Pressable>
              </View>

              {recent.map((entry) => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.6 },
    content: {
      paddingBottom: 32,
    },
    recent: {
      marginTop: 24,
    },
    recentHead: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingHorizontal: t.gap + 4,
      marginBottom: 10,
    },
    recentTitle: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: t.labelSecondary,
    },
    recentLink: {
      fontSize: 14,
      fontWeight: '600',
      color: t.accent,
    },
  });
