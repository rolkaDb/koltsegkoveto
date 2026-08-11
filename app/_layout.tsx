import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import {
  useFonts,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

import { AppProvider, useApp } from '../lib/store';

/**
 * A gyökér elrendezés. Itt töltjük be a betűket, és itt kerül fel
 * a közös állapot, amit minden fül lát.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  return (
    <SafeAreaProvider>
      <AppProvider>
        <Gate fontsLoaded={fontsLoaded}>
          <Stack screenOptions={{ headerShown: false }} />
        </Gate>
      </AppProvider>
    </SafeAreaProvider>
  );
}

/**
 * Amíg a betűk vagy a mentett adatok töltődnek, ne villanjon be a felület.
 * A `useApp` miatt ez már a providereken belül van.
 */
function Gate({
  fontsLoaded,
  children,
}: {
  fontsLoaded: boolean;
  children: ReactNode;
}) {
  const { loaded, theme } = useApp();

  if (!fontsLoaded || !loaded) {
    return (
      <LinearGradient colors={theme.gradient} style={styles.center}>
        <ActivityIndicator size="large" color={theme.accent} />
      </LinearGradient>
    );
  }

  return <View style={styles.flex}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
