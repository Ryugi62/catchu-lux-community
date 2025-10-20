import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Screen } from '../../../src/components/ui/Screen';
import { TextField } from '../../../src/components/ui/TextField';
import { TagChip } from '../../../src/components/ui/TagChip';
import { Button } from '../../../src/components/ui/Button';
import { BRANDS, CATEGORIES } from '../../../constants/brands';
import { useAuth } from '../../../src/hooks/useAuth';
import { createPost } from '../../../src/features/posts/api';

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

  return (
    <Screen>
      <View style={{ gap: 24 }}>
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f1b16' }}>새로운 인사이트 공유</Text>
          <Text style={{ color: '#5c524b' }}>
            명품 신상, 착용 후기, 리셀 정보를 공유하면 커뮤니티가 더 풍성해집니다.
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <TextField label="제목" value={title} onChangeText={setTitle} placeholder="예: 루이비통 24FW 신상 하이라이트" />
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '600', color: '#3a3127' }}>브랜드</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
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

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '600', color: '#3a3127' }}>카테고리</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '600', color: '#3a3127' }}>태그</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '600', color: '#3a3127' }}>본문</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              placeholder="브랜드 스토리, 소재, 착용감, 시세 전망 등 상세 정보를 입력해주세요."
              textAlignVertical="top"
              style={{
                borderWidth: 1,
                borderColor: '#d6cec4',
                borderRadius: 16,
                backgroundColor: '#fdf9f4',
                padding: 16,
                minHeight: 160,
                lineHeight: 20,
                color: '#1f1b16',
              }}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '600', color: '#3a3127' }}>이미지 ({imageUris.length}/5)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
            >
              {imageUris.map((uri) => (
                <View key={uri} style={{ position: 'relative' }}>
                  <Image source={{ uri }} style={{ width: 140, height: 140, borderRadius: 20 }} />
                  <Pressable
                    onPress={() => removeImage(uri)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(31, 27, 22, 0.8)',
                      borderRadius: 999,
                      width: 28,
                      height: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fdf9f4', fontWeight: '700' }}>×</Text>
                  </Pressable>
                </View>
              ))}
              {imageUris.length < 5 ? (
                <Pressable
                  onPress={requestImage}
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: '#9a7b50',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fdf9f4',
                  }}
                >
                  <Text style={{ color: '#9a7b50', fontWeight: '600' }}>이미지 추가</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </View>

        <Button
          label={isSubmitting ? '업로드 중...' : '글 올리기'}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </Screen>
  );
};

export default NewPostScreen;
