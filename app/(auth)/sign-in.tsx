import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { TextField } from '../../src/components/ui/TextField';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/modules/auth';
import { colors, spacing, typography } from '../../src/theme';

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
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Catchu Luxury</Text>
          <Text style={styles.subtitle}>
            명품 애호가들을 위한 커뮤니티에 오신 것을 환영합니다.
          </Text>
        </View>

        <View style={styles.form}>
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
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing(8),
  },
  header: {
    gap: spacing(3),
  },
  title: {
    ...typography.heading1,
    fontSize: 28,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
  },
  form: {
    gap: spacing(5),
  },
  footer: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  link: {
    fontWeight: '700',
    color: colors.accent,
  },
});

export default SignInScreen;
