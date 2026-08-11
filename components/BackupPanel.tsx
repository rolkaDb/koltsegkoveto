import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BackupError, exportBackup, importBackup } from '../lib/backup';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import { Card } from './Card';

type Busy = 'export' | 'import' | null;

function message(err: unknown): string {
  if (err instanceof BackupError) return err.message;
  return 'Váratlan hiba történt. Próbáld újra.';
}

/** A Profil fül "Mentés" szakasza: exportálás fájlba és visszatöltés. */
export function BackupPanel() {
  const { entries, recurring, settings, appearance, restoreBackup, theme } = useApp();
  const styles = useThemedStyles(makeStyles);
  const [busy, setBusy] = useState<Busy>(null);

  async function handleExport() {
    setBusy('export');
    try {
      const name = await exportBackup({ entries, recurring, settings, appearance });

      if (!name) {
        Alert.alert(
          'A megosztás nem elérhető',
          'Ezen a készüléken nem tudom megnyitni a megosztó ablakot.'
        );
      }
    } catch (err) {
      Alert.alert('Nem sikerült a mentés', message(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleImport() {
    setBusy('import');
    try {
      const data = await importBackup();
      if (!data) return; // a felhasználó megszakította

      // Felülírás előtt mindig kérdezünk - ez visszafordíthatatlan.
      Alert.alert(
        'Visszaállítás',
        `A mentés ${data.entries.length} tételt tartalmaz.\n\n` +
          `Ez lecseréli a jelenlegi ${entries.length} tételedet, és a beállításaidat is. ` +
          'A művelet nem vonható vissza.',
        [
          { text: 'Mégse', style: 'cancel' },
          {
            text: 'Visszaállítás',
            style: 'destructive',
            onPress: () => {
              restoreBackup(data);
              Alert.alert('Kész', 'Az adataid visszatöltve.');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Nem sikerült a visszaállítás', message(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Mentés</Text>

      <Text style={styles.intro}>
        Az adataid csak ezen a telefonon élnek. Készíts időnként mentést, hogy
        ne vesszenek el, ha törlöd az appot vagy készüléket cserélsz.
      </Text>

      <Card style={styles.card}>
        <Pressable
          onPress={handleExport}
          disabled={busy !== null}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.accent },
            (pressed || busy !== null) && styles.pressed,
          ]}
        >
          {busy === 'export' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Mentés készítése</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleImport}
          disabled={busy !== null}
          style={({ pressed }) => [
            styles.button,
            styles.buttonGhost,
            (pressed || busy !== null) && styles.pressed,
          ]}
        >
          {busy === 'import' ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.accent }]}>
              Visszaállítás mentésből
            </Text>
          )}
        </Pressable>
      </Card>

      <Text style={styles.hint}>
        A mentés egy JSON fájl, amit elmenthetsz a Fájlok appba, elküldheted
        e-mailben, vagy feltöltheted felhőbe. Visszatöltéskor a jelenlegi
        adataid helyére lép — ezért előtte mindig rákérdezek.
      </Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: { opacity: 0.65 },
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
      paddingVertical: 16,
      borderRadius: 18,
      gap: 10,
    },
    button: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    buttonGhost: {
      backgroundColor: t.fill,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    hint: {
      fontSize: 13,
      lineHeight: 19,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginTop: 10,
      marginBottom: 24,
    },
  });
