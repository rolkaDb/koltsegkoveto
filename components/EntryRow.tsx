import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { categoryOf } from '../lib/categories';
import { formatDayShort, formatHuf } from '../lib/format';
import { BASE_CURRENCY, formatMoney, toBase } from '../lib/money';
import { useApp, useThemedStyles } from '../lib/store';
import type { Theme } from '../lib/theme';
import type { Entry } from '../lib/types';
import { Card } from './Card';

/**
 * Egy tétel a listában. A sorra koppintva megnyílik a szerkesztő,
 * a jobb szélső × pedig azonnal töröl.
 *
 * A törlőgomb saját `Pressable`, ezért a rá érkező koppintás nem
 * jut el a külső, szerkesztésre navigáló felülethez.
 */
export function EntryRow({ entry }: { entry: Entry }) {
  const { removeEntry, settings, theme } = useApp();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const cat = categoryOf(entry.category, entry.kind);
  const isIncome = entry.kind === 'income';
  const code = entry.currency ?? BASE_CURRENCY;
  const isForeign = code !== BASE_CURRENCY;

  // Sötét témán a pasztell buborékok elvesznének, ezért ott semlegesre váltunk.
  const bubbleTint = theme.dark ? theme.fill : cat.tint;

  return (
    <Pressable
      onPress={() => router.push(`/entry/${entry.id}`)}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <Card style={styles.row}>
        <View style={[styles.bubble, { backgroundColor: bubbleTint }]}>
          <Text style={styles.bubbleIcon}>{cat.icon}</Text>
        </View>

        <View style={styles.flex}>
          <Text style={styles.title}>{cat.name}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {formatDayShort(entry.date)}
            {entry.note ? ` · ${entry.note}` : ''}
            {entry.recurringId ? ' · 🔁' : ''}
          </Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={[styles.amount, isIncome && { color: theme.income }]}>
            {isIncome ? '+' : '−'}
            {formatMoney(entry.amount, code)}
          </Text>

          {/* Idegen pénznemnél a forintos megfelelő is látszik. */}
          {isForeign && (
            <Text style={styles.converted}>
              ≈ {formatHuf(toBase(entry.amount, code, settings.currencies))}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => removeEntry(entry.id)}
          hitSlop={12}
          style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
        >
          <Text style={styles.deleteText}>×</Text>
        </Pressable>
      </Card>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.6 },
    wrap: {
      marginHorizontal: t.gap,
      marginBottom: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    bubble: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bubbleIcon: { fontSize: 18 },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: t.label,
    },
    meta: {
      fontSize: 13,
      color: t.labelSecondary,
      marginTop: 2,
    },
    amountBox: {
      alignItems: 'flex-end',
    },
    amount: {
      fontSize: 16,
      fontWeight: '700',
      color: t.label,
      fontVariant: ['tabular-nums'],
    },
    converted: {
      fontSize: 12,
      color: t.labelSecondary,
      marginTop: 1,
      fontVariant: ['tabular-nums'],
    },
    delete: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: t.fill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteText: {
      fontSize: 16,
      lineHeight: 18,
      color: t.labelSecondary,
    },
  });
