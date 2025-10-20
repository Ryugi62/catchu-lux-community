import { useEffect, useState } from 'react';
import { listenToComments } from '../features/comments/api';
import type { Comment } from '../features/posts/types';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToComments(
      postId,
      (incoming) => {
        setErrorMessage(null);
        setComments(incoming);
        setIsLoading(false);
      },
      {
        onError: (error) => {
          console.error(`[useComments] listen error for post ${postId}`, error);
          setIsLoading(false);
          setErrorMessage('댓글을 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.');
        },
      }
    );

    return unsubscribe;
  }, [postId]);

  return { comments, isLoading, errorMessage };
};
