import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { formatHuf } from '../lib/format';
import { useApp, useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';
import { Card } from './Card';
import { InfoButton, InfoPanel, InfoStrong, InfoText } from './InfoButton';

const SIZE = 180;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Bevétel/kiadás arány gyűrűdiagramon.
 *
 * A gyűrűt két körívvel rajzoljuk: a `strokeDasharray` adja meg, milyen
 * hosszan látszik a vonal, a `strokeDashoffset` pedig hogy hol kezdődik.
 * Így nincs szükség útvonal-matematikára - a kör kerületének arányaival
 * dolgozunk.
 *
 * A -90 fokos forgatás azért kell, mert az SVG a kört a jobb oldalon
 * kezdi; így viszont felülről indul, ahogy egy diagramtól elvárjuk.
 */
export function IncomeExpenseChart() {
  const { income, spent, balance, theme } = useApp();
  const styles = useThemedStyles(makeStyles);
  const [infoOpen, setInfoOpen] = useState(false);

  const total = income + spent;
  const hasData = total > 0;

  const incomeShare = hasData ? income / total : 0;
  const spentShare = hasData ? spent / total : 0;

  const incomeLength = CIRCUMFERENCE * incomeShare;
  const spentLength = CIRCUMFERENCE * spentShare;

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, styles.flex]}>Bevétel és kiadás aránya</Text>
        <InfoButton
          open={infoOpen}
          onToggle={() => setInfoOpen((open) => !open)}
          label="Mit mutat ez a diagram?"
        />
      </View>

      <View style={styles.chartRow}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
            {/* Alapgyűrű: ez látszik, ha nincs adat. */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={theme.fill}
              strokeWidth={STROKE}
              fill="none"
            />

            {hasData && (
              <>
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={theme.income}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeDasharray={`${incomeLength} ${CIRCUMFERENCE}`}
                  strokeLinecap="butt"
                />
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={theme.accent}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeDasharray={`${spentLength} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-incomeLength}
                  strokeLinecap="butt"
                />
              </>
            )}
          </G>
        </Svg>

        {/* A gyűrű közepén az egyenleg. Abszolút pozíció, hogy pontosan középre essen. */}
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.centerLabel}>Egyenleg</Text>
          <Text
            style={[styles.centerValue, balance < 0 && { color: theme.negative }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {hasData ? formatHuf(balance) : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        <LegendRow
          color={theme.income}
          label="Bevétel"
          value={formatHuf(income)}
          share={incomeShare}
          hasData={hasData}
          styles={styles}
        />
        <LegendRow
          color={theme.accent}
          label="Kiadás"
          value={formatHuf(spent)}
          share={spentShare}
          hasData={hasData}
          styles={styles}
        />
      </View>

      {!hasData && (
        <Text style={styles.empty}>
          Ebben a hónapban még nincs adat, amiből arányt lehetne számolni.
        </Text>
      )}

      {infoOpen && (
        <InfoPanel>
          <InfoText>
            A gyűrű a hónap <InfoStrong>teljes pénzmozgását</InfoStrong> osztja
            ketté: mennyi jött be, és mennyi ment ki.
          </InfoText>

          <InfoText>
            A százalékok <InfoStrong>az össz-forgalomra</InfoStrong> vonatkoznak,
            nem egymásra. Ha 70% a bevétel és 30% a kiadás, az azt jelenti, hogy
            a hónap pénzmozgásának 70%-a volt bevétel.
          </InfoText>

          <InfoText>
            Középen az <InfoStrong>egyenleg</InfoStrong>: a bevétel és a kiadás
            különbsége. Ha piros, többet költöttél, mint amennyi bejött.
          </InfoText>

          <InfoText>
            A más pénznemű tételek a beállított árfolyammal, forintra váltva
            szerepelnek.
          </InfoText>
        </InfoPanel>
      )}
    </Card>
  );
}

function LegendRow({
  color,
  label,
  value,
  share,
  hasData,
  styles,
}: {
  color: string;
  label: string;
  value: string;
  share: number;
  hasData: boolean;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendValue}>{value}</Text>
      <Text style={styles.legendShare}>
        {hasData ? `${Math.round(share * 100)}%` : '—'}
      </Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      marginHorizontal: t.gap,
      marginBottom: t.gap,
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    flex: { flex: 1 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: t.labelSecondary,
      marginBottom: 4,
    },
    chartRow: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 8,
    },
    center: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: t.labelSecondary,
    },
    centerValue: {
      fontFamily: SERIF.bold,
      fontSize: 22,
      color: t.label,
      marginTop: 2,
      paddingHorizontal: 8,
    },
    legend: {
      marginTop: 12,
      gap: 10,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendLabel: {
      flex: 1,
      fontSize: 15,
      color: t.label,
    },
    legendValue: {
      fontSize: 15,
      fontWeight: '700',
      color: t.label,
      fontVariant: ['tabular-nums'],
    },
    legendShare: {
      fontSize: 13,
      fontWeight: '600',
      color: t.labelSecondary,
      width: 42,
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    },
    empty: {
      fontSize: 13,
      lineHeight: 19,
      color: t.labelSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
  });
