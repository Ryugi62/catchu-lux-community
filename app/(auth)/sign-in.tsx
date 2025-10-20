import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { TextField } from '../../src/components/ui/TextField';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';

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
      <View style={{ gap: 32 }}>
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f1b16' }}>Catchu Luxury</Text>
          <Text style={{ color: '#5c524b', fontSize: 15 }}>
            명품 애호가들을 위한 커뮤니티에 오신 것을 환영합니다.
          </Text>
        </View>

        <View style={{ gap: 20 }}>
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

        <Text style={{ color: '#3a3127', textAlign: 'center' }}>
          아직 계정이 없으신가요?{' '}
          <Link href="/(auth)/sign-up" style={{ fontWeight: '700', color: '#9a7b50' }}>
            회원가입
          </Link>
        </Text>
      </View>
    </Screen>
  );
};

export default SignInScreen;
