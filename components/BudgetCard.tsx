import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { formatHuf } from '../lib/format';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import { Card } from './Card';

/**
 * Havi keret és a hozzá mért haladás.
 *
 * Ha nincs beállítva keret, egy halk felhívás jelenik meg, ami a Profil
 * fülre visz - nem tolakodó, de nem is marad rejtve a funkció.
 */
export function BudgetCard() {
  const { settings, spent, theme } = useApp();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const budget = settings.monthlyBudget;

  if (!budget) {
    return (
      <Pressable
        onPress={() => router.push('/profile')}
        style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      >
        <Card style={styles.card}>
          <Text style={styles.emptyTitle}>Állíts be havi keretet</Text>
          <Text style={styles.emptyText}>
            Ha megadsz egy havi célt, itt látod majd, hol tartasz benne.
            Koppints ide a beállításhoz.
          </Text>
        </Card>
      </Pressable>
    );
  }

  const share = spent / budget;
  const over = spent > budget;
  const remaining = budget - spent;
  const barColor = over ? theme.negative : theme.accent;

  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.label}>Havi keret</Text>
          <Text style={[styles.percent, over && { color: theme.negative }]}>
            {Math.round(share * 100)}%
          </Text>
        </View>

        <Text style={styles.amounts}>
          {formatHuf(spent)}
          <Text style={styles.budgetText}> / {formatHuf(budget)}</Text>
        </Text>

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: barColor,
                // Százalék stringként - a RN így érti a relatív szélességet.
                // 100%-nál levágjuk, hogy ne lógjon ki a sávból.
                width: `${Math.min(Math.max(share * 100, 0), 100)}%`,
              },
            ]}
          />
        </View>

        <Text style={[styles.footer, over && { color: theme.negative }]}>
          {over
            ? `${formatHuf(-remaining)} túllépés`
            : `Még ${formatHuf(remaining)} fér bele`}
        </Text>
      </Card>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: { opacity: 0.7 },
    wrap: {
      paddingHorizontal: t.gap,
      marginBottom: t.gap,
    },
    card: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 18,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: t.labelSecondary,
    },
    percent: {
      fontSize: 14,
      fontWeight: '700',
      color: t.label,
      fontVariant: ['tabular-nums'],
    },
    amounts: {
      fontFamily: SERIF.bold,
      fontSize: 24,
      color: t.label,
      marginTop: 6,
    },
    budgetText: {
      fontFamily: SERIF.medium,
      fontSize: 17,
      color: t.labelSecondary,
    },
    track: {
      height: 10,
      borderRadius: 5,
      backgroundColor: t.fill,
      overflow: 'hidden',
      marginTop: 12,
    },
    fill: {
      height: '100%',
      borderRadius: 5,
    },
    footer: {
      fontSize: 13,
      color: t.labelSecondary,
      marginTop: 8,
    },
    emptyTitle: {
      fontFamily: SERIF.semibold,
      fontSize: 17,
      color: t.label,
    },
    emptyText: {
      fontSize: 13,
      lineHeight: 19,
      color: t.labelSecondary,
      marginTop: 4,
    },
  });
