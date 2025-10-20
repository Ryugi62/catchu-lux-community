import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import { TextField } from '../../src/components/ui/TextField';
import { TagChip } from '../../src/components/ui/TagChip';
import { Button } from '../../src/components/ui/Button';
import { BRANDS } from '../../constants/brands';
import { useAuth, getUserProfile, type UserProfile } from '../../src/modules/auth';
import { colors, spacing, typography } from '../../src/theme';

const AccountScreen = () => {
  const router = useRouter();
  const { user, updateAccount, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [preferredBrands, setPreferredBrands] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }
      try {
        setIsLoadingProfile(true);
        const snapshot = await getUserProfile(user.uid);
        setProfile(snapshot);
        setDisplayName(snapshot?.displayName || user.displayName || '');
        setPreferredBrands(snapshot?.preferredBrands || []);
      } catch (error) {
        console.error('[Account] failed to load profile', error);
        Alert.alert('불러오기 실패', '프로필 정보를 불러오는 중 문제가 발생했습니다.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  const sortedBrands = useMemo(() => BRANDS.slice().sort(), []);

  const toggleBrand = (brand: string) => {
    setPreferredBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]
    );
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('로그인 필요', '계정 정보를 수정하려면 로그인해주세요.');
      return;
    }
    if (!displayName.trim()) {
      Alert.alert('이름 입력', '닉네임을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      await updateAccount({
        displayName: displayName.trim(),
        preferredBrands,
      });
      Alert.alert('저장 완료', '프로필 정보가 업데이트되었습니다.');
      router.back();
    } catch (error) {
      console.error('[Account] update failed', error);
      Alert.alert('저장 실패', (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('[Account] signOut failed', error);
      Alert.alert('로그아웃 실패', (error as Error).message);
    }
  };

  if (!user) {
    return (
      <Screen scrollable={false}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>로그인이 필요합니다.</Text>
          <Text style={styles.emptyBody}>계정 설정을 보려면 로그인 화면으로 이동해주세요.</Text>
          <Button label="로그인 화면으로" onPress={() => router.replace('/(auth)/sign-in')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>계정 설정</Text>
          <Text style={styles.subtitle}>닉네임과 선호 브랜드를 관리할 수 있어요.</Text>
        </View>

        {isLoadingProfile ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.textPrimary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>이메일</Text>
              <Text style={styles.sectionValue}>{profile?.email ?? user.email ?? '-'}</Text>
            </View>

            <TextField label="닉네임" value={displayName} onChangeText={setDisplayName} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>선호 브랜드</Text>
              <View style={styles.brandGrid}>
                {sortedBrands.map((brand) => (
                  <TagChip
                    key={brand}
                    label={brand}
                    selected={preferredBrands.includes(brand)}
                    onPress={() => toggleBrand(brand)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                label={isSaving ? '저장 중...' : '변경 사항 저장'}
                onPress={handleSave}
                disabled={isSaving}
              />
              <Button label="로그아웃" onPress={handleSignOut} variant="secondary" />
            </View>
          </ScrollView>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing(6),
  },
  header: {
    gap: spacing(2),
  },
  title: {
    ...typography.heading1,
    fontSize: 28,
  },
  subtitle: {
    ...typography.body,
  },
  loader: {
    paddingVertical: spacing(10),
    alignItems: 'center',
  },
  form: {
    gap: spacing(5),
    paddingBottom: spacing(10),
  },
  section: {
    gap: spacing(1.5),
  },
  sectionLabel: {
    ...typography.label,
  },
  sectionValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  actions: {
    gap: spacing(3),
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(4),
  },
  emptyTitle: {
    ...typography.heading2,
    fontSize: 20,
  },
  emptyBody: {
    ...typography.body,
    textAlign: 'center',
  },
});

export default AccountScreen;
