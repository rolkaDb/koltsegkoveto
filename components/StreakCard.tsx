import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import { Card } from './Card';

/**
 * Két kis kártya egymás mellett: a sorozat, és a mai nap gyors jelölése.
 *
 * A jobb oldali kártya háromféle állapotot vehet fel, mert három
 * különböző dolgot jelent "ma": már könyveltél, jelölted költésmentesnek,
 * vagy még nem történt semmi.
 */
export function StreakCard() {
  const { streak, todayHasEntry, todayNoSpend, toggleNoSpendToday, theme } = useApp();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      <Card style={styles.card}>
        <View style={styles.head}>
          <View style={[styles.bubble, { backgroundColor: theme.fill }]}>
            <Text style={styles.bubbleIcon}>🔥</Text>
          </View>
          <Text style={styles.label}>Sorozat</Text>
        </View>

        <Text style={styles.streakValue}>
          {streak.days} <Text style={styles.streakUnit}>nap</Text>
        </Text>

        <Text style={styles.hint} numberOfLines={2}>
          {streak.days === 0
            ? 'Egy bejegyzés, és indul.'
            : streak.todayLogged
              ? 'Ma is megvan. Szép!'
              : 'Ma még nincs bejegyzésed.'}
        </Text>
      </Card>

      <Pressable
        onPress={todayHasEntry ? undefined : toggleNoSpendToday}
        disabled={todayHasEntry}
        style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
      >
        <Card
          style={[
            styles.card,
            styles.cardFull,
            todayNoSpend && { borderColor: theme.income, borderWidth: 2 },
          ]}
        >
          <View style={styles.head}>
            <View
              style={[
                styles.bubble,
                { backgroundColor: todayNoSpend ? theme.income : theme.fill },
              ]}
            >
              <Text style={styles.bubbleIcon}>{todayNoSpend ? '✓' : '🌱'}</Text>
            </View>
          </View>

          <Text style={styles.actionTitle}>
            {todayHasEntry
              ? 'Ma már könyveltél'
              : todayNoSpend
                ? 'Ma nem költöttél'
                : 'Ma nem költöttem'}
          </Text>

          <Text style={styles.hint} numberOfLines={2}>
            {todayHasEntry
              ? 'A mai nap már számít.'
              : todayNoSpend
                ? 'Koppints a visszavonáshoz.'
                : 'Egy koppintás, és megvan.'}
          </Text>
        </Card>
      </Pressable>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: { opacity: 0.7 },
    row: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: t.gap,
      marginBottom: t.gap,
    },
    cardWrap: {
      flex: 1,
    },
    card: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    cardFull: {
      height: '100%',
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    bubble: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bubbleIcon: { fontSize: 15 },
    label: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: t.labelSecondary,
    },
    streakValue: {
      fontFamily: SERIF.bold,
      fontSize: 26,
      color: t.label,
    },
    streakUnit: {
      fontFamily: SERIF.medium,
      fontSize: 16,
      color: t.labelSecondary,
    },
    actionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: t.label,
    },
    hint: {
      fontSize: 12,
      lineHeight: 16,
      color: t.labelSecondary,
      marginTop: 4,
    },
  });
