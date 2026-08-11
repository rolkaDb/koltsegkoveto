import { StyleSheet, Text, View } from 'react-native';

import { currentMonth, formatHuf, isSameMonth } from '../lib/format';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import { Card } from './Card';

/** Havi egyenleg nagyban, alatta a bevétel/kiadás bontás. */
export function BalanceHeader() {
  const { balance, income, spent, month, theme } = useApp();
  const styles = useThemedStyles(makeStyles);
  const isCurrent = isSameMonth(month, currentMonth());

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>
        Egyenleged ebben a hónapban
        {!isCurrent ? ' · korábbi' : ''}
      </Text>

      <Text style={[styles.total, balance < 0 && { color: theme.negative }]}>
        {formatHuf(balance)}
      </Text>

      <View style={styles.tileRow}>
        <Card style={styles.tile}>
          <Text style={styles.tileLabel}>Bevétel</Text>
          <Text style={[styles.tileValue, { color: theme.income }]}>
            {formatHuf(income)}
          </Text>
        </Card>

        <Card style={styles.tile}>
          <Text style={styles.tileLabel}>Kiadás</Text>
          <Text style={styles.tileValue}>{formatHuf(spent)}</Text>
        </Card>
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: t.gap + 6,
      paddingTop: 10,
      paddingBottom: 16,
    },
    caption: {
      color: t.labelSecondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    total: {
      fontFamily: SERIF.bold,
      color: t.label,
      fontSize: 40,
      marginTop: 2,
    },
    tileRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    tile: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
    },
    tileLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: t.labelSecondary,
    },
    tileValue: {
      fontSize: 17,
      fontWeight: '700',
      color: t.label,
      marginTop: 4,
      fontVariant: ['tabular-nums'],
    },
  });
