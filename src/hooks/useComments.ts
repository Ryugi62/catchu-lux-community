import { useEffect, useState } from 'react';
import { listenToComments } from '../features/comments/api';
import type { Comment } from '../features/posts/types';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToComments(postId, (incoming) => {
      setComments(incoming);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [postId]);

  return { comments, isLoading };
};
