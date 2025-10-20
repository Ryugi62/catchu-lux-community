import { Stack } from 'expo-router';

const AppLayout = () => (
  <Stack
    screenOptions={{
      headerStyle: { backgroundColor: '#f2ece5' },
      headerTintColor: '#1f1b16',
      contentStyle: { backgroundColor: '#f2ece5' },
    }}
  >
    <Stack.Screen name="index" options={{ title: '럭셔리 피드' }} />
    <Stack.Screen name="post/new" options={{ title: '새 글 작성' }} />
    <Stack.Screen name="post/[id]" options={{ title: '게시글 상세' }} />
  </Stack>
);

export default AppLayout;
