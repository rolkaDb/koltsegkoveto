import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { useTheme, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';

/**
 * Minden képernyő közös kerete: háttér-átmenet, biztonságos terület,
 * állapotsáv-szín és opcionális nagy cím.
 *
 * A `edges={['top']}` szándékos - az alsó szegélyt a fülsáv kezeli,
 * különben dupla térköz lenne alul.
 */
export function Screen({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <LinearGradient colors={theme.gradient} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />

        {title ? (
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {action}
          </View>
        ) : null}

        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.gap + 6,
      paddingTop: 6,
      paddingBottom: 10,
    },
    title: {
      fontFamily: SERIF.bold,
      fontSize: 28,
      color: t.label,
    },
  });
