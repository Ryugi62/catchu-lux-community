import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { Post } from '../types';
import { getPostById, updatePost } from '../api';
import { useAuth } from '../../auth/hooks/useAuth';

interface UseEditablePostOptions {
  enableEditing?: boolean;
}

interface EditablePostState {
  original: Post | null;
  draft: Post | null;
  isOwner: boolean;
  isLoading: boolean;
  hasChanges: boolean;
  setDraft: (next: Post) => void;
  updateDraft: (updates: Partial<Post>) => void;
  saveChanges: (updates?: Partial<Post>) => Promise<boolean>;
}

export const useEditablePost = (
  postId: string,
  { enableEditing = true }: UseEditablePostOptions = {}
): EditablePostState => {
  const { user } = useAuth();
  const [original, setOriginal] = useState<Post | null>(null);
  const [draft, setDraft] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    (async () => {
      const post = await getPostById(postId);
      if (!active) {
        return;
      }
      setOriginal(post);
      setDraft(post);
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [postId]);

  const isOwner = useMemo(() => {
    if (!original || !user) {
      return false;
    }
    return original.authorId === user.uid;
  }, [original, user]);

  const hasChanges = useMemo(() => {
    if (!original || !draft) {
      return false;
    }
    return (
      original.title !== draft.title ||
      original.brand !== draft.brand ||
      original.category !== draft.category ||
      original.content !== draft.content ||
      JSON.stringify(original.tags) !== JSON.stringify(draft.tags) ||
      JSON.stringify(original.imageUrls) !== JSON.stringify(draft.imageUrls)
    );
  }, [original, draft]);

  const saveChanges = async (updates?: Partial<Post>) => {
    if (!enableEditing || !draft || !isOwner) {
      return false;
    }
    const nextDraft = updates ? { ...draft, ...updates } : draft;
    try {
      await updatePost({
        postId,
        title: nextDraft.title,
        brand: nextDraft.brand,
        category: nextDraft.category,
        tags: nextDraft.tags,
        content: nextDraft.content,
        imageUrls: nextDraft.imageUrls,
      });
      setOriginal(nextDraft);
      setDraft(nextDraft);
      return true;
    } catch (error) {
      Alert.alert('수정 실패', '게시글을 수정하는 중 문제가 발생했습니다.');
      return false;
    }
  };

  return {
    original,
    draft,
    isOwner,
    isLoading,
    hasChanges,
    setDraft: (next: Post) => setDraft(next),
    updateDraft: (updates: Partial<Post>) =>
      setDraft((prev) => (prev ? { ...prev, ...updates } : prev)),
    saveChanges,
  };
};
