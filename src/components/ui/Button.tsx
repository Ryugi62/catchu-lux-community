import { Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';

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
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: '#1f1b16',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1f1b16',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: '#f9f5ef',
    fontWeight: '600',
    fontSize: 16,
  },
  labelSecondary: {
    color: '#1f1b16',
  },
});
