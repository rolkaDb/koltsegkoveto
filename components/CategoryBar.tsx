import { StyleSheet, Text, View } from 'react-native';

import { categoryOf } from '../lib/categories';
import { formatHuf } from '../lib/format';
import { useApp, useThemedStyles } from '../lib/store';
import type { CategorySum } from '../lib/store';
import type { Theme } from '../lib/theme';
import { Card } from './Card';

/** Egy kategória havi összege sávdiagrammal és részaránnyal. */
export function CategoryBar({ item }: { item: CategorySum }) {
  const { theme } = useApp();
  const styles = useThemedStyles(makeStyles);

  const cat = categoryOf(item.name, 'expense');
  const bubbleTint = theme.dark ? theme.fill : cat.tint;

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.bubble, { backgroundColor: bubbleTint }]}>
          <Text style={styles.bubbleIcon}>{cat.icon}</Text>
        </View>
        <Text style={[styles.name, styles.flex]}>{cat.name}</Text>
        <Text style={styles.amount}>{formatHuf(item.sum)}</Text>
      </View>

      <View style={styles.barRow}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              // Százalék stringként - a RN így érti a relatív szélességet.
              { width: `${Math.max(item.share * 100, 2)}%` },
            ]}
          />
        </View>
        <Text style={styles.share}>{Math.round(item.share * 100)}%</Text>
      </View>
    </Card>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      marginHorizontal: t.gap,
      marginBottom: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    bubble: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bubbleIcon: { fontSize: 18 },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: t.label,
    },
    amount: {
      fontSize: 16,
      fontWeight: '700',
      color: t.label,
      fontVariant: ['tabular-nums'],
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 12,
    },
    track: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.fill,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: t.accent,
    },
    share: {
      fontSize: 13,
      fontWeight: '600',
      color: t.labelSecondary,
      width: 40,
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    },
  });
