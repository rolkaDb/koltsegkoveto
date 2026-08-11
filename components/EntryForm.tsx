import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { categoriesFor } from '../lib/categories';
import { formatDateObj } from '../lib/format';
import { BASE_CURRENCY, parseAmount } from '../lib/money';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import type { EntryKind } from '../lib/types';
import { Card } from './Card';
import { Segmented } from './Segmented';

export function EntryForm() {
  const { addEntry, month, settings, theme } = useApp();
  const styles = useThemedStyles(makeStyles);

  const [kind, setKind] = useState<EntryKind>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categoriesFor('expense')[0].name);
  const [currency, setCurrency] = useState(BASE_CURRENCY);
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(() => new Date());
  const [showPicker, setShowPicker] = useState(false);

  /**
   * Ha másik hónapra lapozol, az űrlap dátuma is odaköltözik.
   * Így a "júniust nézem, tehát júniusba rögzítek" elvárás magától teljesül.
   * A mai hónapnál a mai napot ajánljuk, egyébként a hónap első napját.
   *
   * A függőség szándékosan a két szám, nem a `month` objektum:
   * így nem fut le újra, ha ugyanarra a hónapra állítjuk be újból.
   */
  useEffect(() => {
    const today = new Date();
    const isCurrent =
      today.getFullYear() === month.year && today.getMonth() === month.month;

    setDate(isCurrent ? today : new Date(month.year, month.month, 1));
  }, [month.year, month.month]);

  const parsedAmount = parseAmount(amount);
  const canAdd = parsedAmount !== null;
  const isIncome = kind === 'income';
  const actionColor = isIncome ? theme.income : theme.accent;

  // A HUF mindig van; a többi a beállításokból jön.
  const codes = [BASE_CURRENCY, ...settings.currencies.map((c) => c.code)];

  /** Típusváltáskor a kategória is a másik listára ugrik. */
  function changeKind(next: EntryKind) {
    setKind(next);
    setCategory(categoriesFor(next)[0].name);
  }

  function submit() {
    if (parsedAmount === null) return;

    addEntry({
      amount: parsedAmount,
      category,
      note: note.trim(),
      date: date.toISOString(),
      kind,
      // Forintnál nem tárolunk pénznemet - az az alapértelmezés.
      ...(currency !== BASE_CURRENCY ? { currency } : {}),
    });

    setAmount('');
    setNote('');
  }

  return (
    <Card style={styles.card}>
      <Segmented
        value={kind}
        onChange={changeKind}
        style={styles.kindSegment}
        options={[
          { value: 'expense', label: 'Kiadás', color: theme.accent },
          { value: 'income', label: 'Bevétel', color: theme.income },
        ]}
      />

      <View style={styles.amountRow}>
        <Text style={[styles.sign, { color: actionColor }]}>
          {isIncome ? '+' : '−'}
        </Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={theme.labelTertiary}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        <Text style={styles.currency}>
          {currency === BASE_CURRENCY ? 'Ft' : currency}
        </Text>
      </View>

      {/* A pénznemsor csak akkor jelenik meg, ha van mi közül választani. */}
      {codes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {codes.map((code) => {
            const selected = code === currency;
            return (
              <Pressable
                key={code}
                onPress={() => setCurrency(code)}
                style={({ pressed }) => [
                  styles.codeChip,
                  { backgroundColor: selected ? actionColor : theme.fill },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.codeText, selected && styles.chipTextSelected]}>
                  {code}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {categoriesFor(kind).map((c) => {
          const selected = c.name === category;
          const tint = theme.dark ? theme.fill : c.tint;
          return (
            <Pressable
              key={c.name}
              onPress={() => setCategory(c.name)}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: selected ? actionColor : tint },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.chipIcon}>{c.icon}</Text>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Megjegyzés</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="nem kötelező"
          placeholderTextColor={theme.labelTertiary}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      <View style={[styles.fieldRow, styles.fieldRowLast]}>
        <Text style={styles.fieldLabel}>Dátum</Text>

        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={date}
            mode="date"
            display="compact"
            locale="hu-HU"
            themeVariant={theme.dark ? 'dark' : 'light'}
            accentColor={actionColor}
            onChange={(_, picked) => picked && setDate(picked)}
          />
        ) : (
          <Pressable onPress={() => setShowPicker(true)} hitSlop={8}>
            <Text style={[styles.dateValue, { color: actionColor }]}>
              {formatDateObj(date)}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Androidon a választó felugró ablak, ezért külön kell megnyitni. */}
      {showPicker && Platform.OS !== 'ios' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, picked) => {
            setShowPicker(false);
            if (picked) setDate(picked);
          }}
        />
      )}

      <Pressable
        onPress={submit}
        disabled={!canAdd}
        style={({ pressed }) => [
          styles.addButton,
          { backgroundColor: canAdd ? actionColor : theme.fill },
          pressed && canAdd && styles.pressed,
        ]}
      >
        <Text style={[styles.addText, !canAdd && styles.addTextDisabled]}>
          {isIncome ? 'Bevétel hozzáadása' : 'Kiadás hozzáadása'}
        </Text>
      </Pressable>
    </Card>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: { opacity: 0.65 },
    card: {
      marginHorizontal: t.gap,
      paddingHorizontal: t.gap + 2,
      paddingTop: t.gap,
      paddingBottom: t.gap,
    },
    kindSegment: {
      marginBottom: 4,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
      marginTop: 4,
    },
    sign: {
      fontFamily: SERIF.bold,
      fontSize: 32,
    },
    amountInput: {
      flex: 1,
      fontFamily: SERIF.bold,
      fontSize: 38,
      color: t.label,
      paddingVertical: 6,
    },
    currency: {
      fontFamily: SERIF.medium,
      fontSize: 20,
      color: t.labelSecondary,
    },
    chipRow: {
      gap: 8,
      paddingBottom: 14,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
    },
    chipIcon: { fontSize: 14 },
    codeChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },
    codeText: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: t.label,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: t.label,
    },
    chipTextSelected: { color: '#FFFFFF' },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 46,
      gap: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.separator,
    },
    fieldRowLast: { marginBottom: 10 },
    fieldLabel: {
      fontSize: 16,
      color: t.labelSecondary,
    },
    noteInput: {
      flex: 1,
      fontSize: 16,
      color: t.label,
      textAlign: 'right',
    },
    dateValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    addButton: {
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: 'center',
    },
    addText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    addTextDisabled: {
      color: t.labelTertiary,
    },
  });
