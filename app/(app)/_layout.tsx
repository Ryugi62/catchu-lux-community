import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

const AppLayout = () => (
  <Stack
    screenOptions={{
      headerStyle: { backgroundColor: colors.backgroundPrimary },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.backgroundPrimary },
    }}
  >
    <Stack.Screen name="index" options={{ title: '럭셔리 피드' }} />
    <Stack.Screen name="post/new" options={{ title: '새 글 작성' }} />
    <Stack.Screen name="post/[id]" options={{ title: '게시글 상세' }} />
    <Stack.Screen name="account" options={{ title: '계정 설정' }} />
  </Stack>
);

export default AppLayout;
