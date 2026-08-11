import { StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';

import { useTheme } from '../../lib/store';

/**
 * Az alsó menüsáv. Az ikonok emojik - így nincs szükség külön
 * ikonkészletre, és minden készüléken egyformán jelennek meg.
 */
export default function TabsLayout() {
  const theme = useTheme();

  const icon = (glyph: string) => {
    const TabIcon = ({ color }: { color: string }) => (
      <Text style={[styles.icon, { color }]}>{glyph}</Text>
    );
    TabIcon.displayName = `TabIcon(${glyph})`;
    return TabIcon;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.labelSecondary,
        tabBarStyle: {
          backgroundColor: theme.dark
            ? 'rgba(20,16,25,0.96)'
            : 'rgba(255,255,255,0.96)',
          borderTopColor: theme.separator,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Kezdőlap', tabBarIcon: icon('🏠') }}
      />
      <Tabs.Screen
        name="entries"
        options={{ title: 'Tételek', tabBarIcon: icon('🧾') }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Statisztika', tabBarIcon: icon('📊') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: icon('👤') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
  },
});
