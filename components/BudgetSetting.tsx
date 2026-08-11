import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatHuf } from '../lib/format';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import { Card } from './Card';

/** A Profil fül "Havi keret" szakasza. */
export function BudgetSetting() {
  const { settings, setMonthlyBudget, theme } = useApp();
  const styles = useThemedStyles(makeStyles);

  const [draft, setDraft] = useState('');

  // A mentett érték betöltésekor (vagy külső változásakor) frissítjük a mezőt.
  useEffect(() => {
    setDraft(settings.monthlyBudget ? String(settings.monthlyBudget) : '');
  }, [settings.monthlyBudget]);

  const parsed = parseInt(draft.replace(/\s/g, ''), 10);
  const valid = !isNaN(parsed) && parsed > 0;
  const changed = valid && parsed !== settings.monthlyBudget;

  return (
    <View>
      <Text style={styles.sectionTitle}>Havi keret</Text>

      <Text style={styles.intro}>
        Mennyit szeretnél havonta költeni? A Kezdőlapon látod majd, hol tartasz
        benne. Nem tiltás, csak visszajelzés.
      </Text>

      <Card style={styles.card}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="0"
            placeholderTextColor={theme.labelTertiary}
            keyboardType="number-pad"
            returnKeyType="done"
          />
          <Text style={styles.currency}>Ft</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => setMonthlyBudget(parsed)}
            disabled={!changed}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: changed ? theme.accent : theme.fill },
              pressed && changed && styles.pressed,
            ]}
          >
            <Text style={[styles.buttonText, !changed && styles.buttonTextOff]}>
              Mentés
            </Text>
          </Pressable>

          {settings.monthlyBudget !== null && (
            <Pressable
              onPress={() => setMonthlyBudget(null)}
              style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
            >
              <Text style={[styles.clearText, { color: theme.negative }]}>
                Törlés
              </Text>
            </Pressable>
          )}
        </View>
      </Card>

      <Text style={styles.hint}>
        {settings.monthlyBudget
          ? `Jelenlegi keret: ${formatHuf(settings.monthlyBudget)}`
          : 'Jelenleg nincs beállítva keret.'}
      </Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: { opacity: 0.7 },
    sectionTitle: {
      fontFamily: SERIF.semibold,
      fontSize: 19,
      color: t.label,
      paddingHorizontal: t.gap + 6,
      marginBottom: 8,
    },
    intro: {
      fontSize: 14,
      lineHeight: 20,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginBottom: 14,
    },
    card: {
      marginHorizontal: t.gap,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 18,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    input: {
      flex: 1,
      fontFamily: SERIF.bold,
      fontSize: 30,
      color: t.label,
      paddingVertical: 4,
    },
    currency: {
      fontFamily: SERIF.medium,
      fontSize: 18,
      color: t.labelSecondary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 14,
    },
    button: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    buttonTextOff: {
      color: t.labelTertiary,
    },
    clear: {
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    clearText: {
      fontSize: 15,
      fontWeight: '600',
    },
    hint: {
      fontSize: 13,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginTop: 10,
      marginBottom: 24,
    },
  });
