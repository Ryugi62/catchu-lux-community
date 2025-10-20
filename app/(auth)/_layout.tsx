import { Stack } from 'expo-router';

const AuthLayout = () => (
  <Stack
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#f2ece5' },
    }}
  />
);

export default AuthLayout;
