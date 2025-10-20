import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { fetchPostsPage, listenToLatestPosts } from '../api';
import type { Post } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

const PAGE_SIZE = 20;

export const usePostsFeed = () => {
  const [livePosts, setLivePosts] = useState<Post[]>([]);
  const [historicalPosts, setHistoricalPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [latestCursor, setLatestCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [paginationCursor, setPaginationCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!user) {
      if (!isAuthLoading) {
        setIsLoading(false);
      }
      setLivePosts([]);
      setHistoricalPosts([]);
      setLatestCursor(null);
      setPaginationCursor(null);
      setErrorMessage(null);
      setHasMore(true);
      return;
    }

    setIsLoading(true);
    setHistoricalPosts([]);
    setPaginationCursor(null);
    setHasMore(true);

    const unsubscribe = listenToLatestPosts(
      ({ posts, cursor }) => {
        setErrorMessage(null);
        setLivePosts(posts);
        setLatestCursor(cursor);
        setIsLoading(false);
      },
      {
        pageSize: PAGE_SIZE,
        onError: (error) => {
          console.error('[usePostsFeed] listen error', error);
          setIsLoading(false);
          if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
            setErrorMessage('접근 권한이 없습니다. 로그인 상태와 Firestore 규칙을 확인해주세요.');
            return;
          }
          setErrorMessage('피드를 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 새로고침해주세요.');
        },
      }
    );

    return unsubscribe;
  }, [user, isAuthLoading, refreshToken]);

  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore) {
      return;
    }
    const startCursor = paginationCursor ?? latestCursor;
    if (!startCursor) {
      setHasMore(false);
      return;
    }

    try {
      setIsFetchingMore(true);
      const { posts, cursor, hasMore: nextHasMore } = await fetchPostsPage({
        cursor: startCursor,
        pageSize: PAGE_SIZE,
      });

      if (posts.length === 0) {
        setHasMore(false);
        return;
      }

      setHistoricalPosts((prev) => {
        const existingIds = new Set([...livePosts, ...prev].map((item) => item.id));
        const uniqueNext = posts.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueNext];
      });

      setPaginationCursor(cursor);
      if (!nextHasMore) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('[usePostsFeed] loadMore error', error);
      setErrorMessage('더 많은 게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, paginationCursor, latestCursor, livePosts]);

  const refresh = useCallback(() => {
    if (!user) {
      setLivePosts([]);
      setHistoricalPosts([]);
      setLatestCursor(null);
      setPaginationCursor(null);
      setHasMore(true);
      setErrorMessage(null);
      return;
    }
    setIsLoading(true);
    setRefreshToken((value) => value + 1);
  }, [user]);

  const filteredPosts = useMemo(() => {
    const combined = [...livePosts, ...historicalPosts];
    const seen = new Set<string>();
    const ordered = combined.filter((post) => {
      if (seen.has(post.id)) {
        return false;
      }
      seen.add(post.id);
      return true;
    });

    return ordered.filter((post) => {
      if (brandFilter && post.brand !== brandFilter) {
        return false;
      }
      if (categoryFilter && post.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [livePosts, historicalPosts, brandFilter, categoryFilter]);

  return {
    posts: filteredPosts,
    isLoading,
    errorMessage,
    loadMore,
    hasMore,
    isFetchingMore,
    refresh,
    brandFilter,
    setBrandFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilter: Boolean(brandFilter || categoryFilter),
    clearFilters: () => {
      setBrandFilter(null);
      setCategoryFilter(null);
      refresh();
    },
  };
};
