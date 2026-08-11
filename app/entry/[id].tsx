import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { categoriesFor } from '../../lib/categories';
import { formatDateObj } from '../../lib/format';
import { BASE_CURRENCY, parseAmount } from '../../lib/money';
import { useApp, useThemedStyles } from '../../lib/store';
import { SERIF, type Theme } from '../../lib/theme';
import type { EntryKind } from '../../lib/types';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { Segmented } from '../../components/Segmented';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, updateEntry, removeEntry, settings, theme } = useApp();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const entry = entries.find((e) => e.id === id);

  const [kind, setKind] = useState<EntryKind>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState(BASE_CURRENCY);
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(() => new Date());
  const [showPicker, setShowPicker] = useState(false);

  /**
   * Az űrlapot a tétel betöltésekor töltjük fel.
   * A függőség az `entry?.id`, nem maga az `entry`: így a mentés
   * utáni új objektum nem írja felül, amit épp szerkesztesz.
   */
  useEffect(() => {
    if (!entry) return;
    setKind(entry.kind);
    setAmount(String(entry.amount));
    setCategory(entry.category);
    setCurrency(entry.currency ?? BASE_CURRENCY);
    setNote(entry.note);
    setDate(new Date(entry.date));
  }, [entry?.id]);

  if (!entry) {
    return (
      <Screen>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={14}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>‹ Vissza</Text>
          </Pressable>
        </View>

        <EmptyState
          icon="🔍"
          title="Nincs meg a tétel"
          text="Lehet, hogy időközben törölted. Menj vissza a listához."
        />
      </Screen>
    );
  }

  const parsed = parseAmount(amount);
  const isIncome = kind === 'income';
  const actionColor = isIncome ? theme.income : theme.accent;
  const codes = [BASE_CURRENCY, ...settings.currencies.map((c) => c.code)];

  const changed =
    parsed !== null &&
    (parsed !== entry.amount ||
      kind !== entry.kind ||
      category !== entry.category ||
      currency !== (entry.currency ?? BASE_CURRENCY) ||
      note.trim() !== entry.note ||
      date.toISOString() !== entry.date);

  function changeKind(next: EntryKind) {
    setKind(next);
    // A kategórialisták nem fedik egymást, ezért típusváltáskor újat kell választani.
    setCategory(categoriesFor(next)[0].name);
  }

  function save() {
    if (!changed || parsed === null) return;

    updateEntry(entry!.id, {
      amount: parsed,
      kind,
      category,
      note: note.trim(),
      date: date.toISOString(),
      // Forintnál töröljük a mezőt, hogy ne maradjon felesleges adat.
      currency: currency === BASE_CURRENCY ? undefined : currency,
    });

    router.back();
  }

  function confirmDelete() {
    Alert.alert('Tétel törlése', 'Biztosan törlöd ezt a tételt?', [
      { text: 'Mégse', style: 'cancel' },
      {
        text: 'Törlés',
        style: 'destructive',
        onPress: () => {
          removeEntry(entry!.id);
          router.back();
        },
      },
    ]);
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
          <Text style={styles.title}>Tétel szerkesztése</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
                      <Text style={[styles.codeText, selected && styles.chipTextOn]}>
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
                    <Text style={[styles.chipText, selected && styles.chipTextOn]}>
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
              onPress={save}
              disabled={!changed}
              style={({ pressed }) => [
                styles.saveButton,
                { backgroundColor: changed ? actionColor : theme.fill },
                pressed && changed && styles.pressed,
              ]}
            >
              <Text style={[styles.saveText, !changed && styles.saveTextOff]}>
                {changed ? 'Mentés' : 'Nincs módosítás'}
              </Text>
            </Pressable>
          </Card>

          {entry.recurringId && (
            <Text style={styles.hint}>
              Ez a tétel ismétlődő szabályból keletkezett. A módosítás csak
              erre az egy hónapra vonatkozik — a szabály maga változatlan marad.
            </Text>
          )}

          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Text style={[styles.deleteText, { color: theme.negative }]}>
              Tétel törlése
            </Text>
          </Pressable>
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
      paddingBottom: 12,
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
    card: {
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
    chipTextOn: { color: '#FFFFFF' },
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
    saveButton: {
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: 'center',
    },
    saveText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    saveTextOff: {
      color: t.labelTertiary,
    },
    hint: {
      fontSize: 13,
      lineHeight: 19,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginTop: 14,
    },
    deleteButton: {
      alignItems: 'center',
      paddingVertical: 16,
      marginTop: 20,
    },
    deleteText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
