import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { TextField } from '../../src/components/ui/TextField';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/modules/auth';
import { colors, radii, shadows, spacing, typography } from '../../src/theme';

const SignInScreen = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('필수 정보', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    try {
      setSubmitting(true);
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert('로그인 실패', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={['#f8efe4', '#fdf9f4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Catchu Luxury</Text>
          <Text style={styles.heroSubtitle}>
            명품 인사이트를 한곳에서. 지금 로그인하고 최신 소식을 만나보세요.
          </Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <TextField
            label="이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="비밀번호"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button label={submitting ? '로그인 중...' : '로그인'} onPress={handleSignIn} disabled={submitting} />
        </View>

        <Text style={styles.footer}>
          아직 계정이 없으신가요?{' '}
          <Link href="/(auth)/sign-up" style={styles.link}>
            회원가입
          </Link>
        </Text>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing(10),
    gap: spacing(6),
  },
  hero: {
    marginHorizontal: spacing(5),
    marginTop: spacing(6),
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(5),
    borderRadius: radii.xl,
    gap: spacing(3),
  },
  heroTitle: {
    ...typography.heading1,
    fontSize: 30,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  formCard: {
    marginHorizontal: spacing(5),
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.xl,
    padding: spacing(5),
    gap: spacing(4),
    ...shadows.card,
  },
  footer: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: spacing(5),
  },
  link: {
    fontWeight: '700',
    color: colors.accent,
  },
});

export default SignInScreen;
