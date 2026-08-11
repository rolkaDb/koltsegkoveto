import { useState } from 'react';
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
import { useRouter } from 'expo-router';

import { formatHuf } from '../lib/format';
import { BASE_CURRENCY, isValidCode, parseAmount, type Currency } from '../lib/money';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';

export default function CurrenciesScreen() {
  const {
    entries,
    settings,
    addCurrency,
    updateCurrencyRate,
    removeCurrency,
    theme,
  } = useApp();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const [code, setCode] = useState('');
  const [rate, setRate] = useState('');

  const upper = code.trim().toUpperCase();
  const parsedRate = parseAmount(rate);
  const exists = settings.currencies.some((c) => c.code === upper);
  const canAdd =
    isValidCode(upper) && upper !== BASE_CURRENCY && !exists && parsedRate !== null;

  function submit() {
    if (!canAdd || parsedRate === null) return;
    addCurrency(upper, parsedRate);
    setCode('');
    setRate('');
  }

  function confirmRemove(currency: Currency) {
    const used = entries.filter((e) => e.currency === currency.code).length;

    const detail =
      used > 0
        ? `\n\n${used} tételed használja ezt a pénznemet. Azok megmaradnak, de ` +
          'az összesítésekben 1:1 árfolyammal szerepelnének — vagyis torz ' +
          'értéket adnának. Előbb érdemes átírnod őket.'
        : '';

    Alert.alert('Pénznem törlése', `Törlöd a(z) ${currency.code} pénznemet?${detail}`, [
      { text: 'Mégse', style: 'cancel' },
      {
        text: 'Törlés',
        style: 'destructive',
        onPress: () => removeCurrency(currency.code),
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
          <Text style={styles.title}>Pénznemek</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            A forint az alap: minden összesítés forintban készül. A többi
            pénznemhez add meg, hogy egy egység hány forintot ér.
          </Text>

          <Card style={styles.baseCard}>
            <View style={styles.baseTop}>
              <Text style={styles.baseCode}>HUF</Text>
              <Text style={styles.baseTag}>Alap pénznem</Text>
            </View>
            <Text style={styles.baseNote}>
              Ez nem módosítható — köré épül minden számítás.
            </Text>
          </Card>

          {settings.currencies.map((currency) => (
            <CurrencyRow
              key={currency.code}
              currency={currency}
              styles={styles}
              accent={theme.accent}
              negative={theme.negative}
              placeholderColor={theme.labelTertiary}
              onRate={(value) => updateCurrencyRate(currency.code, value)}
              onRemove={() => confirmRemove(currency)}
            />
          ))}

          <Text style={styles.sectionTitle}>Új pénznem</Text>

          <Card style={styles.addCard}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Kód (ISO 4217)</Text>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                placeholder="EUR"
                placeholderTextColor={theme.labelTertiary}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={3}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>1 egység hány forint</Text>
              <TextInput
                style={styles.rateInput}
                value={rate}
                onChangeText={setRate}
                placeholder="410"
                placeholderTextColor={theme.labelTertiary}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            </View>

            <Pressable
              onPress={submit}
              disabled={!canAdd}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: canAdd ? theme.accent : theme.fill },
                pressed && canAdd && styles.pressed,
              ]}
            >
              <Text style={[styles.addText, !canAdd && styles.addTextOff]}>
                Hozzáadás
              </Text>
            </Pressable>

            {upper.length > 0 && !isValidCode(upper) && (
              <Text style={[styles.warning, { color: theme.negative }]}>
                A kód pontosan három betű, például EUR vagy USD.
              </Text>
            )}
            {exists && (
              <Text style={[styles.warning, { color: theme.negative }]}>
                Ez a pénznem már szerepel a listában.
              </Text>
            )}
          </Card>

          <Text style={styles.hint}>
            Az árfolyamot kézzel adod meg, és az app nem frissíti magától. Ez
            szándékos: így egy régi hónap összesítése nem változik meg
            visszamenőleg attól, hogy közben mozdult az árfolyam. Ha pontosítani
            szeretnél, bármikor átírhatod.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Egy pénznem sora. Saját vázlatállapotot tart, hogy gépelés közben ne mentsünk. */
function CurrencyRow({
  currency,
  styles,
  accent,
  negative,
  placeholderColor,
  onRate,
  onRemove,
}: {
  currency: Currency;
  styles: ReturnType<typeof makeStyles>;
  accent: string;
  negative: string;
  placeholderColor: string;
  onRate: (value: number) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(String(currency.rate));

  function commit() {
    const value = parseAmount(draft);
    if (value === null) {
      setDraft(String(currency.rate)); // érvénytelen érték: visszaáll
      return;
    }
    onRate(value);
  }

  return (
    <Card style={styles.rowCard}>
      <View style={styles.rowTop}>
        <Text style={styles.rowCode}>{currency.code}</Text>

        <Pressable
          onPress={onRemove}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={[styles.removeText, { color: negative }]}>Törlés</Text>
        </Pressable>
      </View>

      <View style={styles.rateRow}>
        <Text style={styles.rateLabel}>1 {currency.code} =</Text>
        <TextInput
          style={[styles.rowRateInput, { color: accent }]}
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
          placeholder="0"
          placeholderTextColor={placeholderColor}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        <Text style={styles.rateLabel}>Ft</Text>
      </View>

      <Text style={styles.rowExample}>
        Például 100 {currency.code} = {formatHuf(100 * currency.rate)}
      </Text>
    </Card>
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
    content: { paddingBottom: 40 },
    intro: {
      fontSize: 14,
      lineHeight: 20,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginBottom: 16,
    },
    baseCard: {
      marginHorizontal: t.gap,
      marginBottom: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 18,
    },
    baseTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    baseCode: {
      fontFamily: SERIF.bold,
      fontSize: 20,
      color: t.label,
    },
    baseTag: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: t.accent,
    },
    baseNote: {
      fontSize: 13,
      color: t.labelSecondary,
      marginTop: 4,
    },
    rowCard: {
      marginHorizontal: t.gap,
      marginBottom: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 18,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowCode: {
      fontFamily: SERIF.bold,
      fontSize: 20,
      color: t.label,
    },
    removeText: {
      fontSize: 14,
      fontWeight: '600',
    },
    rateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 10,
    },
    rateLabel: {
      fontSize: 16,
      color: t.labelSecondary,
    },
    rowRateInput: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    },
    rowExample: {
      fontSize: 12,
      color: t.labelTertiary,
      marginTop: 6,
    },
    sectionTitle: {
      fontFamily: SERIF.semibold,
      fontSize: 19,
      color: t.label,
      paddingHorizontal: t.gap + 6,
      marginTop: 24,
      marginBottom: 12,
    },
    addCard: {
      marginHorizontal: t.gap,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 18,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 50,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.separator,
    },
    fieldLabel: {
      fontSize: 15,
      color: t.labelSecondary,
    },
    codeInput: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 1,
      color: t.label,
      textAlign: 'right',
      minWidth: 80,
    },
    rateInput: {
      fontSize: 18,
      fontWeight: '700',
      color: t.label,
      textAlign: 'right',
      minWidth: 80,
      fontVariant: ['tabular-nums'],
    },
    addButton: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 14,
      marginBottom: 8,
    },
    addText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    addTextOff: {
      color: t.labelTertiary,
    },
    warning: {
      fontSize: 13,
      marginBottom: 10,
    },
    hint: {
      fontSize: 13,
      lineHeight: 19,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginTop: 16,
    },
  });
