import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useThemedStyles } from '../lib/store';
import type { Theme } from '../lib/theme';

/** Lágy árnyék. Androidon az `elevation` adja ugyanezt. */
export function cardShadow(t: Theme) {
  return Platform.select({
    ios: {
      shadowColor: t.dark ? '#000000' : '#3A2733',
      shadowOpacity: t.dark ? 0.3 : 0.09,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    default: { elevation: 2 },
  });
}

export function Card({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.card,
      borderRadius: t.radius,
      ...cardShadow(t),
    },
  });
