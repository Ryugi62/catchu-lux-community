import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface StatPillProps {
  label: string;
  value: string | number;
  accent?: 'primary' | 'muted';
}

const StatPillComponent: React.FC<StatPillProps> = ({ label, value, accent = 'primary' }) => (
  <View style={[styles.container, accent === 'muted' ? styles.muted : styles.primary]}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

export const StatPill = memo(StatPillComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    borderRadius: radii.lg,
    minWidth: spacing(18),
    gap: spacing(1),
  },
  primary: {
    backgroundColor: 'rgba(154, 123, 80, 0.12)',
  },
  muted: {
    backgroundColor: colors.surfacePrimary,
  },
  value: {
    ...typography.heading2,
    fontSize: 18,
  },
  label: {
    ...typography.caption,
    fontSize: 12,
  },
});
