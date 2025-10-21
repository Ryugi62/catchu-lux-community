import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { TextField } from '../../src/components/ui/TextField';
import { Button } from '../../src/components/ui/Button';
import { TagChip } from '../../src/components/ui/TagChip';
import { StatPill } from '../../src/components/ui/StatPill';
import { BRANDS } from '../../constants/brands';
import { useAuth } from '../../src/modules/auth';
import { colors, radii, shadows, spacing, typography } from '../../src/theme';

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
    <Screen scrollable={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={['#fcefe4', '#fdf9f4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>럭셔리 큐레이션 시작</Text>
          <Text style={styles.heroSubtitle}>
            선호 브랜드를 선택하면 나만의 맞춤 피드를 받을 수 있어요.
          </Text>
          <View style={styles.statRow}>
            <StatPill label="선택 브랜드" value={selectedBrands.length} />
            <StatPill label="필수 정보" value={`닉네임 포함 3개`} accent="muted" />
            <StatPill label="예상 소요" value="1분" accent="muted" />
          </View>
        </LinearGradient>

        <View style={styles.formCard}>
          <TextField label="닉네임" value={displayName} onChangeText={setDisplayName} />
          <TextField
            label="이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField label="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />

          <View style={styles.brandSection}>
            <Text style={styles.fieldLabel}>선호 브랜드</Text>
            <View style={styles.tagGrid}>
              {sortedBrands.map((brand) => (
                <TagChip
                  key={brand}
                  label={brand}
                  selected={selectedBrands.includes(brand)}
                  onPress={() => toggleBrand(brand)}
                />
              ))}
            </View>
          </View>

          <Button label={submitting ? '가입 중...' : '회원가입'} onPress={handleSignUp} disabled={submitting} />
        </View>

        <Text style={styles.footer}>
          이미 계정이 있으신가요?{' '}
          <Link href="/(auth)/sign-in" style={styles.link}>
            로그인
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
    fontSize: 28,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  formCard: {
    marginHorizontal: spacing(5),
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.xl,
    padding: spacing(5),
    gap: spacing(5),
    ...shadows.card,
  },
  brandSection: {
    gap: spacing(2.5),
  },
  fieldLabel: {
    ...typography.label,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
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

export default SignUpScreen;
