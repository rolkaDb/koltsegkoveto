import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, useThemedStyles } from '../lib/store';
import type { Theme } from '../lib/theme';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  /** Kiválasztott állapot háttérszíne. Alapból a téma kiemelőszíne. */
  color?: string;
};

/** Két-három állapotú váltó, iOS-szerű csúszkával. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.track, style]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.item,
              active && { backgroundColor: option.color ?? theme.accent },
            ]}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      backgroundColor: t.fill,
      borderRadius: 14,
      padding: 3,
    },
    item: {
      flex: 1,
      paddingVertical: 9,
      alignItems: 'center',
      borderRadius: 11,
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
      color: t.labelSecondary,
    },
    textActive: {
      color: '#FFFFFF',
    },
  });
