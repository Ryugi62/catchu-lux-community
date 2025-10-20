import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COMMENT_TAGS } from '../../../constants/brands';
import { usePost } from '../../../src/hooks/usePost';
import { useComments } from '../../../src/hooks/useComments';
import { useAuth } from '../../../src/hooks/useAuth';
import { createComment } from '../../../src/features/comments/api';
import { TagChip } from '../../../src/components/ui/TagChip';
import { Button } from '../../../src/components/ui/Button';

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Array.isArray(id) ? id[0] : id ?? '';
  const { post, isLoading } = usePost(postId);
  const { comments, isLoading: commentsLoading } = useComments(postId);
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [toneTag, setToneTag] = useState<string>(COMMENT_TAGS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('로그인 필요', '댓글을 남기려면 로그인해주세요.');
      return;
    }
    if (!commentText.trim()) {
      Alert.alert('필수 입력', '내용을 입력해주세요.');
      return;
    }
    try {
      setSubmitting(true);
      await createComment({
        postId,
        content: commentText.trim(),
        toneTag,
        authorId: user.uid,
        authorName: user.displayName,
      });
      setCommentText('');
    } catch (error) {
      Alert.alert('등록 실패', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !post) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1f1b16" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {post.imageUrls.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {post.imageUrls.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.carouselImage} />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.carousel, styles.carouselFallback]}>
          <Text style={{ color: '#746a63', fontWeight: '600' }}>이미지가 등록되지 않았습니다.</Text>
        </View>
      )}

      <View style={{ gap: 12 }}>
        <Text style={styles.brand}>{post.brand}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>작성자: {post.authorName ?? '익명'}</Text>
        <Text style={styles.meta}>
          작성일: {post.createdAt ? post.createdAt.toLocaleString('ko-KR') : '방금 전'}
        </Text>
        <View style={styles.tagRow}>
          <Text style={styles.category}>{post.category}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <Text key={tag} style={styles.postTag}>
                #{tag}
              </Text>
            ))}
          </View>
        </View>
        <Text style={styles.body}>{post.content}</Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.commentTitle}>커뮤니티 인사이트</Text>
        {commentsLoading ? (
          <ActivityIndicator color="#1f1b16" />
        ) : (
          <View style={{ gap: 12 }}>
            {comments.length === 0 ? (
              <Text style={{ color: '#5c524b' }}>첫 번째 의견을 남겨주세요.</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Text style={styles.commentTag}>{comment.toneTag}</Text>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  <Text style={styles.commentMeta}>{comment.authorName ?? '익명'}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.commentTitle}>의견 남기기</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {COMMENT_TAGS.map((tag) => (
            <TagChip key={tag} label={tag} selected={toneTag === tag} onPress={() => setToneTag(tag)} />
          ))}
        </View>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          multiline
          numberOfLines={4}
          placeholder="진품 여부, 리셀 시세, 착용 팁 등 의견을 공유해주세요."
          textAlignVertical="top"
          style={styles.commentInput}
        />
        <Button label={submitting ? '등록 중...' : '댓글 작성'} onPress={handleSubmit} disabled={submitting} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2ece5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2ece5',
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 60,
  },
  carousel: {
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
  },
  carouselImage: {
    width: 320,
    height: 280,
    marginRight: 12,
    borderRadius: 24,
  },
  carouselFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ded4c8',
  },
  brand: {
    color: '#9a7b50',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f1b16',
  },
  meta: {
    color: '#5c524b',
    fontSize: 13,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    backgroundColor: '#1f1b16',
    color: '#fdf9f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
  },
  postTag: {
    marginRight: 8,
    color: '#746a63',
    fontWeight: '600',
  },
  body: {
    color: '#3a3127',
    lineHeight: 22,
    fontSize: 16,
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1b16',
  },
  commentCard: {
    backgroundColor: '#fffaf2',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eadfce',
    gap: 8,
  },
  commentTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f1b16',
    color: '#fdf9f4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
  },
  commentContent: {
    color: '#3a3127',
    lineHeight: 20,
  },
  commentMeta: {
    color: '#746a63',
    fontSize: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d6cec4',
    borderRadius: 16,
    backgroundColor: '#fdf9f4',
    padding: 16,
    minHeight: 120,
    color: '#1f1b16',
  },
});

export default PostDetailScreen;
