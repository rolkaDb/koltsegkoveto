import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { categoriesFor, categoryOf } from '../lib/categories';
import { currentMonth, formatHuf, monthTitle } from '../lib/format';
import { BASE_CURRENCY, roundForCurrency } from '../lib/money';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import type { EntryKind } from '../lib/types';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { Segmented } from '../components/Segmented';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function RecurringScreen() {
  const { recurring, addRecurring, removeRecurring, theme } = useApp();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const [kind, setKind] = useState<EntryKind>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categoriesFor('expense')[0].name);
  const [note, setNote] = useState('');
  const [day, setDay] = useState(1);

  const parsed = parseInt(amount.replace(/\s/g, ''), 10);
  const canAdd = !isNaN(parsed) && parsed > 0;
  const isIncome = kind === 'income';
  const actionColor = isIncome ? theme.income : theme.accent;

  function changeKind(next: EntryKind) {
    setKind(next);
    setCategory(categoriesFor(next)[0].name);
  }

  function submit() {
    if (!canAdd) return;

    addRecurring({
      // Az ismétlődő tételek mindig forintosak, ezért egészre kerekítünk.
      amount: roundForCurrency(parsed, BASE_CURRENCY),
      category,
      note: note.trim(),
      kind,
      dayOfMonth: day,
      start: currentMonth(),
      end: null,
    });

    setAmount('');
    setNote('');
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={14}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>‹ Vissza</Text>
          </Pressable>
          <Text style={styles.title}>Ismétlődő tételek</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Előfizetések, bérleti díj, biztosítás. Minden hónapban magától
            felkerül a megadott napon — visszamenőleg is, a mai naptól
            visszafelé.
          </Text>

          {recurring.length === 0 ? (
            <EmptyState
              icon="🔁"
              title="Még nincs ismétlődő tétel"
              text="Vedd fel az elsőt lent, és onnantól nem kell rá gondolnod."
            />
          ) : (
            recurring.map((rule) => {
              const cat = categoryOf(rule.category, rule.kind);
              const ruleIncome = rule.kind === 'income';
              return (
                <Card key={rule.id} style={styles.ruleCard}>
                  <View
                    style={[
                      styles.bubble,
                      { backgroundColor: theme.dark ? theme.fill : cat.tint },
                    ]}
                  >
                    <Text style={styles.bubbleIcon}>{cat.icon}</Text>
                  </View>

                  <View style={styles.flex}>
                    <Text style={styles.ruleTitle}>{cat.name}</Text>
                    <Text style={styles.ruleMeta} numberOfLines={1}>
                      Minden hó {rule.dayOfMonth}.
                      {rule.note ? ` · ${rule.note}` : ''}
                    </Text>
                    <Text style={styles.ruleSince}>
                      {monthTitle(rule.start)} óta
                    </Text>
                  </View>

                  <Text
                    style={[styles.ruleAmount, ruleIncome && { color: theme.income }]}
                  >
                    {ruleIncome ? '+' : '−'}
                    {formatHuf(rule.amount)}
                  </Text>

                  <Pressable
                    onPress={() => removeRecurring(rule.id)}
                    hitSlop={12}
                    style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
                  >
                    <Text style={styles.deleteText}>×</Text>
                  </Pressable>
                </Card>
              );
            })
          )}

          <Text style={styles.sectionTitle}>Új ismétlődés</Text>

          <Card style={styles.formCard}>
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
                keyboardType="number-pad"
                returnKeyType="done"
              />
              <Text style={styles.currency}>Ft</Text>
            </View>

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
                    <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.dayLabel}>A hónap hányadik napján?</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {DAYS.map((d) => {
                const selected = d === day;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDay(d)}
                    style={({ pressed }) => [
                      styles.dayChip,
                      { backgroundColor: selected ? actionColor : theme.fill },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.dayText, selected && styles.chipTextOn]}>
                      {d}
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
                placeholder="pl. Netflix"
                placeholderTextColor={theme.labelTertiary}
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            </View>

            <Pressable
              onPress={submit}
              disabled={!canAdd}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: canAdd ? actionColor : theme.fill },
                pressed && canAdd && styles.pressed,
              ]}
            >
              <Text style={[styles.addText, !canAdd && styles.addTextOff]}>
                Ismétlődés hozzáadása
              </Text>
            </Pressable>
          </Card>

          <Text style={styles.hint}>
            A rövidebb hónapokban a 29-31. nap az utolsó napra csúszik. Ha
            törölsz egy ismétlődést, a már létrejött tételek megmaradnak —
            azokat a Tételek fülön tudod egyesével eltávolítani.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.65 },
    header: {
      paddingHorizontal: t.gap + 6,
      paddingTop: 4,
      paddingBottom: 10,
    },
    back: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
    },
    backText: {
      fontSize: 16,
      fontWeight: '600',
      color: t.accent,
    },
    title: {
      fontFamily: SERIF.bold,
      fontSize: 28,
      color: t.label,
      marginTop: 4,
    },
    content: {
      paddingBottom: 40,
    },
    intro: {
      fontSize: 14,
      lineHeight: 20,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginBottom: 16,
    },
    ruleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: t.gap,
      marginBottom: 10,
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
    ruleTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: t.label,
    },
    ruleMeta: {
      fontSize: 13,
      color: t.labelSecondary,
      marginTop: 2,
    },
    ruleSince: {
      fontSize: 12,
      color: t.labelTertiary,
      marginTop: 1,
    },
    ruleAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: t.label,
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
    sectionTitle: {
      fontFamily: SERIF.semibold,
      fontSize: 19,
      color: t.label,
      paddingHorizontal: t.gap + 6,
      marginTop: 24,
      marginBottom: 12,
    },
    formCard: {
      marginHorizontal: t.gap,
      paddingHorizontal: t.gap + 2,
      paddingTop: t.gap,
      paddingBottom: t.gap,
    },
    kindSegment: { marginBottom: 4 },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
      marginTop: 4,
    },
    sign: {
      fontFamily: SERIF.bold,
      fontSize: 30,
    },
    amountInput: {
      flex: 1,
      fontFamily: SERIF.bold,
      fontSize: 34,
      color: t.label,
      paddingVertical: 6,
    },
    currency: {
      fontFamily: SERIF.medium,
      fontSize: 19,
      color: t.labelSecondary,
    },
    chipRow: {
      gap: 8,
      paddingBottom: 12,
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
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: t.label,
    },
    chipTextOn: { color: '#FFFFFF' },
    dayLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: t.labelSecondary,
      marginBottom: 8,
    },
    dayChip: {
      minWidth: 40,
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 999,
      alignItems: 'center',
    },
    dayText: {
      fontSize: 14,
      fontWeight: '700',
      color: t.label,
      fontVariant: ['tabular-nums'],
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 46,
      gap: 12,
      marginBottom: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.separator,
    },
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
    addTextOff: {
      color: t.labelTertiary,
    },
    hint: {
      fontSize: 13,
      lineHeight: 19,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginTop: 16,
    },
  });
