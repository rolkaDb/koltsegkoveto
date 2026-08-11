import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '../lib/store';
import { SERIF, type Theme } from '../lib/theme';

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.box}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    box: {
      alignItems: 'center',
      paddingHorizontal: 44,
      marginTop: 40,
    },
    icon: {
      fontSize: 34,
      marginBottom: 10,
    },
    title: {
      fontFamily: SERIF.semibold,
      fontSize: 20,
      color: t.label,
    },
    text: {
      fontSize: 14,
      color: t.labelSecondary,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 20,
    },
  });
