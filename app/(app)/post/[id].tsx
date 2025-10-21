import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useEditablePost } from '../../../src/modules/posts/hooks/useEditablePost';
import { useComments, createComment } from '../../../src/modules/comments';
import { useEditableComment } from '../../../src/modules/comments/hooks/useEditableComment';
import type { Comment } from '../../../src/modules/comments/types';
import { useAuth } from '../../../src/modules/auth';
import { TagChip } from '../../../src/components/ui/TagChip';
import { Button } from '../../../src/components/ui/Button';
import { StatPill } from '../../../src/components/ui/StatPill';
import { colors, radii, shadows, spacing, typography } from '../../../src/theme';

const windowWidth = Dimensions.get('window').width;

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Array.isArray(id) ? id[0] : id ?? '';

  const {
    draft,
    saveChanges,
    isOwner,
    isLoading,
  } = useEditablePost(postId);
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

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setActiveImageIndex(0);
  }, [postId]);

  useEffect(() => {
    if (draft) {
      setEditTitle(draft.title);
      setEditContent(draft.content);
    }
  }, [draft]);

  const post = draft;

  const postImageWidth = useMemo(() => windowWidth - spacing(5) * 2, []);
  const postHasLocalChanges = useMemo(() => {
    if (!post) {
      return false;
    }
    return post.title !== editTitle || post.content !== editContent;
  }, [post, editTitle, editContent]);

  const handleSubmitComment = async () => {
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

  const startEdit = () => {
    if (!post) {
      return;
    }
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditingPost(true);
  };

  const cancelEdit = () => {
    if (post) {
      setEditTitle(post.title);
      setEditContent(post.content);
    }
    setIsEditingPost(false);
  };

  const handleSavePost = async () => {
    if (!post || !postHasLocalChanges) {
      return;
    }
    setIsSavingPost(true);
    const success = await saveChanges({ title: editTitle.trim(), content: editContent.trim() });
    setIsSavingPost(false);
    if (success) {
      setIsEditingPost(false);
    }
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
      <LinearGradient
        colors={['#f8efe4', '#fdf9f4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {isEditingPost ? (
          <TextInput
            value={editTitle}
            onChangeText={setEditTitle}
            style={styles.editTitleInput}
            placeholder="제목을 입력하세요"
          />
        ) : (
          <Text style={styles.title}>{post.title}</Text>
        )}
        <View style={styles.headerMetaRow}>
          <Text style={styles.brand}>{post.brand}</Text>
          {isOwner ? (
            <View style={styles.editActions}>
              {isEditingPost ? (
                <>
                  <Pressable
                    style={[
                      styles.editButton,
                      (!postHasLocalChanges || isSavingPost) && styles.editButtonDisabled,
                    ]}
                    onPress={handleSavePost}
                    disabled={!postHasLocalChanges || isSavingPost}
                  >
                    <Text style={styles.editButtonText}>{isSavingPost ? '저장 중...' : '저장'}</Text>
                  </Pressable>
                  <Pressable style={styles.editButtonSecondary} onPress={cancelEdit}>
                    <Text style={styles.editButtonSecondaryText}>취소</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={styles.editButton} onPress={startEdit}>
                  <Text style={styles.editButtonText}>수정</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
        <View style={styles.statRow}>
          <StatPill label="댓글" value={comments.length} />
          <StatPill label="좋아요" value={post.likeCount ?? 0} accent="muted" />
          <StatPill label="작성일" value={formatDateTime(post.createdAt)} accent="muted" />
        </View>
      </LinearGradient>

      {post.imageUrls.length > 0 ? (
        <View style={styles.carouselContainer}>
          <FlatList
            data={post.imageUrls}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={[styles.carouselImage, { width: postImageWidth }]} resizeMode="cover" />
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
        {isEditingPost ? (
          <TextInput
            value={editContent}
            onChangeText={setEditContent}
            multiline
            numberOfLines={6}
            style={styles.editContentInput}
            placeholder="내용을 입력하세요"
          />
        ) : (
          <Text style={styles.body}>{post.content}</Text>
        )}
        <View style={styles.shareRow}>
          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonLabel}>공유하기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.commentTitle}>커뮤니티 인사이트</Text>
        <Text style={styles.commentSubtitle}>{comments.length}개의 의견</Text>
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
                <EditableCommentRow key={comment.id} postId={postId} comment={comment} />
              ))
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.commentTitle}>의견 남기기</Text>
        <Text style={styles.commentSubtitle}>톤 태그를 선택하고 진솔한 이야기를 들려주세요.</Text>
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
        <Button label={submitting ? '등록 중...' : '댓글 작성'} onPress={handleSubmitComment} disabled={submitting} />
      </View>
    </ScrollView>
  );
};

const EditableCommentRow: React.FC<{ postId: string; comment: Comment }> = ({ postId, comment }) => {
  const {
    draftContent,
    setDraftContent,
    draftTone,
    setDraftTone,
    isOwner,
    hasChanges,
    isSaving,
    save,
  } = useEditableComment({ postId, comment });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    const success = await save();
    if (success) {
      setIsEditing(false);
    }
  };

  if (!isOwner || !isEditing) {
    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentTag}>{comment.toneTag}</Text>
          {isOwner ? (
            <Pressable style={styles.commentEditButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.commentEditText}>수정</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <Text style={styles.commentMeta}>
          {comment.authorName ?? '익명'} | {comment.createdAt ? comment.createdAt.toLocaleString('ko-KR') : '방금 전'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.tagPicker}>
          {COMMENT_TAGS.map((tag) => (
            <TagChip key={tag} label={tag} selected={draftTone === tag} onPress={() => setDraftTone(tag)} />
          ))}
        </View>
      </View>
      <TextInput
        value={draftContent}
        onChangeText={setDraftContent}
        multiline
        numberOfLines={3}
        style={styles.commentEditInput}
        placeholder="댓글을 수정하세요"
      />
      <View style={styles.commentEditActions}>
        <Pressable
          style={[styles.commentEditPrimary, (!hasChanges || isSaving) && styles.commentEditDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          <Text style={styles.commentEditPrimaryText}>저장</Text>
        </Pressable>
        <Pressable style={styles.commentEditSecondary} onPress={() => setIsEditing(false)}>
          <Text style={styles.commentEditSecondaryText}>취소</Text>
        </Pressable>
      </View>
    </View>
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
  headerGradient: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(3),
    paddingBottom: spacing(4),
    gap: spacing(3),
    borderRadius: radii.xl,
  },
  headerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: colors.surfacePrimary,
    padding: spacing(4),
    borderRadius: radii.lg,
    ...shadows.card,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
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
  editTitleInput: {
    ...typography.heading1,
    fontSize: 24,
    borderBottomWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing(1),
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  editButton: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
  },
  editButtonDisabled: {
    opacity: 0.4,
  },
  editButtonText: {
    color: colors.surfacePrimary,
    fontWeight: '600',
  },
  editButtonSecondary: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  editButtonSecondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
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
  editContentInput: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing(4),
    textAlignVertical: 'top',
    minHeight: 160,
    lineHeight: 22,
    color: colors.textPrimary,
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
  commentSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  commentList: {
    gap: spacing(3),
  },
  commentEmpty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  commentCard: {
    gap: spacing(2),
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.md,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentEditButton: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.5),
  },
  commentEditText: {
    color: colors.accent,
    fontWeight: '600',
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
    color: colors.textMuted,
  },
  commentEditInput: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing(3),
    textAlignVertical: 'top',
  },
  commentEditActions: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  commentEditPrimary: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
  },
  commentEditDisabled: {
    opacity: 0.4,
  },
  commentEditPrimaryText: {
    color: colors.surfacePrimary,
    fontWeight: '600',
  },
  commentEditSecondary: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  commentEditSecondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
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
});

export default PostDetailScreen;
