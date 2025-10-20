import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuthContext } from '../src/providers/AuthProvider';

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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2ece5' }}>
        <ActivityIndicator size="large" color="#1f1b16" />
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

export default RootLayout;
