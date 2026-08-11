import { FlatList, StyleSheet, Text, View } from 'react-native';

import { formatHuf } from '../../lib/format';
import { useApp, useThemedStyles } from '../../lib/store';
import type { Theme } from '../../lib/theme';
import { EmptyState } from '../../components/EmptyState';
import { EntryRow } from '../../components/EntryRow';
import { MonthNav } from '../../components/MonthNav';
import { Screen } from '../../components/Screen';

export default function EntriesScreen() {
  const { monthEntries, income, spent } = useApp();
  const styles = useThemedStyles(makeStyles);

  return (
    <Screen title="Tételek">
      <MonthNav />

      <FlatList
        data={monthEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          monthEntries.length > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {monthEntries.length} tétel
              </Text>
              <Text style={styles.summaryText}>
                +{formatHuf(income)} · −{formatHuf(spent)}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="🌤️"
            title="Üres a hónap"
            text="Ebben a hónapban nincs rögzített tétel. A Kezdőlapon tudsz újat felvenni."
          />
        }
        renderItem={({ item }) => <EntryRow entry={item} />}
      />
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    content: {
      paddingTop: 16,
      paddingBottom: 32,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: t.gap + 4,
      marginBottom: 10,
    },
    summaryText: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: t.labelSecondary,
      fontVariant: ['tabular-nums'],
    },
  });
