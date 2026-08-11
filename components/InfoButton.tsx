import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';

/**
 * Kis "i" gomb a kártyák sarkába, hozzá tartozó lenyíló magyarázattal.
 *
 * A nyitott állapotot a hívó tartja (`useState`), mert a panel a kártya
 * alján jelenik meg, a gomb pedig felül - két külön helyen kell tudni róla.
 */
export function InfoButton({
  open,
  onToggle,
  label = 'Mit jelent ez?',
}: {
  open: boolean;
  onToggle: () => void;
  label?: string;
}) {
  const { theme } = useApp();
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={14}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        open && { backgroundColor: theme.accent },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.icon, open && styles.iconOpen]}>i</Text>
    </Pressable>
  );
}

/** A lenyíló magyarázat kerete. A gyerekelemek közé automatikus térköz kerül. */
export function InfoPanel({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.panel}>{children}</View>;
}

/** Egy bekezdés a magyarázatban. */
export function InfoText({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={styles.text}>{children}</Text>;
}

/** Kiemelt szövegrész a bekezdésen belül. */
export function InfoStrong({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={styles.strong}>{children}</Text>;
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: { opacity: 0.6 },
    button: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.fill,
    },
    icon: {
      fontFamily: SERIF.bold,
      fontSize: 14,
      lineHeight: 18,
      color: t.labelSecondary,
    },
    iconOpen: {
      color: '#FFFFFF',
    },
    panel: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.separator,
      gap: 8,
    },
    text: {
      fontSize: 13,
      lineHeight: 19,
      color: t.labelSecondary,
    },
    strong: {
      fontWeight: '700',
      color: t.label,
    },
  });
