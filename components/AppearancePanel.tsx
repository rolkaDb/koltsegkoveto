import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp, useThemedStyles } from '../lib/store';
import { INTENSITIES, PALETTES, SERIF, type Theme } from '../lib/theme';
import { Card } from './Card';

/** A Profil fül "Megjelenés" szakasza: színvilág és háttérerősség. */
export function AppearancePanel() {
  const { appearance, setPalette, setIntensity } = useApp();
  const styles = useThemedStyles(makeStyles);

  return (
    <View>
      <Text style={styles.intro}>
        Válaszd ki, milyen hangulatban szeretnél könyvelni. Bármikor
        cserélhető, és nem érinti a rögzített tételeidet.
      </Text>

      <Text style={styles.sectionTitle}>Színvilág</Text>

      <View style={styles.grid}>
        {PALETTES.map((p) => {
          const active = p.name === appearance.palette;
          return (
            <Pressable
              key={p.name}
              onPress={() => setPalette(p.name)}
              style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
            >
              <Card style={[styles.paletteCard, active && styles.paletteCardActive]}>
                <View style={styles.cardTop}>
                  <Text style={styles.paletteName}>{p.name}</Text>
                  {active && <Text style={styles.check}>✓</Text>}
                </View>

                <View style={styles.swatchRow}>
                  {p.swatches.map((s, i) => (
                    <View key={i} style={[styles.swatch, { backgroundColor: s }]} />
                  ))}
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Háttér erőssége</Text>

      <View style={styles.intensityRow}>
        {INTENSITIES.map((i) => {
          const active = i.key === appearance.intensity;
          return (
            <Pressable
              key={i.key}
              onPress={() => setIntensity(i.key)}
              style={({ pressed }) => [styles.intensityWrap, pressed && styles.pressed]}
            >
              <Card
                style={[styles.intensityCard, active && styles.paletteCardActive]}
              >
                <Text
                  style={[styles.intensityText, active && styles.intensityTextActive]}
                >
                  {i.label}
                </Text>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>
        A „Mély" a paletta teljes erejét mutatja, a „Halvány" pedig majdnem
        papírszínűre mossa. A beállítás azonnal életbe lép, és mentődik.
      </Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: { opacity: 0.7 },
    intro: {
      fontSize: 14,
      lineHeight: 20,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
      marginBottom: 20,
    },
    sectionTitle: {
      fontFamily: SERIF.semibold,
      fontSize: 19,
      color: t.label,
      paddingHorizontal: t.gap + 6,
      marginBottom: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: t.gap - 6,
      marginBottom: 24,
    },
    cardWrap: {
      width: '46%',
      marginHorizontal: '2%',
      marginBottom: 12,
    },
    paletteCard: {
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    paletteCardActive: {
      borderColor: t.accent,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    paletteName: {
      fontSize: 15,
      fontWeight: '600',
      color: t.label,
    },
    check: {
      fontSize: 14,
      fontWeight: '700',
      color: t.accent,
    },
    swatchRow: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 12,
    },
    swatch: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    intensityRow: {
      flexDirection: 'row',
      paddingHorizontal: t.gap - 6,
      marginBottom: 16,
    },
    intensityWrap: {
      flex: 1,
      marginHorizontal: '1.5%',
    },
    intensityCard: {
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    intensityText: {
      fontSize: 15,
      fontWeight: '600',
      color: t.labelSecondary,
    },
    intensityTextActive: {
      color: t.accent,
    },
    hint: {
      fontSize: 13,
      lineHeight: 19,
      color: t.labelSecondary,
      paddingHorizontal: t.gap + 6,
    },
  });
