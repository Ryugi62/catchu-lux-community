import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '../../../src/components/ui/Screen';
import { TextField } from '../../../src/components/ui/TextField';
import { TagChip } from '../../../src/components/ui/TagChip';
import { Button } from '../../../src/components/ui/Button';
import { StatPill } from '../../../src/components/ui/StatPill';
import { BRANDS, CATEGORIES } from '../../../constants/brands';
import { useAuth } from '../../../src/modules/auth';
import { createPost } from '../../../src/modules/posts';
import { colors, radii, shadows, spacing, typography } from '../../../src/theme';

const TAG_OPTIONS = ['신상 소식', '리셀 가치', '실착 후기', '케어 팁'];

const NewPostScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentLength = content.trim().length;

  const requestImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '이미지를 선택하려면 사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImageUris((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const removeImage = (uri: string) => {
    setImageUris((prev) => prev.filter((item) => item !== uri));
  };

  const toggleTag = (value: string) => {
    setTags((prev) => (prev.includes(value) ? prev.filter((tag) => tag !== value) : [...prev, value]));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('로그인 필요', '글을 작성하려면 로그인해주세요.');
      return;
    }
    if (!title || !brand || !category || !content) {
      Alert.alert('필수 정보', '제목, 브랜드, 카테고리, 내용을 입력해주세요.');
      return;
    }
    if (imageUris.length === 0) {
      Alert.alert('이미지 첨부', '최소 한 장 이상의 이미지를 첨부해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createPost({
        title: title.trim(),
        brand,
        category,
        tags,
        content: content.trim(),
        imageUris,
        authorId: user.uid,
        authorName: user.displayName,
      });
      Alert.alert('등록 완료', '새로운 소식을 공유했습니다!');
      router.replace('/');
    } catch (error) {
      Alert.alert('등록 실패', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const brandStats = useMemo(() => (brand ? '선택 완료' : '미선택'), [brand]);

  return (
    <Screen scrollable={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={['#f8efe4', '#fdf9f4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>새로운 인사이트 공유</Text>
          <Text style={styles.heroSubtitle}>
            명품 신상, 착용 후기, 리셀 정보를 커뮤니티와 나누면 더 풍성한 대화가 만들어집니다.
          </Text>
          <View style={styles.statRow}>
            <StatPill label="이미지" value={`${imageUris.length}/5`} />
            <StatPill label="태그" value={tags.length} accent={tags.length ? 'primary' : 'muted'} />
            <StatPill label="본문 글자" value={contentLength} accent={contentLength ? 'primary' : 'muted'} />
            <StatPill label="브랜드" value={brandStats} accent={brand ? 'primary' : 'muted'} />
          </View>
        </LinearGradient>

        <View style={styles.formCard}>
          <TextField
            label="제목"
            value={title}
            onChangeText={setTitle}
            placeholder="예: 루이비통 24FW 신상 하이라이트"
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>브랜드</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>
              {BRANDS.map((item) => (
                <TagChip
                  key={item}
                  label={item}
                  selected={brand === item}
                  onPress={() => setBrand(brand === item ? '' : item)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>카테고리</Text>
            <View style={styles.tagGrid}>
              {CATEGORIES.map((item) => (
                <TagChip
                  key={item}
                  label={item}
                  selected={category === item}
                  onPress={() => setCategory(category === item ? '' : item)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>태그</Text>
            <View style={styles.tagGrid}>
              {TAG_OPTIONS.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  selected={tags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>본문</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              placeholder="브랜드 스토리, 소재, 착용감, 시세 전망 등 상세 정보를 입력해주세요."
              textAlignVertical="top"
              style={styles.bodyInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>이미지 ({imageUris.length}/5)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageList}
            >
              {imageUris.map((uri) => (
                <View key={uri} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <Pressable onPress={() => removeImage(uri)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </Pressable>
                </View>
              ))}
              {imageUris.length < 5 ? (
                <Pressable onPress={requestImage} style={styles.addImageButton}>
                  <Text style={styles.addImageText}>이미지 추가</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>

          <Button
            label={isSubmitting ? '업로드 중...' : '글 올리기'}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing(6),
    paddingBottom: spacing(12),
  },
  hero: {
    marginHorizontal: spacing(5),
    marginTop: spacing(4),
    borderRadius: radii.xl,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(5),
    gap: spacing(4),
  },
  heroTitle: {
    ...typography.heading1,
    fontSize: 26,
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
    gap: spacing(4),
    ...shadows.card,
  },
  fieldGroup: {
    gap: spacing(2),
  },
  fieldLabel: {
    ...typography.label,
  },
  brandList: {
    flexDirection: 'row',
    gap: spacing(2),
    paddingVertical: spacing(1),
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing(4),
    minHeight: 160,
    lineHeight: 20,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  imageList: {
    flexDirection: 'row',
    gap: spacing(3),
    paddingVertical: spacing(1),
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: spacing(35),
    height: spacing(35),
    borderRadius: radii.lg,
  },
  removeButton: {
    position: 'absolute',
    top: spacing(2),
    right: spacing(2),
    backgroundColor: 'rgba(31, 27, 22, 0.8)',
    borderRadius: radii.pill,
    width: spacing(7),
    height: spacing(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  addImageButton: {
    width: spacing(35),
    height: spacing(35),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePrimary,
  },
  addImageText: {
    color: colors.accent,
    fontWeight: '600',
  },
});

export default NewPostScreen;
