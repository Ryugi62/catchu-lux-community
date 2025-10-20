import { Pressable, StyleSheet, Text } from 'react-native';

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
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d6cec4',
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: '#1f1b16',
    borderColor: '#1f1b16',
  },
  unselected: {
    backgroundColor: '#fdf9f4',
  },
  label: {
    color: '#3a3127',
    fontSize: 13,
    fontWeight: '600',
  },
  labelSelected: {
    color: '#fdf9f4',
  },
  pressed: {
    opacity: 0.7,
  },
});
