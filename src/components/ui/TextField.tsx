import { forwardRef } from 'react';
import { StyleSheet, TextInput, Text, View, type TextInputProps } from 'react-native';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export const TextField = forwardRef<TextInput, Props>(({ label, error, style, ...props }, ref) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      ref={ref}
      placeholderTextColor="#9a948c"
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
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#3a3127',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6cec4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1f1b16',
    backgroundColor: '#fdf9f4',
  },
  inputError: {
    borderColor: '#cc5b63',
  },
  error: {
    color: '#cc5b63',
    fontSize: 12,
  },
});
