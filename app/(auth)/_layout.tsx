import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

const AuthLayout = () => (
  <Stack
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.backgroundPrimary },
    }}
  />
);

export default AuthLayout;
