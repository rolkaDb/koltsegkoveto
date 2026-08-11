import { Pressable, StyleSheet, Text, View } from 'react-native';

import { currentMonth, monthTitle, shiftMonth } from '../lib/format';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';

/**
 * Hónapléptető. A kiválasztott hónap a közös állapotban él,
 * ezért minden fülön ugyanazt mutatja.
 * A hónap nevére koppintva a mai hónapra ugrunk vissza.
 */
export function MonthNav() {
  const { month, setMonth } = useApp();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => setMonth(shiftMonth(month, -1))}
        hitSlop={14}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.arrow}>‹</Text>
      </Pressable>

      <Pressable onPress={() => setMonth(currentMonth())} hitSlop={10}>
        <Text style={styles.label}>{monthTitle(month)}</Text>
      </Pressable>

      <Pressable
        onPress={() => setMonth(shiftMonth(month, 1))}
        hitSlop={14}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.arrow}>›</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.gap + 6,
    },
    button: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { opacity: 0.6 },
    arrow: {
      color: t.accent,
      fontSize: 28,
      lineHeight: 32,
    },
    label: {
      fontFamily: SERIF.semibold,
      color: t.label,
      fontSize: 21,
    },
  });
