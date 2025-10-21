import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { Comment } from '../types';
import { updateComment } from '../api';
import { useAuth } from '../../auth/hooks/useAuth';

interface UseEditableCommentParams {
  postId: string;
  comment: Comment;
}

export const useEditableComment = ({ postId, comment }: UseEditableCommentParams) => {
  const { user } = useAuth();
  const [draftContent, setDraftContent] = useState(comment.content);
  const [draftTone, setDraftTone] = useState(comment.toneTag);
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = useMemo(() => user?.uid === comment.authorId, [user?.uid, comment.authorId]);
  const hasChanges = useMemo(
    () => draftContent.trim() !== comment.content || draftTone !== comment.toneTag,
    [draftContent, draftTone, comment.content, comment.toneTag]
  );

  const save = async () => {
    if (!isOwner || !hasChanges) {
      return false;
    }
    try {
      setIsSaving(true);
      await updateComment({
        postId,
        commentId: comment.id,
        content: draftContent.trim(),
        toneTag: draftTone,
      });
      return true;
    } catch (error) {
      Alert.alert('수정 실패', '댓글을 수정하는 중 문제가 발생했습니다.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    draftContent,
    setDraftContent,
    draftTone,
    setDraftTone,
    isOwner,
    hasChanges,
    isSaving,
    save,
  };
};
