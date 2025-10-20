import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const TagChip: React.FC<Props> = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.base,
      selected ? styles.selected : styles.unselected,
      pressed && styles.pressed,
    ]}
  >
    <Text style={[styles.label, selected ? styles.labelSelected : null]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2),
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: spacing(2),
    marginBottom: spacing(2),
    backgroundColor: colors.surfacePrimary,
  },
  selected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  unselected: {
    backgroundColor: colors.surfacePrimary,
  },
  label: {
    ...typography.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.surfacePrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});
