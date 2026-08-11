import { ScrollView, StyleSheet, Text } from 'react-native';

import { useApp, useThemedStyles } from '../../lib/store';
import type { Theme } from '../../lib/theme';
import { BalanceHeader } from '../../components/BalanceHeader';
import { CategoryBar } from '../../components/CategoryBar';
import { EmptyState } from '../../components/EmptyState';
import { MonthNav } from '../../components/MonthNav';
import { Screen } from '../../components/Screen';

export default function StatsScreen() {
  const { byCategory } = useApp();
  const styles = useThemedStyles(makeStyles);

  return (
    <Screen title="Statisztika">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MonthNav />
        <BalanceHeader />

        {byCategory.length === 0 ? (
          <EmptyState
            icon="📊"
            title="Nincs mit összegezni"
            text="Rögzíts néhány kiadást, és itt látod, mire megy el a pénz."
          />
        ) : (
          <>
            <Text style={styles.sectionLabel}>A kiadások megoszlása</Text>
            {byCategory.map((item) => (
              <CategoryBar key={item.name} item={item} />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    content: {
      paddingBottom: 32,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: t.labelSecondary,
      marginLeft: t.gap + 4,
      marginBottom: 10,
    },
  });
