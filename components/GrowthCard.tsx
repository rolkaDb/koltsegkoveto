import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { growthFor, STAGES } from '../lib/growth';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import { Card } from './Card';
import { InfoButton, InfoPanel, InfoStrong, InfoText } from './InfoButton';

/** A sorozathoz kötött növény: minél régebb óta könyvelsz, annál nagyobb. */
export function GrowthCard() {
  const { streak, theme } = useApp();
  const styles = useThemedStyles(makeStyles);
  const [infoOpen, setInfoOpen] = useState(false);

  const { stage, next, progress, daysToNext } = growthFor(streak.days);

  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.icon}>{stage.icon}</Text>

          <View style={styles.flex}>
            <Text style={styles.name}>{stage.name}</Text>
            <Text style={styles.message}>{stage.message}</Text>
          </View>

          <InfoButton
            open={infoOpen}
            onToggle={() => setInfoOpen((open) => !open)}
            label="Hogyan nő a növény?"
          />
        </View>

        {next ? (
          <>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: theme.income,
                    // Százalék stringként - a RN így érti a relatív szélességet.
                    width: `${Math.max(progress * 100, 3)}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.footer}>
              Még {daysToNext} nap a következő szintig: {next.icon} {next.name}
            </Text>
          </>
        ) : (
          <Text style={styles.footer}>
            Elérted a legmagasabb szintet. Tartsd így!
          </Text>
        )}

        {infoOpen && (
          <InfoPanel>
            <InfoText>
              A növény a <InfoStrong>sorozatodhoz</InfoStrong> nő: ahány napja
              megszakítás nélkül könyvelsz.
            </InfoText>

            <InfoText>
              Egy nap akkor számít, ha rögzítesz rá egy tételt,{' '}
              <InfoStrong>vagy</InfoStrong> megnyomod a „Ma nem költöttem"
              gombot.
            </InfoText>

            <InfoText>
              Ha ma még nincs bejegyzésed, a sorozat{' '}
              <InfoStrong>nem szakad meg azonnal</InfoStrong> — a nap végéig
              pótolhatod.
            </InfoText>

            <View style={styles.stageList}>
              {STAGES.map((s) => {
                const active = s.name === stage.name;
                return (
                  <View key={s.name} style={styles.stageRow}>
                    <Text style={styles.stageIcon}>{s.icon}</Text>
                    <Text style={[styles.stageName, active && styles.stageActive]}>
                      {s.name}
                    </Text>
                    <Text style={[styles.stageDays, active && styles.stageActive]}>
                      {s.minDays === 0 ? 'kezdés' : `${s.minDays} nap`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </InfoPanel>
        )}
      </Card>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    wrap: {
      paddingHorizontal: t.gap,
      marginBottom: t.gap,
    },
    card: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 18,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    icon: {
      fontSize: 40,
    },
    name: {
      fontFamily: SERIF.bold,
      fontSize: 20,
      color: t.label,
    },
    message: {
      fontSize: 13,
      lineHeight: 18,
      color: t.labelSecondary,
      marginTop: 2,
    },
    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: t.fill,
      overflow: 'hidden',
      marginTop: 14,
    },
    fill: {
      height: '100%',
      borderRadius: 4,
    },
    footer: {
      fontSize: 12,
      color: t.labelSecondary,
      marginTop: 8,
    },
    stageList: {
      marginTop: 6,
      gap: 2,
    },
    stageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 3,
    },
    stageIcon: {
      fontSize: 16,
      width: 22,
    },
    stageName: {
      flex: 1,
      fontSize: 13,
      color: t.labelSecondary,
    },
    stageDays: {
      fontSize: 13,
      color: t.labelSecondary,
      fontVariant: ['tabular-nums'],
    },
    stageActive: {
      color: t.label,
      fontWeight: '700',
    },
  });
