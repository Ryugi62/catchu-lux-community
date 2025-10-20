import { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { TextField } from '../../src/components/ui/TextField';
import { Button } from '../../src/components/ui/Button';
import { TagChip } from '../../src/components/ui/TagChip';
import { BRANDS } from '../../constants/brands';
import { useAuth } from '../../src/hooks/useAuth';

const SignUpScreen = () => {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]
    );
  };

  const sortedBrands = useMemo(() => BRANDS.slice().sort(), []);

  const handleSignUp = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('필수 정보', '이름, 이메일, 비밀번호를 입력해주세요.');
      return;
    }
    if (selectedBrands.length === 0) {
      Alert.alert('선호 브랜드', '최소 하나 이상의 선호 브랜드를 선택해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await signUp({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        preferredBrands: selectedBrands,
      });
    } catch (error) {
      Alert.alert('회원가입 실패', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: 32 }}>
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f1b16' }}>럭셔리 큐레이션 시작</Text>
          <Text style={{ color: '#5c524b', fontSize: 15 }}>
            선호 브랜드를 선택하고 나만의 피드를 받아보세요.
          </Text>
        </View>

        <View style={{ gap: 20 }}>
          <TextField label="이름" value={displayName} onChangeText={setDisplayName} />
          <TextField
            label="이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField label="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />

          <View style={{ gap: 10 }}>
            <Text style={{ fontWeight: '600', color: '#3a3127' }}>선호 브랜드</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {sortedBrands.map((brand) => (
                <TagChip key={brand} label={brand} selected={selectedBrands.includes(brand)} onPress={() => toggleBrand(brand)} />
              ))}
            </View>
          </View>

          <Button label={submitting ? '가입 중...' : '회원가입'} onPress={handleSignUp} disabled={submitting} />
        </View>

        <Text style={{ color: '#3a3127', textAlign: 'center' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/(auth)/sign-in" style={{ fontWeight: '700', color: '#9a7b50' }}>
            로그인
          </Link>
        </Text>
      </View>
    </Screen>
  );
};

export default SignUpScreen;
