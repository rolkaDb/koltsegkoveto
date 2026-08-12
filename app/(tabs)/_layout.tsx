import { StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';

import { useTheme } from '../../lib/store';

/**
 * Ikonkomponens egy emojiból.
 *
 * Modulszinten hívjuk, nem a renderben: ha a komponens a render törzsében
 * születne, minden témaváltáskor új típus lenne belőle, és a React
 * lecserélné (unmount + mount) mind a négy ikont villogás árán.
 */
function makeIcon(glyph: string) {
  const TabIcon = ({ color }: { color: string }) => (
    <Text style={[styles.icon, { color }]}>{glyph}</Text>
  );
  TabIcon.displayName = `TabIcon(${glyph})`;
  return TabIcon;
}

const HomeIcon = makeIcon('🏠');
const EntriesIcon = makeIcon('🧾');
const StatsIcon = makeIcon('📊');
const ProfileIcon = makeIcon('👤');

/**
 * Az alsó menüsáv. Az ikonok emojik - így nincs szükség külön
 * ikonkészletre, és minden készüléken egyformán jelennek meg.
 */
export default function TabsLayout() {
  const theme = useTheme();

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
        options={{ title: 'Kezdőlap', tabBarIcon: HomeIcon }}
      />
      <Tabs.Screen
        name="entries"
        options={{ title: 'Tételek', tabBarIcon: EntriesIcon }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Statisztika', tabBarIcon: StatsIcon }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ProfileIcon }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
  },
});
