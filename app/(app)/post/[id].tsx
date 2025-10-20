import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Share,
  View,
  type ViewToken,
  type ViewabilityConfig,
} from 'react-native';
import { COMMENT_TAGS } from '../../../constants/brands';
import { usePost } from '../../../src/modules/posts';
import { useComments, createComment } from '../../../src/modules/comments';
import { useAuth } from '../../../src/modules/auth';
import { TagChip } from '../../../src/components/ui/TagChip';
import { Button } from '../../../src/components/ui/Button';
import { colors, radii, shadows, spacing, typography } from '../../../src/theme';

const PostDetailScreen = () => {
  const windowWidth = Dimensions.get('window').width;

  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Array.isArray(id) ? id[0] : id ?? '';
  const { post, isLoading } = usePost(postId);
  const { comments, isLoading: commentsLoading, errorMessage: commentsError } = useComments(postId);
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [toneTag, setToneTag] = useState<string>(COMMENT_TAGS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const viewabilityConfig = useRef<ViewabilityConfig>({ itemVisiblePercentThreshold: 70 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) {
        return;
      }
      const nextIndex = viewableItems[0]?.index ?? 0;
      if (typeof nextIndex === 'number') {
        setActiveImageIndex(nextIndex);
      }
    }
  );

  useEffect(() => {
    setActiveImageIndex(0);
  }, [postId]);

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

  const handleShare = async () => {
    if (!post) {
      return;
    }
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content}`,
      });
    } catch (error) {
      console.error('[PostDetail] share failed', error);
      Alert.alert('공유 실패', '게시글을 공유하는 중 문제가 발생했습니다.');
    }
  };

  const formatDateTime = (value?: Date) => {
    if (!value) {
      return '방금 전';
    }
    return value.toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !post) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {post.imageUrls.length > 0 ? (
        <View style={styles.carouselContainer}>
          <FlatList
            data={post.imageUrls}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={[styles.carouselImage, { width: windowWidth - spacing(5) * 2 }]}
                  resizeMode="cover"
                />
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig}
          />
          <View style={styles.carouselIndicator}>
            <Text style={styles.carouselIndicatorText}>
              {activeImageIndex + 1} / {post.imageUrls.length}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.carouselContainer, styles.carouselFallback]}>
          <Text style={styles.carouselFallbackText}>이미지가 등록되지 않았습니다.</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.brand}>{post.brand}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>작성자: {post.authorName ?? '익명'}</Text>
        <Text style={styles.meta}>작성일: {formatDateTime(post.createdAt)}</Text>
        <View style={styles.tagRow}>
          <Text style={styles.category}>{post.category}</Text>
          <View style={styles.tagList}>
            {post.tags.map((tag) => (
              <Text key={tag} style={styles.postTag}>
                #{tag}
              </Text>
            ))}
          </View>
        </View>
        <Text style={styles.body}>{post.content}</Text>
        <View style={styles.shareRow}>
          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonLabel}>공유하기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.commentTitle}>커뮤니티 인사이트</Text>
        {commentsLoading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : commentsError ? (
          <View style={styles.commentError}>
            <Text style={styles.commentErrorTitle}>댓글을 불러오지 못했습니다.</Text>
            <Text style={styles.commentErrorBody}>{commentsError}</Text>
          </View>
        ) : (
          <View style={styles.commentList}>
            {comments.length === 0 ? (
              <Text style={styles.commentEmpty}>첫 번째 의견을 남겨주세요.</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Text style={styles.commentTag}>{comment.toneTag}</Text>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  <Text style={styles.commentMeta}>
                    {comment.authorName ?? '익명'} | {formatDateTime(comment.createdAt)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.commentTitle}>의견 남기기</Text>
        <View style={styles.tagPicker}>
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
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    padding: spacing(5),
    gap: spacing(6),
    paddingBottom: spacing(15),
  },
  carouselContainer: {
    position: 'relative',
    height: 280,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfacePrimary,
  },
  carousel: {
    flexGrow: 0,
  },
  carouselImage: {
    height: 280,
    borderRadius: radii.xl,
  },
  carouselFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderSubtle,
  },
  carouselFallbackText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  carouselIndicator: {
    position: 'absolute',
    right: spacing(3),
    bottom: spacing(3),
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(31, 27, 22, 0.75)',
  },
  carouselIndicatorText: {
    color: colors.surfacePrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    gap: spacing(3),
  },
  brand: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    ...typography.heading1,
    fontSize: 26,
  },
  meta: {
    ...typography.caption,
    fontSize: 13,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  category: {
    backgroundColor: colors.textPrimary,
    color: colors.surfacePrimary,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
    fontSize: 12,
  },
  postTag: {
    marginRight: spacing(2),
    color: colors.textMuted,
    fontWeight: '600',
  },
  body: {
    ...typography.body,
    lineHeight: 22,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  shareButton: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfacePrimary,
  },
  shareButtonLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.accentStrong,
  },
  commentTitle: {
    ...typography.heading2,
    fontSize: 20,
  },
  commentList: {
    gap: spacing(3),
  },
  commentEmpty: {
    ...typography.body,
    textAlign: 'center',
  },
  commentCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: spacing(2),
    ...shadows.card,
  },
  commentTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.textPrimary,
    color: colors.surfacePrimary,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
    fontSize: 12,
  },
  commentContent: {
    ...typography.body,
  },
  commentMeta: {
    ...typography.caption,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing(4),
    minHeight: 120,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  commentError: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    padding: spacing(4),
    gap: spacing(2),
    borderWidth: 1,
    borderColor: colors.danger,
  },
  commentErrorTitle: {
    fontWeight: '700',
    color: colors.danger,
  },
  commentErrorBody: {
    ...typography.body,
  },
  tagPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
});

export default PostDetailScreen;
