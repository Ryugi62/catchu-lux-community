import { forwardRef } from 'react';
import { StyleSheet, TextInput, Text, View, type TextInputProps } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export const TextField = forwardRef<TextInput, Props>(({ label, error, style, ...props }, ref) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      ref={ref}
      placeholderTextColor={colors.textPlaceholder}
      style={[styles.input, style, error ? styles.inputError : null]}
      {...props}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
));

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing(1.5),
  },
  label: {
    ...typography.label,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surfacePrimary,
  },
  inputError: {
    borderColor: colors.dangerStrong,
  },
  error: {
    color: colors.dangerStrong,
    fontSize: 12,
  },
});
