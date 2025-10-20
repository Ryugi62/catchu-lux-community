import { Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';
import { colors, radii, spacing, typography } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled,
  icon,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.base,
      variant === 'secondary' ? styles.secondary : styles.primary,
      pressed && styles.pressed,
      disabled && styles.disabled,
    ]}
  >
    {icon}
    <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    minHeight: spacing(12),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing(2),
    paddingHorizontal: spacing(5),
    backgroundColor: colors.textPrimary,
  },
  primary: {
    backgroundColor: colors.textPrimary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.surfacePrimary,
  },
  labelSecondary: {
    color: colors.textPrimary,
  },
});
