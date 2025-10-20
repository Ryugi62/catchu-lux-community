import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuthContext } from '../src/modules/auth';
import { colors } from '../src/theme';

const RootGate = () => {
  const { user, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, isLoading, inAuthGroup, router]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return <Slot />;
};

const RootLayout = () => (
  <AuthProvider>
    <RootGate />
  </AuthProvider>
);

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
});

export default RootLayout;
